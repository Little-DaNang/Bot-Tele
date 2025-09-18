require('dotenv').config();
const axios = require('axios');

const chatComplete = async (requestBody) => {
//	console.log('chatComplete:', requestBody);
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
    return response;
}
const callPointAI = async (userMessage) => {
  const content_system_role = 'Bạn là một nhân viên chấm điểm nội dung.Hãy đánh giá nội dung do người dùng gửi dựa trên các tiêu chí: thông tin đó có hữu ích cho người khác, mang lại tiếng cười, niềm vui, cho điểm số âm nếu thông tin tiêu cực cho điểm số 0 nếu thông tin bình thường, không hữu ích, không mang lại niềm vui, tiếng cười. Trả về kết quả DUY NHẤT DƯỚI DẠNG JSON với đúng hai trường: "score" (điểm từ -10 đến 10, kiểu số) và "reason" (lý do ngắn gọn bằng tiếng Việt, kiểu chuỗi). Không thêm bất kỳ nội dung nào khác ngoài JSON. Nếu ai commend bot ngu hoặc yêu thì cho điểm 0 và lý do "không mang lại giá trị". '
  try {
    const userMessage = ctx.message.text;
    // Prepare the request body as required
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
      max_tokens: 150,
      response_format: { type: 'json_object' }
    };
    // Send POST request to the API with Authorization header
    const response = await chatComplete(requestBody);
    // Parse the nested JSON in response.data.choices[0].message.content
    let scoreReply;
    try {
      const content = response.data.choices?.[0]?.message?.content;

      if (content) {
        const parsed = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
        if(typeof parsed.score !== 'undefined'){
//	        console.log('message:', parsed.score , userMessage, parsed.reason);
        }
        if (typeof parsed.score !== 'undefined' && parsed.score !== 0) {
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
  } catch (error) {
    ctx.reply('Error: ' + (error.response?.data?.message || error.message));
  }
}

const askAI = async (contentAsk) => {
	const content_system_role = ''
		+ 'Bạn là một chuyên gia. Hãy trả lời nội dung do người dùng gửi. '
		+ 'Trả về kết quả DUY NHẤT DƯỚI DẠNG JSON với đúng một trường: "message" (lý do bằng tiếng Việt, kiểu chuỗi). '
		+ 'Không thêm bất kỳ nội dung nào khác ngoài JSON.';
	try {
		// Prepare the request body as required
		const requestBody = {
		  model: 'gpt-local',
		  messages: [
		    {"role": "system","content": content_system_role},
		    {role: 'user',content: contentAsk}
		  ],
		  temperature: 0.3,
		  max_tokens: 550,
		  response_format: { type: 'json_object' }
		};
		// Send POST request to the API with Authorization header
	    const response = await chatComplete(requestBody);
		// Parse the nested JSON in response.data.choices[0].message.content
		try {
		  const content = response.data.choices?.[0]?.message?.content;
		  if (content) {
		    const parsed = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
		    if(typeof parsed.message !== 'undefined'){
		        return parsed.message;
		    }
          }
       } catch (e) {
       	   // ignore parse error, fallback to default reply
       	   throw e
       }
    } catch (e) {
        // ignore parse error, fallback to default reply
        return e
    }
	return null;
}

module.exports = { callPointAI, askAI, chatComplete };
