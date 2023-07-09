require("dotenv").config();
const { resolve } = require("path");
const { readdir, open } = require("fs").promises;
const taglib = require('taglib2')

const LIBRARY_PATH = process.env.LIBRARY_PATH;

(async () => {
	for await (const file of getFiles(LIBRARY_PATH)) {
      if (!isAudio(file)) continue;

      const splittedFileName = file.split('\\');
      let genre = splittedFileName[5];
      let subGenre = splittedFileName[6];

      if (['others', 'halftime', 'samplers', 'acoustic'].includes(genre) || !subGenre) continue;

      genre = genre === 'dnb' ? 'DnB' : capitalizeFirstLetter(genre);
      subGenre = subGenre.split('-').map((sg) => capitalizeFirstLetter(sg)).join(' ');

      const finalGenre = [genre, subGenre].join(' ');

      const tags = taglib.readTagsSync(file);
      tags.genre = finalGenre;

      taglib.writeTagsSync(file, tags);
 	}
})();

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


/**
 * @param {string} fileName
 * @return {boolean}
 */
function isAudio(fileName) {
  const splitted = fileName.split('.');
  const extension = splitted[splitted.length - 1];

  return ['wav', 'flac'].includes(extension);
}

/**
 * @param {string} string
 * @return {string}
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}