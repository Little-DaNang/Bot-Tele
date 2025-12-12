const utils = require('./../telegram/utils');
const db = require('../../db/db');
const {askAI } = require('../../ai');

const handleAskAI = async (ctx) => {
	// let enable = db.isEnable(utils.getChatId(ctx));
	// console.log('Enable AI:', enable);
	// if(!enable){
	// 	return;
	// }
	
	let key = process.env.TELEGRAM_BOT_USERNAME || '@little_danang_saigon_bot';
	let message = ctx.message.text;
	let isAsk = message.includes(key) || message.startsWith('/ask');
	let contentAsk = message.replace(key,'').replace('/ask','').trim();
	if(isAsk && contentAsk){
		let message = await askAI(contentAsk)
		ctx.reply(message, { reply_to_message_id: ctx.message.message_id, parse_mode: 'HTML' });
		return;
	}
}

module.exports = {
  handleAskAI
}
