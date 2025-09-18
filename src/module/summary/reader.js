// reader_daily_no_index.js
const fs = require("fs");
const readline = require("readline");
const path = require("path");

function getDateString(ts = Date.now()) {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}${mm}${yyyy}`;
}

async function readLogs(chatId, from, to) {
  const fromDate = getDateString(from);
  const toDate = getDateString(to);

  const results = [];

  let cur = new Date(from);
  while (getDateString(cur) <= toDate) {
    const dateStr = getDateString(cur.getTime());
    const dataFile = path.join(__dirname, `../../../data/logs/${chatId}_${dateStr}_data.jsonl`);

    if (fs.existsSync(dataFile)) {
      const rl = readline.createInterface({
        input: fs.createReadStream(dataFile, { encoding: "utf-8" }),
      });

      for await (const line of rl) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          if (obj.time >= from && obj.time <= to) {
            results.push(obj);
          }
        } catch {}
      }
    }

    cur.setDate(cur.getDate() + 1);
  }

  return results;
}

// Demo
// (async () => {
//   const now = Date.now();
//   const logs = await readLogs(now - 15_000, now);
//   console.log("Logs in last 15s:", logs);
// })();

module.exports = {
  readLogs
}
