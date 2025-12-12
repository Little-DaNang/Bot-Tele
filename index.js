require('dotenv').config();

const {start} = require('./src/module/telegram/bot');

start();

require('./src/module/cron/cron');