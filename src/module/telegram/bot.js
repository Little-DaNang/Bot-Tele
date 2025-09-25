const { Telegraf } = require('telegraf');
const { handleAddGroup, handleRemoveGroup,
handleActivateGroup, handleDeactivateGroup,
handleShowRules, handleAddRule, handleRemoveRule,
handleShowPoints, handleAddAdmin, handleRemoveAdmin } = require('./handler');

const { handleSummaryCollection, handleCommandSummary, handleSummaryPickTime } = require('./../summary/handler');
const { handleGiftToken, handleAddToken } = require('./../tokens/handler');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const { handleAskAI } = require('./../ai/ask');
const { handlePoint } = require('./../ai/call_point');

//thêm vào nhóm khác
bot.command('start', (ctx) => { handleAddGroup(ctx);});
bot.command('remove', (ctx) => { handleRemoveGroup(ctx);});

//add/remove admin
bot.command('addadmin', (ctx) => { handleAddAdmin(ctx); });
bot.command('removeadmin', (ctx) => { handleRemoveAdmin(ctx); });

//bật/tắt tạm thời trong nhóm
bot.command('activate', (ctx) => { handleActivateGroup(ctx); });
bot.command('deactivate', (ctx) => { handleDeactivateGroup(ctx); });

//xem thông tin quy tắc
bot.command('rules', (ctx) => { handleShowRules(ctx); });
bot.command('addrule', (ctx) => { handleAddRule(ctx); });
bot.command('removerule', (ctx) => { handleRemoveRule(ctx); });

//xem thông tin tokens
bot.command('tokens', (ctx) => { handleShowPoints(ctx); });

// tóm tắt trò chuyện gần đây
bot.command('summary', (ctx) => { handleCommandSummary(ctx); });
bot.command('gift', (ctx) => { handleGiftToken(ctx); });
bot.command('addTokens', (ctx) => { handleAddToken(ctx); });

// handle callback query for summary time selection
bot.on('callback_query', async (ctx) => {
  const data = ctx.update.callback_query.data;
  if (data && data.startsWith('summary_time_')) {
    await handleSummaryPickTime(ctx);
    await ctx.answerCbQuery(); // acknowledge the callback
  }
});

bot.on('text', async (ctx) => {
  handleAskAI(ctx);
  handlePoint(ctx);
  handleSummaryCollection(ctx);
});

const start = () => {
	bot.launch();

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

    console.log('Bot is running...');
}

module.exports = {
	start
}
