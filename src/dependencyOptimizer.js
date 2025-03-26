const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function optimizeDependencies(projectPath = process.env.PROJECT_PATH || '.') {
  const absoluteProjectPath = path.resolve(projectPath);
  const packageJsonPath = path.join(absoluteProjectPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`❌ package.json not found in ${absoluteProjectPath}, skipping dependency optimization.`);
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  console.log('🔍 Checking for optimized dependencies using Gemini AI...');

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const prompt = `Optimize the dependencies in this package.json for a Vite project. Only return a valid updated package.json object:\n${JSON.stringify(packageJson, null, 2)}`;

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
      console.error("⚠️ Failed to parse AI response as JSON. Using original package.json.");
      return;
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(optimizedPackageJson, null, 2));
    console.log(`✅ Dependencies optimized! Running installation in ${absoluteProjectPath}...`);

    execSync('npm install', { cwd: absoluteProjectPath, stdio: 'inherit' });

    console.log('🚀 Running npm scripts...');
    execSync('npm run dev', { cwd: absoluteProjectPath, stdio: 'inherit' });

  } catch (error) {
    console.error("❌ Error optimizing dependencies:", error.message);
  }
}

module.exports = { optimizeDependencies };
