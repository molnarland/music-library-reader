const { resolve, sep } = require("path");
const { readdir, copyFile, rm } = require("fs").promises;
const commandLineArgs = require('command-line-args');

const { aiffDir, wavDir } = commandLineArgs([
	{ name: "aiffDir", alias: "a", type: String },
	{ name: "wavDir", alias: "w", type: String }
]);

(async () => {
	for await (const aiff of getAiff()) {
		const wav = await getWav(getFileName(aiff));

		if (wav) {
			const destination = wav.replace(".wav", ".aiff");
			
			try {
				await copyFile(aiff, destination);
				console.info(`${aiff} copied to ${destination}`);
				await rm(wav);
				console.info(`Deleted: ${wav}`);
			}
			catch (e) {
				console.error(e);
			}
		}

	}
})();



/**
 * @param {string} aiff
 * @param {string} [dir]
 * @return {string|null}
 */
async function getWav(aiff, dir = wavDir) {
  try {
  	const fileToSearch = aiff.replace(".aiff", ".wav");
    const dirents = await readdir(dir, { withFileTypes: true });

    for (const dirent of dirents) {
	    const fileName = getFileName(dirent.name);
    	const res = resolve(dir, dirent.name);

		if (dirent.isDirectory()) {
    		const result = await getWav(aiff, res);
    		if (result) return result;
    	}
    	else if (fileName === fileToSearch) {
    		return res;
    	}
    	else if (fileName === aiff) {
    		console.info(`Aiff file already found: ${fileName}`);
    		return null;
    	}
    }

    return null;
  } catch (e) {
    console.error(e);
  }
}


/**
 * @return {AsyncGenerator<string[]>}
 */
async function* getAiff() {
	try {
		const dirents = await readdir(aiffDir, { withFileTypes: true });

		for (const dirent of dirents) {
			if (dirent.isFile() && dirent.name.endsWith(".aiff")) {
				yield resolve(aiffDir, dirent.name);
			}
		}
	}
	catch(e) {
		console.error(e);
	}
}

/**
 * @param {string} src
 * @return {string}
 */
function getFileName(src) {
	const splitted = src.split(sep);
	return splitted[splitted.length - 1];
}