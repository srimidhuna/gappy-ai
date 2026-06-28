// Initialize backend package.json and install deps
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const backendDir = path.join('d:', 'SSG_Fullstack_projects', 'gappy_ai_hackathon', 'deadline-pilot', 'backend');
if (!fs.existsSync(backendDir)) fs.mkdirSync(backendDir);
if (!fs.existsSync(path.join(backendDir, 'routes'))) fs.mkdirSync(path.join(backendDir, 'routes'));
