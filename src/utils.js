const readline = require('readline');

function askConfirmation(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${question} (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

module.exports = { askConfirmation };