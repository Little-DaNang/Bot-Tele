// writer_daily_no_index.js
const fs = require("fs");
const path = require("path");

function getDateString(ts = Date.now()) {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}${mm}${yyyy}`;
}

let dataStreams = {};

function openStream(chatId, dateStr) {
  const dataFile = path.join(__dirname, `../../../data/logs/${chatId}_${dateStr}_data.jsonl`);
  // Ensure the file exists before opening the stream
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '');
  }
  const streamKey = `${chatId}_${dateStr}`;
  dataStreams[streamKey] = fs.createWriteStream(dataFile, { flags: "a" });
}

function closeStream(chatId, dateStr) {
  const streamKey = `${chatId}_${dateStr}`;
  if (dataStreams[streamKey]) {
    dataStreams[streamKey].end();
    delete dataStreams[streamKey];
  }
}

function writeLog(chatId, date, obj) {
  const dateStr = getDateString(date);
  const streamKey = `${chatId}_${dateStr}`;
  if (!dataStreams[streamKey]) {
    openStream(chatId, dateStr);
  }
  dataStreams[streamKey].write(JSON.stringify(obj) + "\n");
}

// Khởi tạo
// openStream(currentDate);

// // Demo ghi log liên tục
// setInterval(() => {
//   const log = {
//     time: Date.now(),
//     name: "system",
//     content: "NoIndex " + Math.random().toString(36).slice(2, 6),
//   };
//   writeLog(log);
//   console.log("Wrote:", log);
// }, 2000);

module.exports = {
  writeLog
}
