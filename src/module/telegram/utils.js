/**
 * Get chatId from Telegraf ctx
 */
function getChatId(ctx) {
  return ctx?.chat?.id;
}

/**
 * Get userId from Telegraf ctx
 */
function getUserId(ctx) {
  return ctx?.from?.id;
}

/**
 * Get messageId from Telegraf ctx
 */
function getMessageId(ctx) {
  return ctx?.message?.message_id;
}

/**
 * Get username from Telegraf ctx
 */
function getUsername(ctx) {
  return ctx?.from?.username || null;
}

module.exports = {
  getChatId,
  getUserId,
  getMessageId,
  getUsername
};
