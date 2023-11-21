process.env.NODE_ENV = process.env.NODE_ENV || 'development';
require('dotenv').config();

const {onStartMessage, shutdownMessage} = require('config');
const {systemMessage, init} = require('./modules/telegram');

init();

if(onStartMessage) {
    systemMessage(`Bot ready to use!`)
        .finally();
}

// Graceful (almost) shutdown
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

async function gracefulShutdown() {
    try {
        if(shutdownMessage) {
            await systemMessage(`I'm going to shutdown. See ya`)
        }
    } finally {
        process.exit(0)
    }
}

