const { exec } = require('child_process');

const runCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.warn(`Error: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.warn(`Stderr: ${stderr}`);
                reject(new Error(stderr));
                return;
            }
            resolve(stdout);
        });
    });
}

module.exports = {
    runCommand,
}