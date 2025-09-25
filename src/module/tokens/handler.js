const utils = require("../telegram/utils");
const db = require("../../db/db");

const handleGiftToken = async (ctx) => {
    const chatId = utils.getChatId(ctx);
    const senderUsername = utils.getUsername(ctx);
    const messageParts = ctx.message.text.trim().split(' ');

    // Validate command format
    if (messageParts.length !== 3 || !messageParts[1].startsWith('@')) {
        return ctx.reply('Invalid format. Use: /gift @username number');
    }

    const targetUsername = messageParts[1].replace('@', '');
    const amount = parseInt(messageParts[2], 10);

    if (isNaN(amount) || amount <= 0) {
        return ctx.reply('Please specify a valid token amount.');
    }
    if (senderUsername === targetUsername) {
        return ctx.reply('You cannot gift tokens to yourself.');
    }

    // Read points data
    const points = db.readPoints();
    const group = points.groups.find(g => g.chatId === chatId);
    const senderObj = group?.members.find(m => Object.keys(m)[0] === senderUsername);
    const recipientObj = group?.members.find(m => Object.keys(m)[0] === targetUsername);
    const senderBalance = senderObj ? senderObj[senderUsername] : 0;
    const recipientBalance = recipientObj ? recipientObj[targetUsername] : 0;

    if (senderBalance < amount) {
        return ctx.reply(`Mới có ${senderBalance} mà đòi gift ${amount}.`);
    }

    // Update balances
    db.addPoint(chatId, senderUsername, senderBalance - amount);
    db.addPoint(chatId, targetUsername, recipientBalance + amount);

    ctx.reply(`@${senderUsername} gifted ${amount} tokens to @${targetUsername}.`);
}

const handleAddToken = (ctx) => {
    const chatId = utils.getChatId(ctx);
    const adminUsername = utils.getUsername(ctx);
    const messageParts = ctx.message.text.trim().split(' ');

    // Validate command format
    if (messageParts.length !== 3 || !messageParts[1].startsWith('@')) {
        return ctx.reply('Invalid format. Use: /gift @username number');
    }

    const targetUsername = messageParts[1].replace('@', '');
    const amount = parseInt(messageParts[2], 10);

    if (isNaN(amount) || amount <= 0) {
        return ctx.reply('Please specify a valid token amount.');
    }

    if (!db.isAdmin(chatId, adminUsername)) {
        return ctx.reply('You do not have permission to add tokens.');
    }

    // Read points data
    const points = db.readPoints();
    const group = points.groups.find(g => g.chatId === chatId);
    const recipientObj = group?.members.find(m => Object.keys(m)[0] === targetUsername);
    const recipientBalance = recipientObj ? recipientObj[targetUsername] : 0;

    // Add tokens to recipient
    db.addPoint(chatId, targetUsername, recipientBalance + amount);

    ctx.reply(`Added ${amount} tokens to @${targetUsername}.`);
}

module.exports = {
    handleGiftToken,
    handleAddToken
}
