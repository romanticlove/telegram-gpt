const {telegram: config} = require('config');
const TelegramBot = require('node-telegram-bot-api');
const {request} = require('./open-ai');

const {statuses, commands, messagePerStatus} = config;

const state = {
    bot: null,
    status: statuses.FREE,
}

/**
 * Prevent usage from strangers
 */
const verifySenderWhiteListed = (msg) => {
    const messageFrom = msg.from.id;
    if (!Array.isArray(config.whiteList))
        throw new Error(`Wrong configuration for senders whitelist`)

    if (!config.whiteList.includes(messageFrom))
        throw new Error(`Failed to process. Invalid sender: ${messageFrom}`)
}

/**
 * Don't process messages were sent while bot was offline. Place threshold to 0 if you want to disable feature
 */
const skipOutdatedMessages = (msg) => {
    if(config.threshold) {
        const timeDiff = (Date.now() - 1000 * msg.date) / 1000;
        return timeDiff > config.threshold
    }

    return false
}

const fetchCommand = (msg) => {
    for (const command in commands) {
        if (commands[command] === msg.text)
            return commands[command]
    }

    return null;
}

const onMessage = async (msg) => {
    const chatId = msg.chat.id;
    try {
        verifySenderWhiteListed(msg);
        if (skipOutdatedMessages(msg))
            return;

        const command = fetchCommand(msg)
        if (command) {
            if (command === commands.REGULAR_PROMPT) {
                state.status = statuses.WAITING_FOR_PROMPT;
            }

            if (command === commands.JSON_PROMPT) {
                state.status = statuses.WAITING_FOR_JSON_PROMPT;
            }

            return await state.bot.sendMessage(chatId, messagePerStatus[state.status])
        }

        switch (state.status) {
            case statuses.WAITING_GPT_RESPONSE:
            case statuses.FREE:
                return await state.bot.sendMessage(chatId, messagePerStatus[state.status])
            case statuses.WAITING_FOR_PROMPT:
            case statuses.WAITING_FOR_JSON_PROMPT: {
                const useJSON = state.status === statuses.WAITING_FOR_JSON_PROMPT;

                state.status = statuses.WAITING_GPT_RESPONSE;
                state.bot.sendMessage(chatId, 'Asking Chat GPT. Come back in few seconds')
                    .catch(console.error)

                return await request({
                    prompt: msg.text,
                    onSuccess: (response) => {
                        state.status = statuses.FREE;
                        state.bot.sendMessage(chatId, response)
                            .catch(console.error)
                    },
                    onFail: (err) => {
                        state.status = statuses.FREE;
                        state.bot.sendMessage(chatId, `FAILED. ${err.message}`)
                            .catch(console.error)
                    },
                    json: useJSON
                })
            }
        }
    } catch (err) {
        return state.bot.sendMessage(chatId, err.message)
            .catch(console.error)
    }
}

module.exports = {
    init() {
        state.bot = new TelegramBot(config.token, {polling: config.polling});
        state.bot.on('message', onMessage);
    },
    systemMessage(message) {
        if (config.systemChat) {
            return state.bot.sendMessage(config.systemChat, message)
                .catch(console.error)
        }
    }
}