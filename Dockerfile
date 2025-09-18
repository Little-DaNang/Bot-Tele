# Stage 1: Install dependencies
FROM node:18-alpine AS deps

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Stage 2: Copy only necessary files and run
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code and required files
COPY src ./src
COPY index.js ./
COPY package.json ./
COPY data ./data
# COPY .env ./   # Uncomment if you want to include .env

# Use .env for environment variables
ENV NODE_ENV=production

# Expose no ports (Telegram bot is outbound only)

# Start the bot
CMD ["node", "index.js"]
