const fs = require('fs');
const path = require('path');
const readline = require('readline');

// obtain the source directory from command-line arguments
const sourceDirectory = process.argv[2];
const mappingFile = path.join(sourceDirectory, 'mapping.txt'); // mapping file located inside source directory

const fileTypes = ['.wav', '.aiff', '.mp3'];

const readInterface = readline.createInterface({
    input: fs.createReadStream(mappingFile),
    output: process.stdout,
    console: false
});

readInterface.on('line', (line) => {
    const [partialFileName, targetDirectory] = line.split('|').map(part => part.trim());

    fs.readdir(sourceDirectory, (err, files) => {
        if (err) {
            console.error("Could not list the directory.", err);
            process.exit(1);
        }

        files.forEach((file) => {
            const fullFileName = path.basename(file, path.extname(file)); // remove extension from file

            if (fullFileName.endsWith(partialFileName) && fileTypes.includes(path.extname(file))) {
                const sourceFilePath = path.join(sourceDirectory, file);
                const targetFilePath = path.join(targetDirectory, file);

                fs.copyFile(sourceFilePath, targetFilePath, (err) => {
                    if (err) console.error(err);
                    console.log(`File [${file}] copied to ${targetDirectory}`);
                });
            }
        });
    });
});
