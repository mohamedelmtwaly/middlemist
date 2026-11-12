const { execSync } = require('child_process');
const path = require('path');

const projectDir = __dirname;

try {
  console.log('Installing sharp as devDependency...');
  // Use cmd.exe to bypass PowerShell restrictions
  execSync('cd /d "' + projectDir + '" && npm install --save-dev sharp', { 
    stdio: 'inherit',
    shell: 'cmd.exe'
  });
  console.log('✓ sharp installed successfully');
} catch (error) {
  console.error('✗ Failed to install sharp:', error.message);
  process.exit(1);
}
