require("dotenv").config();
const { getMongo } = require("../helpers/getMongo");
const { connectToChat } = require("../helpers/connectToChat");
const { handleKill } = require("../helpers/handleKill");
const {
  splitMessage,
  getMinutesUntilNextRequest,
} = require("../helpers/helpers");

const commands = {
  commands: { name: "!commands", details: "This command" },
  music: { name: "!music", details: "Request a track and I'll play it" },
};

(async () => {
  const [chatClient, mongo] = await Promise.all([connectToChat(), getMongo()]);

  mongo.collections.playlist.deleteMany();

  chatClient.on("message", onMessage.bind(null, chatClient, mongo.collections));

  handleKill(mongo.client, chatClient);
})();

/**
 * @param {client} client
 * @param {string} channel
 * @param {{musics: Collection<Document>, playlist: Collection<Document>, requests: Collection<Document>}} mongo
 * @param {Object} tags
 * @param {string} message
 * @param {boolean} self
 */
async function onMessage(client, mongo, channel, tags, message, self) {
  if (self || !message.startsWith("!")) return;

  const { command, argument } = splitMessage(message);
  const say = client.say.bind(client);

  switch (command) {
    case commands.commands.name:
      commandCommands(say, channel);
      break;
    case commands.music.name:
      if (!argument) {
        commandMusicNoArgument(say, channel, tags.username);
        break;
      }

      commandMusic(say, mongo, channel, tags.username, argument);
      break;
  }
}

/**
 * @param {Function} say
 * @param {string} channel
 */
function commandCommands(say, channel) {
  say(
    channel,
    Object.values(commands)
      .map(({ name, details }) => `${name} - ${details}`)
      .join("\n")
  );
}

/**
 * @param {Function} say
 * @param {{musics: Collection<Document>, playlist: Collection<Document>, requests: Collection<Document>}} mongo
 * @param {string} channel
 * @param {string} username
 * @param {string} argument
 * @return {Promise<void>}
 */
async function commandMusic(say, mongo, channel, username, argument) {
  try {
    const lastRequest = await mongo.requests.findOne(
      { username },
      { projection: { _id: 0, username: 0 }, sort: ["time", "desc"] }
    );

    const minutesUntilNextRequest = getMinutesUntilNextRequest(
      lastRequest?.time
    );
    if (minutesUntilNextRequest <= 0) {
      say(
        channel,
        `@${username}, have to wait ${minutesUntilNextRequest} minutes until next request`
      );
      return;
    }

    await mongo.requests.insertOne({
      username,
      time: new Date(),
      track: argument,
    });

    const track = await mongo.musics.findOne(
      { track: argument },
      { projection: { track: 0, _id: 0 } }
    );

    await mongo.playlist.insertOne(track);
    const currentPlayList = await mongo.playlist
      .find({}, { projection: { _id: 0 } })
      .toArray();

    console.clear();
    console.table(currentPlayList);

    say(channel, `@${username}, I'm gonna play '${argument}'`);
  } catch (e) {
    console.error(e);
  }
}

/**
 * @param {Function} say
 * @param {string} channel
 * @param {string} username
 */
function commandMusicNoArgument(say, channel, username) {
  say(
    channel,
    `@${username}, visit https://molnarland.github.io/music copy a track and paste here after !music command`
  );
}
