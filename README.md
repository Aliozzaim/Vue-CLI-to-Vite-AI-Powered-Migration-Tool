Vue CLI to Vite AI-Powered Migration Tool

Overview

This tool automates the migration of Vue CLI projects to Vite using AI-powered optimizations. It streamlines the process by updating configurations, optimizing dependencies, and ensuring compatibility.

Why I Developed This

I created this tool to help developers transition from Vue CLI to Vite effortlessly. The goal is to simplify the migration process and provide useful suggestions. While the tool may not always produce perfect code, it aims to assist developers by automating tedious tasks and offering guidance for basic Vue CLI projects.

Features

Automatic vite.config.js generation

Dependency optimization using AI

Babel compatibility adjustments

Removal of outdated configurations

File structure adjustments (e.g., ensuring index.html exists)

Git integration for seamless branch creation and commits

Installation

Ensure you have Node.js installed, then run:

npm install

Or, if using Yarn:

yarn install

Usage

Specify your Vue CLI project path in the .env file:

GOOGLE_API_KEY='your-google-api-key'
PROJECT_PATH='your-vue-cli-project-path'

Run the migration tool:

node src/index.js

This will automatically migrate your Vue CLI project to Vite within seconds.

Contributing

Feel free to submit issues or pull requests to improve the migration tool.
