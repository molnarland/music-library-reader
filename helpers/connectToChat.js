const tmi = require("tmi.js");

const TWITCH_TOKEN = process.env.TWITCH_TOKEN;
const TWITCH_BOT_NAME = process.env.TWITCH_BOT_NAME;

console.log(TWITCH_BOT_NAME, TWITCH_TOKEN);

/**
 * @return {Promise<client>}
 */
async function connectToChat() {
  let chatClient;
  try {
    chatClient = new tmi.Client({
      options: { debug: true, messagesLogLevel: "info" },
      connection: {
        reconnect: true,
        secure: true,
      },
      identity: {
        username: TWITCH_BOT_NAME,
        password: `oauth:${TWITCH_TOKEN}`,
      },
      channels: ["#molnardev"],
    });

    await chatClient.connect();

    return chatClient;
  } catch (e) {
    console.error(e);
    chatClient?.disconnect();
  }
}

module.exports = { connectToChat };
