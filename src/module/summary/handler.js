const utils = require('../telegram/utils');
const { writeLog } = require('./writer');
const {readLogs} = require('./reader');
const axios = require("axios");
const handleSummaryCollection = async (ctx) => {
	//TODO tóm tắt cuộc trò chuyện gần đây trong nhóm
	let message = ctx.message.text;
	let username = utils.getUsername(ctx);
	let chatId = utils.getChatId(ctx);
	let time = Date.now();

	writeLog(chatId,time,{ time, username, message });
}
const handleCommandSummary = async (ctx) => {
	// gửi lại telegram một tin nhắn với các tùy chọn thời gian (1 giờ, 6 giờ, 12 giờ, 1 ngày, 3 ngày, 1 tuần)
	const options = {
		reply_markup: {
			inline_keyboard: [
				[
					{ text: '1 giờ', callback_data: 'summary_time_1h' },
					{ text: '2 giờ', callback_data: 'summary_time_2h' },
					{ text: '3 giờ', callback_data: 'summary_time_3h' }
				],
				[
					{ text: '6 giờ', callback_data: 'summary_time_6h' },
					{ text: '1 ngày', callback_data: 'summary_time_1d' },
					{ text: 'Cancel', callback_data: 'summary_time_cancel' }
				]
			]
		}
	};
	await ctx.reply('Vui lòng chọn khoảng thời gian để tóm tắt:', options);
}

const handleSummaryPickTime = async (ctx) => {
	// Parse callback_data to determine the time range
	const callbackData = ctx.update.callback_query.data;
	const chatId = utils.getChatId(ctx);
	const now = Date.now();
	let fromTime;
	let toTime = now;

	// remove message keyboard ctx.update.callback_query.message.message_id
	try{
		if (ctx.update.callback_query.message) {
			await ctx.telegram.deleteMessage(
				chatId,
				ctx.update.callback_query.message.message_id
			);
		}
	}catch (e) {

	}

	// Remove previous inline keyboard (button)
	// if (ctx.update.callback_query.message) {
	// 	await ctx.telegram.editMessageReplyMarkup(
	// 		chatId,
	// 		ctx.update.callback_query.message.message_id,
	// 		undefined,
	// 		null
	// 	);
	// }

	switch (callbackData) {
		case 'summary_time_1h':
			fromTime = now - 60 * 60 * 1000;
			break;
		case 'summary_time_2h':
			fromTime = now - 2 * 60 * 60 * 1000;
			break;
		case 'summary_time_3h':
			fromTime = now - 3 * 60 * 60 * 1000;
			break;
		case 'summary_time_1d':
			fromTime = now - 24 * 60 * 60 * 1000;
			break;
		case 'summary_time_6h':
			fromTime = now - 6 * 60 * 60 * 1000;
			break;
		case 'summary_time_cancel':
			return;
			break;
		default:
			await ctx.reply('Khoảng thời gian không hợp lệ.');
			return;
	}

	readLogs(chatId, fromTime, toTime).then(async (logs) => {
		if (!logs || logs.length === 0) {
			await ctx.reply('Không có tin nhắn nào trong khoảng thời gian đã chọn.');
			return;
		}

		// Tạo tóm tắt từ logs
		let summaryText = `Tóm tắt tin nhắn từ ${formatVNDateTime(fromTime)} đến ${formatVNDateTime(toTime)}:\n\n`;
		let logsChat = '';
		logs.forEach(log => {
			logsChat += `[${new Date(log.time).toLocaleTimeString()}] ${log.username}: ${log.message}\n`;
		});

		const summary = await summaryChat(logsChat);
		if (summary) {
			summaryText += `Nội dung tóm tắt:\n${summary.summary}\n\n`;
			// if (summary.actions && summary.actions.length > 0) {
			// 	summaryText += `Các việc cần làm:\n`;
			// 	summary.actions.forEach((action, index) => {
			// 		summaryText += `${index + 1}. ${action}\n`;
			// 	});
			// 	summaryText += `\n`;
			// }
			// if (summary.highlights && summary.highlights.length > 0) {
			// 	summaryText += `Tin nổi bật:\n`;
			// 	summary.highlights.forEach((highlight) => {
			// 		summaryText += `- ${highlight}\n`;
			// 	});
			// 	summaryText += `\n`;
			// }
		} else {
			summaryText += 'Không thể tạo tóm tắt vào lúc này. Vui lòng thử lại sau.';
		}
		// Giới hạn độ dài tóm tắt nếu quá dài (ví dụ: 4000 ký tự)
		if (summaryText.length > 4000) {
			summaryText = summaryText.slice(0, 4000) + '\n... (và nhiều hơn nữa)';
		}

		await ctx.reply(summaryText);

	});

};

function formatVNDateTime(ts) {
	const d = new Date(ts + 7 * 60 * 60 * 1000); // add 7 hours for GMT+7
	const dd = String(d.getUTCDate()).padStart(2, '0');
	const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
	const hh = String(d.getUTCHours()).padStart(2, '0');
	const min = String(d.getUTCMinutes()).padStart(2, '0');
	return `${dd}/${mm} ${hh}:${min}`;
}

const summaryChat = async (logsChat) => {
	// Gọi API tóm tắt (OpenAI hoặc logic khác)
	const requestBody = {
		model: 'gpt-local',
		messages: [
			{
				"role": "system",
				// "content": "Bạn là một trợ lý AI chuyên tóm tắt hội thoại nhóm.\nNhiệm vụ của bạn:\n- Đọc toàn bộ log hội thoại trong khoảng thời gian được cung cấp.\n- Tóm tắt ngắn gọn nội dung chính, ghi ngắn gọn, đủ ý, đọc nhanh, không dài dòng, tập trung vào thông tin quan trọng (ví dụ: xin nghỉ, xin trễ, thông báo quan trọng, câu hỏi cần xử lý...).\n- Nếu có thông tin cần hành động (ví dụ: cần submit form, mua hàng, đăng ký nghỉ phép...), hãy trích xuất thành danh sách.\n- Nếu có những câu nói quan trọng cần chú ý, hãy đưa vào highlights. Mỗi highlight là một chuỗi trên 1 dòng, định dạng:\n  \"[time] name: content\"\n- Trả về kết quả đúng định dạng JSON sau:\n\n{\n  \"summary\": \"Nội dung tóm tắt ngắn gọn ở đây\",\n  \"actions\": [\"Danh sách các việc cần làm nếu có\"],\n  \"highlights\": [\n    \"[time] thời gian tính theo GMT+7 (giờ việt nam) name: nội dung, chỉ đưa vào những nội dung quan trong và cần chú ý\",\n    \"[time] name: nội dung quan trọng\"\n  ]\n}\n\nKhông thêm bất kỳ nội dung nào ngoài JSON."
				// "content": "Bạn là một trợ lý AI chuyên tóm tắt hội thoại nhóm.\nNhiệm vụ của bạn:\n- Đọc toàn bộ log hội thoại trong khoảng thời gian được cung cấp.\n- Tóm tắt ngắn gọn nội dung chính, ghi ngắn gọn, đủ ý, đọc nhanh, không dài dòng, tập trung vào thông tin quan trọng (ví dụ: xin nghỉ, xin trễ, thông báo quan trọng, câu hỏi cần xử lý...). Trả về kết quả đúng định dạng JSON sau:\n\n{\n  \"summary\": \"Nội dung tóm tắt ngắn gọn ở đây\"\n}\n\nKhông thêm bất kỳ nội dung nào ngoài JSON."
				"content": "Bạn là một trợ lý AI chuyên tóm tắt hội thoại nhóm.\nNhiệm vụ của bạn:\n- Đọc toàn bộ log hội thoại trong khoảng thời gian được cung cấp.\n- Tóm tắt ngắn gọn nội dung chính, ghi ngắn gọn, đủ ý, đọc nhanh, không dài dòng, tập trung vào thông tin quan trọng.\n- Nếu có những câu nói quan trọng cần chú ý, hãy đưa vào highlights. Mỗi highlight là một chuỗi trên 1 dòng, định dạng:\n  \"name: content\"\n- Trả về kết quả đúng định dạng JSON sau:\n\n{\n  \"summary\": \"Nội dung tóm tắt ngắn gọn ở đây\",\n \"highlights\": [\n    \"name: nội dung, chỉ đưa vào những nội dung quan trong và cần chú ý\",\n    \"name: nội dung quan trọng\"\n  ]\n}\n\nKhông thêm bất kỳ nội dung nào ngoài JSON."
			},
			{
				role: 'user',
				content: logsChat
			}
		],
		temperature: 0.7,
		max_tokens: 1000,
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
	try {
		const content = response.data.choices?.[0]?.message?.content;

		if (content) {
			const parsed = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
			if (typeof parsed.summary !== 'undefined') {
				return parsed;
			}
		}
	} catch (error) {
		// ignore parse error, fallback to default reply
		console.error('Error parsing summary response:', error);
	}
	return null;
}
module.exports = {
	handleSummaryCollection,
	handleCommandSummary,
	handleSummaryPickTime
}
