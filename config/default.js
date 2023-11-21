const {fetchTelegramWhiteList} = require("../utils");

const STATUSES = {
    FREE: 0,
    WAITING_FOR_PROMPT: 1,
    WAITING_FOR_JSON_PROMPT: 2,
    WAITING_GPT_RESPONSE: 3,
}
module.exports = {
    onStartMessage: false,
    shutdownMessage: false,
    openai: {
        apiKey: process.env.OPENAI_API,
        model: 'gpt-4-1106-preview'
    },
    telegram: {
        token: process.env.TELEGRAM_API_KEY,
        systemChat: process.env.TELEGRAM_SYSTEM_CHAT,
        polling: true,
        threshold: 10, // 60 seconds
        whiteList: fetchTelegramWhiteList(), // Chat ids bot process messages from
        commands: {
            REGULAR_PROMPT: '/prompt',
            JSON_PROMPT: '/json',
        },
        statuses: {
            ...STATUSES,
        },
        messagePerStatus: {
            [STATUSES.FREE]: 'Choose command from list and than place your prompt',
            [STATUSES.WAITING_FOR_PROMPT]: 'Now place your prompt',
            [STATUSES.WAITING_FOR_JSON_PROMPT]: `Now place your JSON prompt. Don't forget to use JSON word`,
            [STATUSES.WAITING_GPT_RESPONSE]: `Relax. GPT is slow guy and needs more time`,
        }
    }
}