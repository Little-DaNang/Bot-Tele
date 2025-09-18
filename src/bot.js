//require('dotenv').config();
//const { Telegraf } = require('telegraf');
//const axios = require('axios');
//const { askAI } = require('./ai');
//
//const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
//
//const activeChats = {};
//
//const handleReply = async (ctx) => {
//    const userMessage = ctx.message.text;
//    if(!userMessage.includes('@little_danang_saigon_bot')){
//        return
//    }
//    let contentAsk = userMessage.replace('@little_danang_saigon_bot', '');
//     const msg =await askAI(contentAsk)
//    if(msg){
//        ctx.reply(msg, { reply_to_message_id: ctx.message.message_id, parse_mode: 'HTML' });
//    }
//
//	 try {
//
//	    // Prepare the request body as required
//	    const requestBody = {
//          model: 'gpt-local',
//          messages: [
//            {
//              "role": "system",
//              "content": "Bạn là một chuyên gia. Hãy trả lời nội dung do người dùng gửi. Trả về kết quả DUY NHẤT DƯỚI DẠNG JSON với đúng một trường: \"message\" (lý do bằng tiếng Việt, kiểu chuỗi). Không thêm bất kỳ nội dung nào khác ngoài JSON."
//            },
//            {
//              role: 'user',
//              content: userMessage.replace('@little_danang_saigon_bot', '')
//            }
//          ],
//          temperature: 0.3,
//          max_tokens: 550,
//          response_format: { type: 'json_object' }
//        };
//
////		console.log('Request:', requestBody);
//	    // Send POST request to the API with Authorization header
//	    const response = await axios.post(
//	      process.env.OPENAI_API_URL,,
//	      requestBody,
//	      {
//	        headers: {
//	          'Authorization': `Bearer ${process.env.OPENAI_API_SSK}`,
//	          'Content-Type': 'application/json'
//	        }
//	      }
//	    );
//	    // Parse the nested JSON in response.data.choices[0].message.content
//	    let scoreReply;
//	    try {
//	      const content = response.data.choices?.[0]?.message?.content;
////	      console.log('Response:', content);
//	      if (content) {
//	        const parsed = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
//	        if(typeof parsed.message !== 'undefined'){
//	            ctx.reply(parsed.message, { reply_to_message_id: ctx.message.message_id, parse_mode: 'HTML' });
//	        }
//	      }
//	    } catch (e) {
//	      // ignore parse error, fallback to default reply
//	    }
//	  } catch (error) {
//	    ctx.reply('Error: ' + (error.response?.data?.message || error.message));
//	  }
//}
//const handleCallPoint = async (ctx) => {
//
//  try {
//    const userMessage = ctx.message.text;
//    // Prepare the request body as required
//    const requestBody = {
//      model: 'gpt-local',
//      messages: [
//        {
//          role: 'system',
//          content: 'Bạn là một nhân viên chấm điểm nội dung.Hãy đánh giá nội dung do người dùng gửi dựa trên các tiêu chí: thông tin đó có hữu ích cho người khác, mang lại tiếng cười, niềm vui, cho điểm số âm nếu thông tin tiêu cực cho điểm số 0 nếu thông tin bình thường, không hữu ích, không mang lại niềm vui, tiếng cười. Trả về kết quả DUY NHẤT DƯỚI DẠNG JSON với đúng hai trường: "score" (điểm từ -10 đến 10, kiểu số) và "reason" (lý do ngắn gọn bằng tiếng Việt, kiểu chuỗi). Không thêm bất kỳ nội dung nào khác ngoài JSON. Nếu ai commend bot ngu hoặc yêu thì cho điểm 0 và lý do "không mang lại giá trị". '
//        },
//        {
//          role: 'user',
//          content: userMessage
//        }
//      ],
//      temperature: 0.3,
//      max_tokens: 150,
//      response_format: { type: 'json_object' }
//    };
//    // Send POST request to the API with Authorization header
//    const response = await axios.post(
//      process.env.OPENAI_API_URL,,
//      requestBody,
//      {
//        headers: {
//          'Authorization': `Bearer ${process.env.OPENAI_API_SSK}`,
//          'Content-Type': 'application/json'
//        }
//      }
//    );
//    // Parse the nested JSON in response.data.choices[0].message.content
//    let scoreReply;
//    try {
//      const content = response.data.choices?.[0]?.message?.content;
//
//      if (content) {
//        const parsed = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
//        if(typeof parsed.score !== 'undefined'){
//	        console.log('message:', parsed.score , userMessage, parsed.reason);
//        }
//        if (typeof parsed.score !== 'undefined' && parsed.score !== 0) {
//          const scorePrefix = parsed.score > 0 ? '+' : '';
//          const emoji = parsed.score > 0 ? '🟢' : '🔴';
//          // Get the sender's username or fallback to first_name
//          let sender = ctx.message.from.username
//            ? '@' + ctx.message.from.username
//            : ctx.message.from.first_name || 'user';
//          scoreReply = `${emoji} ${sender} <b>${scorePrefix}${parsed.score}</b> (${parsed.reason})`;
//        }
//      }
//    } catch (e) {
//      // ignore parse error, fallback to default reply
//    }
//    // Reply with score & reason if score != 0, else fallback
//    if (scoreReply) {
//      ctx.reply(scoreReply, { reply_to_message_id: ctx.message.message_id, parse_mode: 'HTML' });
//    }
//  } catch (error) {
//    ctx.reply('Error: ' + (error.response?.data?.message || error.message));
//  }
//}
//
//bot.command('active', (ctx) => {
//  const chatId = ctx.chat.id;
//  activeChats[chatId] = true;
//  ctx.reply('Bot is now active in this chat.');
//});
//
//bot.command('deactive', (ctx) => {
//  console.log('Deactivating bot in chat:', ctx.chat.id);
//  const chatId = ctx.chat.id;
//  activeChats[chatId] = false;
//  ctx.reply('Bot is now deactivated in this chat.');
//});
//
//bot.command('addrule', (ctx) => {
//  console.log('Deactivating bot in chat:', ctx.chat.id);
//  const chatId = ctx.chat.id;
//  activeChats[chatId] = false;
//  ctx.reply('Bot is now deactivated in this chat.');
//});
//
//bot.command('removerule', (ctx) => {
//  console.log('Deactivating bot in chat:', ctx.chat.id);
//  const chatId = ctx.chat.id;
//  activeChats[chatId] = false;
//  ctx.reply('Bot is now deactivated in this chat.');
//});
//
//
//// Listen to all messages in groups
//bot.on('text', async (ctx) => {
//  const chatId = ctx.chat.id;
//  if (activeChats[chatId] !== true) {
//    // Bot is deactivated in this chat, ignore text
//    return;
//  }
//  handleReply(ctx);
//  handleCallPoint(ctx);
//});
//
//bot.launch();
//
//process.once('SIGINT', () => bot.stop('SIGINT'));
//process.once('SIGTERM', () => bot.stop('SIGTERM'));
//
//console.log('Bot is running...');
