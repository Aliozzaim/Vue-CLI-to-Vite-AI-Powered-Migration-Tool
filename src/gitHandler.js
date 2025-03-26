const {execSync} = require('child_process');
async function createPR() {
  console.log('🔀 Creating new Git branch and PR...');

  execSync('git checkout -b migrate-to-vite', { stdio: 'inherit' });
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Migrate Vue CLI project to Vite"', { stdio: 'inherit' });
  execSync('git push -u origin migrate-to-vite', { stdio: 'inherit' });

  console.log("🚀 Pushed changes to new branch 'migrate-to-vite'");
}
module.exports = { createPR };