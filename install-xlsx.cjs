const { execSync } = require('child_process');
const path = require('path');

const projectDir = __dirname;

try {
  console.log('Installing xlsx library...');
  execSync('cd /d "' + projectDir + '" && npm install --save-dev xlsx', { 
    stdio: 'inherit',
    shell: 'cmd.exe'
  });
  console.log('✓ xlsx installed successfully');
} catch (error) {
  console.error('✗ Failed to install xlsx:', error.message);
  process.exit(1);
}
