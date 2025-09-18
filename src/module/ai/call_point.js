const utils = require('./../telegram/utils');
const db = require('../../db/db');
const { chatComplete } = require('../../ai');
const axios = require('axios');

const handlePoint = async (ctx) => {
	let enable = db.isEnable(utils.getChatId(ctx));

	if(!enable){
		return;
	}
	let content_system_role =
	 'Bạn là một nhân viên chấm điểm nội dung. Trả về kết quả DUY NHẤT DƯỚI DẠNG JSON với đúng hai trường: "score" (điểm từ -10 đến 10, kiểu số) và "reason" (lý do ngắn gọn bằng tiếng Việt, kiểu chuỗi). Không thêm bất kỳ nội dung nào khác ngoài JSON. \n' +
	 'Hãy đánh giá nội dung do người dùng gửi dựa trên các tiêu chí sau: \n' +
	 db.getRules(utils.getChatId(ctx)).join('\n');
	let userMessage = ctx.message.text;
   const requestBody = {
      model: 'gpt-local',
      messages: [
        {
          role: 'system',
          content: content_system_role
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: 'json_object' }
    };

    // Send POST request to the API with Authorization header
    const response = await axios.post(
        process.env.OPENAI_API_URL,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_SSK}`,
          'Content-Type': 'application/json'
        }
      }
    );
	let scoreReply;
    try {
      const content = response.data.choices?.[0]?.message?.content;

      if (content) {
        const parsed = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
        if(typeof parsed.score !== 'undefined'){
//            console.log('message:', parsed.score , userMessage, parsed.reason);
        }
        if (typeof parsed.score !== 'undefined' && parsed.score !== 0) {

          db.addPoint(utils.getChatId(ctx), utils.getUsername(ctx), parsed.score);

          const scorePrefix = parsed.score > 0 ? '+' : '';
          const emoji = parsed.score > 0 ? '🟢' : '🔴';
          // Get the sender's username or fallback to first_name
          let sender = ctx.message.from.username
            ? '@' + ctx.message.from.username
            : ctx.message.from.first_name || 'user';
          scoreReply = `${emoji} ${sender} <b>${scorePrefix}${parsed.score}</b> (${parsed.reason})`;
        }
      }
    } catch (e) {
      // ignore parse error, fallback to default reply
    }
    // Reply with score & reason if score != 0, else fallback
    if (scoreReply) {
      ctx.reply(scoreReply, { reply_to_message_id: ctx.message.message_id, parse_mode: 'HTML' });
    }
}

module.exports = {
  handlePoint
}
