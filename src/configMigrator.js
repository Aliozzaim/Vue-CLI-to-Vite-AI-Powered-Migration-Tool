const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function migrateConfig() {
  const projectPath = process.env.PROJECT_PATH || '.';

  const inputPath = path.join(projectPath, 'vue.config.js');
  const outputPath = path.join(projectPath, 'vite.config.js');
  const babelConfigPath = path.join(projectPath, 'babel.config.js');
  

  const absoluteInputPath = path.resolve(inputPath);
  const absoluteOutputPath = path.resolve(outputPath);
  const absoluteBabelPath = path.resolve(babelConfigPath);

  if (!fs.existsSync(absoluteInputPath)) {
    console.log(`❌ ${absoluteInputPath} not found. Exiting without execution.`);
    return;
  }

  console.log(`🛠️  Migrating ${absoluteInputPath} to ${absoluteOutputPath}...`);
  
  const vueConfig = fs.readFileSync(absoluteInputPath, 'utf-8');
  let babelConfig = '';
  if (fs.existsSync(absoluteBabelPath)) {
    babelConfig = fs.readFileSync(absoluteBabelPath, 'utf-8');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
    const prompt = `Convert the following Vue CLI Webpack configuration to an equivalent Vite configuration in JavaScript. Also, check if Babel settings are needed and integrate them properly if required. Only return the updated Vite configuration code:

Vue Config:
${vueConfig}

Babel Config:
${babelConfig}`;
    
    const result = await model.generateContent(prompt);
    let viteConfig = result.response.text() || 'Error in conversion';
    
    const jsMatch = viteConfig.match(/```(?:javascript|js)?\n([\s\S]+?)\n```/);
    if (jsMatch) {
      viteConfig = jsMatch[1];
    }

    if (!viteConfig.trim()) {
      throw new Error('AI response is empty or invalid JavaScript format.');
    }

    fs.writeFileSync(absoluteOutputPath, viteConfig, 'utf-8');
    console.log(`✅ Vite configuration saved to ${absoluteOutputPath}`);
    
    fs.unlinkSync(absoluteInputPath);
    console.log(`🗑️  Deleted old configuration file: ${absoluteInputPath}`);
    
    if (fs.existsSync(absoluteBabelPath)) {
      fs.unlinkSync(absoluteBabelPath);
      console.log(`🗑️  Deleted old Babel configuration file: ${absoluteBabelPath}`);
    }
  } catch (error) {
    console.error('❌ AI conversion failed:', error);
  }
}

module.exports = { migrateConfig };
