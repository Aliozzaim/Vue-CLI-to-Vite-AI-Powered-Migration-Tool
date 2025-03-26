const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

function getFolderStructure(dirPath) {
    const structure = {};
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    items.forEach(item => {
        if (item.isDirectory()) {
            structure[item.name] = getFolderStructure(path.join(dirPath, item.name));
        } else {
            structure[item.name] = 'file';
        }
    });

    return structure;
}

// Function to add delay using Promise
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateDependencies() {
    const projectPath = process.env.PROJECT_PATH || process.cwd();
    const packageJsonPath = path.join(projectPath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        console.log(`❌ package.json not found at ${packageJsonPath}, skipping dependency update.`);
        return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    console.log(`📦 Updating dependencies for Vite compatibility at ${packageJsonPath}...`);

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
        const prompt = `Modify this package.json for Vite migration and return only the modified JSON file, nothing else:\n\n${JSON.stringify(packageJson, null, 2)}`;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text() || '';

        const jsonMatch = responseText.match(/```json\n([\s\S]+?)\n```/);
        if (jsonMatch) {
            responseText = jsonMatch[1];
        }

        if (!responseText.trim()) {
            throw new Error('AI response is empty or invalid JSON format.');
        }

        let optimizedPackageJson;
        try {
            optimizedPackageJson = JSON.parse(responseText);
        } catch (error) {
            console.error('⚠️ Failed to parse AI response, keeping original package.json.');
            optimizedPackageJson = packageJson;
        }

        fs.writeFileSync(packageJsonPath, JSON.stringify(optimizedPackageJson, null, 2));
        console.log(`✅ Dependencies updated at ${packageJsonPath}! Running installation...`);

        execSync('npm install', { cwd: projectPath, stdio: 'inherit' });

    } catch (error) {
        console.error('❌ AI Optimization failed:', error);
    }
}

async function checkAndCreateMissingFiles() {
    const projectPath = process.env.PROJECT_PATH || process.cwd();
    const folderStructure = getFolderStructure(projectPath);
    const indexHtmlPath = path.join(projectPath, 'index.html');

    if (fs.existsSync(indexHtmlPath)) {
        console.log('✅ index.html already exists. No action needed.');
        return;
    }

    console.log('⚠️ index.html is missing! Asking AI to generate one...');
    
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
        const prompt = `If index.html is required for Vite, generate an example and return only the HTML code.`;

        const result = await model.generateContent(prompt);
        let indexHtml = result.response.text() || '';

        const htmlMatch = indexHtml.match(/```html\n([\s\S]+?)\n```/);
        if (htmlMatch) {
            indexHtml = htmlMatch[1];
        }

        if (!indexHtml.trim()) {
            throw new Error('AI did not generate valid HTML.');
        }

        fs.writeFileSync(indexHtmlPath, indexHtml, 'utf-8');
        console.log(`✅ index.html created successfully at ${indexHtmlPath}`);
    } catch (error) {
        console.error('❌ Failed to generate index.html:', error);
    }
}

module.exports = { updateDependencies, checkAndCreateMissingFiles };
