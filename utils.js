const fetchTelegramWhiteList = () => {
    try {
        if(!process.env.TELEGRAM_WHITE_LIST)
            return []

        const numbersArray = process.env.TELEGRAM_WHITE_LIST.split(',');

        return numbersArray.map(Number);
    } catch (err) {
        return []
    }
}

module.exports = {
    fetchTelegramWhiteList,
}