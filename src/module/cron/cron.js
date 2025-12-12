const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { bot } = require('../telegram/bot');
const { readDB } = require('../../db/db');
const { handleAutoSummary } = require('../summary/handler');

const LOGS_DIR = path.join(__dirname, '../../../data/logs');

// Function to delete old log files (older than 1 week)
const deleteOldLogs = () => {
  fs.readdir(LOGS_DIR, (err, files) => {
    if (err) {
      console.error('Error reading logs directory:', err);
      return;
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    files.forEach(file => {
      if (path.extname(file) === '.jsonl') {
        const parts = file.split('_');
        if (parts.length >= 3) {
          const dateStr = parts[parts.length - 2]; // dateStr is the second last part
          const dd = dateStr.slice(0, 2);
          const mm = dateStr.slice(2, 4);
          const yyyy = dateStr.slice(4, 8);
          const fileDate = new Date(`${yyyy}-${mm}-${dd}`);
          if (fileDate < oneWeekAgo) {
            const filePath = path.join(LOGS_DIR, file);
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('Error deleting file:', filePath, err);
              } else {
                console.log('Deleted old log file:', file);
              }
            });
          }
        }
      }
    });
  });
};

// Function to trigger summary for all enabled groups
const triggerSummary = async () => {
  const db = readDB();
  const enabledGroups = db.groups.filter(g => g.enable);

  for (const group of enabledGroups) {
    try {
      await handleAutoSummary(group.chatId, bot);
    } catch (error) {
      console.error('Error sending auto summary to chat', group.chatId, error);
    }
  }
};

// Schedule to delete old logs every day at 8:30
cron.schedule('30 8 * * *', () => {
  console.log('Running daily log cleanup at 8:30');
  deleteOldLogs();
}, {
  timezone: "Asia/Ho_Chi_Minh"
});

// Schedule to trigger summary at 12:00 every day
cron.schedule('0 12 * * *', () => {
  console.log('Triggering summary at 12:00');
  triggerSummary();
}, {
  timezone: "Asia/Ho_Chi_Minh"
});

// Schedule to trigger summary at 17:30 every day
cron.schedule('30 17 * * *', () => {
  console.log('Triggering summary at 17:30');
  triggerSummary();
}, {
  timezone: "Asia/Ho_Chi_Minh"
});

console.log('Cron jobs scheduled');
