# feature
- chấm điểm bot +-
- hỏi bot
- thêm rule/xoá bớt rule
- tóm tắt nội dung

# structure

# setup
npm install
```bash
npm install
```
create .env file
```bash
cp .env.example .env
```
edit .env file with your configuration

run project
```bash
npm start
```


# build
build ra image
```bash
docker build --platform linux/amd64 -t little-danang-saigon-bot .

```
[//]: # (docker build -t little-danang-saigon-bot .)
export image
```bash
docker save little-danang-saigon-bot > little-danang-saigon-bot.tar
```
run test thử
```bash 
docker run --env-file .env little-danang-saigon-bot
```
# deploy
upload image to server
```bash
scp little-danang-saigon-bot.tar user@server:/path/to/deploy
```
import image on server
```bash
docker load < little-danang-saigon-bot.tar
```
run on server
```bash
docker run --env-file .env -d --restart unless-stopped little-danang-saigon
```

ssh -i ~/.ssh/id_rsa root@68.183.182.178
```bash
scp -i ~/.ssh/id_rsa -r ./little-danang-saigon-bot.tar root@68.183.182.178:/root/little_danang/little-danang-saigon-bot.tar
```

scp -i ~/.ssh/id_rsa -r ./docker-compose.yml root@68.183.182.178:/root/little_danang/docker-compose.yml
scp -i ~/.ssh/id_rsa -r ./.env root@68.183.182.178:/root/little_danang/.env

ssh -i ~/.ssh/id_rsa root@68.183.182.178
cd /root/little_danang/
docker load -i little-danang-saigon-bot.tar
docker compose down && docker compose up -d 

