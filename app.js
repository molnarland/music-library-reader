require("dotenv").config();
const { resolve } = require("path");
const { readdir, open } = require("fs").promises;
const mm = require("music-metadata");
const { MongoClient } = require("mongodb");

const MONGO_URL = process.env.MONGO_URL;
const LIBRARY_PATH = process.env.LIBRARY_PATH;
const LIBRARY_FILE_NAME = process.env.LIBRARY_FILE_NAME;

(async () => {
  const musics = await getMusicsInJson();

  await writeToJson(musics);
  console.info(`File '${LIBRARY_FILE_NAME}' is created`);
  await writeToMongo(musics);
  console.info("Data uploaded to mongo");
})();

async function writeToMongo(musics) {
  let client = null;

  try {
    client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db();
    const collection = db.collection("musics");

    const hasMusic = !!(await collection.findOne());
    if (hasMusic) {
      await collection.deleteMany({});
    }

    for (const genre in musics) {
      for (const year in musics[genre]) {
        for (const { title, artist } of musics[genre][year]) {
          await collection.insertOne({
            genre,
            title,
            artist,
            year: Number(year),
          });
        }
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    client?.close();
  }
}

/**
 * @param {Object} musics
 * @return {Promise<void>}
 */
async function writeToJson(musics) {
  let fileHandle = null;
  try {
    fileHandle = await open(LIBRARY_FILE_NAME, "w");
    fileHandle.write(JSON.stringify(musics));
  } catch (e) {
    console.error(e);
  } finally {
    fileHandle?.close();
  }
}

/**
 * @return {Promise<Object>}
 */
async function getMusicsInJson() {
  const musics = {};

  try {
    for await (const file of getFiles(LIBRARY_PATH)) {
      const {
        common: { artist, year, genre, title },
      } = await mm.parseFile(file);

      if (!artist) continue;

      if (!musics[genre]) {
        musics[genre] = { [year]: [{ artist, title }] };
        continue;
      }

      if (!musics[genre][year]) {
        musics[genre][year] = [{ artist, title }];
        continue;
      }

      musics[genre][year].push({ artist, title });
    }
  } catch (e) {
    console.error(e);
  } finally {
    return musics;
  }
}

/**
 * @param {string} dir
 * @return {AsyncGenerator<string[]>}
 */
async function* getFiles(dir) {
  try {
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const res = resolve(dir, dirent.name);
      if (dirent.isDirectory()) {
        yield* getFiles(res);
      } else {
        yield res;
      }
    }
  } catch (e) {
    console.error(e);
  }
}
