const {openai} = require('config');
const OpenAIApi = require('openai');

const GPT = new OpenAIApi({
    apiKey: openai.apiKey,
});

const getResponse = (res) => {
    const response = res.choices[0] && res.choices[0].message.content
    if(!response)
        throw new Error('Open AI empty response')

    return response
}
const request = async ({prompt, onSuccess, onFail, json = false}) => {
    try {
        const res = await GPT.chat.completions.create({
            model: openai.model,
            ...json && {response_format: { type: "json_object" }},
            messages: [
                {"role": "user", "content": prompt}
            ]
        });

        const response =  getResponse(res)
        onSuccess(response)
    } catch (err) {
        console.error(`GPT Request failed`, {
            prompt,
            error: {
                message: err.message,
                type: err.type,
                status: err.status
            }
        })
        onFail(err);
    }
}

module.exports = {
    request
}