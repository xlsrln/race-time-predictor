
// This script simplifies the GitHub Pages deployment process
// You can run it with "node deploy.js" after setting up your GitHub repo

const { execSync } = require('child_process');
const fs = require('fs');

// Check if gh-pages is installed
try {
  require.resolve('gh-pages');
} catch (e) {
  console.log('Installing gh-pages package...');
  execSync('npm install gh-pages --save-dev', { stdio: 'inherit' });
}

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// Check if deploy script exists
if (!packageJson.scripts.deploy) {
  console.log('Adding deploy script to package.json...');
  packageJson.scripts.deploy = "vite build && gh-pages -d dist";
  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
  console.log('Added deploy script to package.json');
} 

console.log('\nSetup complete! To deploy to GitHub Pages:');
console.log('\n1. Push your code to GitHub');
console.log('2. Run: npm run deploy');
console.log('\nAlternatively, just push to main branch and the GitHub Action will deploy automatically.');
console.log('\nMake sure to enable GitHub Pages in your repository settings to use the gh-pages branch!');
