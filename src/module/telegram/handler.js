const db = require('../../db/db');
const utils = require('./utils');


const handleAddGroup = (ctx) => {
//  console.log('Activating bot in chat:', ctx.chat.id);
  let chatId = utils.getChatId(ctx);

  let group = db.getGroup(chatId);
  let username = utils.getUsername(ctx);
  if(group){
    if(db.isAdmin(chatId,username)){
        db.setEnable(chatId,true);
        ctx.reply('Bot is active in this chat.');
    }else{
    	ctx.reply('Only admins can activate the bot in this chat.');
    }
    return
  }

  if (chatId && username) {
      db.addGroup({ chatId, enable: true, admins: [username], rules: [] });
  }
  ctx.reply('Bot is now active in this chat.');
}

const handleRemoveGroup = (ctx) => {
  console.log('Deactivating bot in chat:', ctx.chat.id);
  const chatId = utils.getChatId(ctx);
  let username = utils.getUsername(ctx);

  if (chatId && username) {
     if(db.isAdmin(chatId,username)){
        db.removeGroup(chatId);
        ctx.reply('Bot is now deactivated in this chat.');
     }else{
        ctx.reply('Only admins can deactivate the bot in this chat.');
    }
  }
}

const  handleActivateGroup = (ctx) => {
  console.log('Activating bot in chat:', ctx.chat.id);
  const chatId = utils.getChatId(ctx);
  let username = utils.getUsername(ctx);
  if (chatId && username) {
	 if(db.isAdmin(chatId,username)){
		db.setEnable(chatId,true);
		ctx.reply('Bot is now active in this chat.');
	 }else{
		ctx.reply('Only admins can activate the bot in this chat.');
	 }
  }
}

const handleDeactivateGroup = (ctx) => {
  console.log('Deactivating bot in chat:', ctx.chat.id);
  const chatId = utils.getChatId(ctx);
  let username = utils.getUsername(ctx);
  if (chatId && username) {
	 if(db.isAdmin(chatId,username)){
		db.setEnable(chatId,false);
		ctx.reply('Bot is now deactivated in this chat.');
	 }else{
		ctx.reply('Only admins can deactivate the bot in this chat.');
	 }
  }
}

const handleShowRules = (ctx) => {
  console.log('Showing rules in chat:', ctx.chat.id);
  const chatId = utils.getChatId(ctx);
  let username = utils.getUsername(ctx);
  if (chatId && username) {
	 {
		let group = db.getGroup(chatId);
		if(!group || !group.rules || group.rules.length === 0){
			ctx.reply('No rules set for this chat.');
			return;
		}
		let rulesText = 'Rules for this chat:\n';
		group.rules.forEach((rule, index) => {
			rulesText += `${index + 1}. ${rule}\n`;
		});
		ctx.reply(rulesText);
	 }
  }
}

const handleAddRule = (ctx) => {
  console.log('Adding rule in chat:', ctx.chat.id);
  const chatId = utils.getChatId(ctx);
  let username = utils.getUsername(ctx);
  let rule = ctx.message.text.split(' ').slice(1).join(' ').trim();
//  let rule = ctx.message.text.trim();
  if (chatId && username && rule) {
	 if(db.isAdmin(chatId,username)){
		if(db.addRule(chatId,rule)){
			ctx.reply('Rule added.');
		}else{
			ctx.reply('Failed to add rule. Make sure the bot is active in this chat.');
		}
	 }else{
		ctx.reply('Only admins can add rules in this chat.');
	 }
  }
}

const handleRemoveRule = (ctx) => {
  console.log('Removing rule in chat:', ctx.chat.id);
  const chatId = utils.getChatId(ctx);
  let username = utils.getUsername(ctx);
  let rule = ctx.message.text.split(' ').slice(1).join(' ').trim();

//  let rule = ctx.message.text.trim();
  if (chatId && username && rule) {
  	 if(db.isAdmin(chatId,username)){
        if(db.removeRule(chatId,rule)){
            ctx.reply('Rule removed.');
        }
  	 }else{
  	   ctx.reply('Only admins can remove rules in this chat.');
  	 }
  }
}

const handleShowPoints = (ctx) => {
  console.log('Showing points in chat:', ctx.chat.id);
  const chatId = utils.getChatId(ctx);
  let username = utils.getUsername(ctx);
  if (chatId && username) {
	 {
		let points = db.getPoints(chatId);
		if(!points || points.length === 0){
			ctx.reply('No points data for this chat.');
			return;
		}
		let pointsText = 'List token:\n';
		points.forEach((member) => {
			let memberName = Object.keys(member)[0];
			let memberPoints = member[memberName];
			pointsText += `@${memberName}: ${memberPoints}\n`;
		});
		ctx.reply(pointsText);
	 }
  }
}

const handleAddAdmin = (ctx) => {
  const chatId = utils.getChatId(ctx);
  const username = utils.getUsername(ctx);
  const newAdmin = ctx.message.text.split(' ').slice(1)[0]?.replace('@', '');

  if (chatId && username && newAdmin) {
    if (db.isAdmin(chatId, username)) {
      if (db.addAdmin(chatId, newAdmin)) {
        ctx.reply(`@${newAdmin} is now an admin.`);
      } else {
        ctx.reply('Failed to add admin. Make sure the user is valid and not already an admin.');
      }
    } else {
      ctx.reply('Only admins can add new admins.');
    }
  }
};

const handleRemoveAdmin = (ctx) => {
  const chatId = utils.getChatId(ctx);
  const username = utils.getUsername(ctx);
  const adminToRemove = ctx.message.text.split(' ').slice(1)[0]?.replace('@', '');

  if (chatId && username && adminToRemove) {
    if (db.isAdmin(chatId, username)) {
      if (db.removeAdmin(chatId, adminToRemove)) {
        ctx.reply(`@${adminToRemove} is no longer an admin.`);
      } else {
        ctx.reply('Failed to remove admin. Make sure the user is an admin.');
      }
    } else {
      ctx.reply('Only admins can remove admins.');
    }
  }
};

module.exports = {
  handleAddGroup,
  handleRemoveGroup,
  handleActivateGroup,
  handleDeactivateGroup,
  handleShowRules,
  handleAddRule,
  handleRemoveRule,
  handleShowPoints,
  handleAddAdmin,
  handleRemoveAdmin
}
