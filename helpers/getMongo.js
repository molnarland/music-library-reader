const { MongoClient } = require("mongodb");

const MONGO_URL = process.env.MONGO_URL;

/**
 * @return {Promise<{client: MongoClient, collections: {musics: Collection<Document>, playlist: Collection<Document>, requests: Collection<Document>}>}
 */
async function getMongo() {
  let client = null;

  try {
    client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db();

    return {
      client,
      collections: {
        musics: db.collection("musics"),
        playlist: db.collection("playlist"),
        requests: db.collection("requests"),
      },
    };
  } catch (e) {
    console.error(e);
  }
}

module.exports = { getMongo };
