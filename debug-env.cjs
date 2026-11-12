const path = require('path');
const fs = require('fs');

console.log('='.repeat(80));
console.log('تشخيص مشكلة تحميل .env.local');
console.log('='.repeat(80));

// Check current working directory
const cwd = process.cwd();
console.log('\n1. المسار الفعلي لعملية العمل (CWD): ' + cwd);

// Check if .env.local exists in CWD
const envPath = path.join(cwd, '.env.local');
const envExists = fs.existsSync(envPath);
console.log('2. ملف .env.local في CWD: ' + (envExists ? 'موجود' : 'غير موجود'));
console.log('   المسار المتوقع: ' + envPath);

// Check actual .env.local location from where script is running
const scriptDir = __dirname;
const scriptEnvPath = path.join(scriptDir, '.env.local');
const scriptEnvExists = fs.existsSync(scriptEnvPath);
console.log('3. ملف .env.local في مسار السكريبت: ' + (scriptEnvExists ? 'موجود' : 'غير موجود'));
console.log('   المسار: ' + scriptEnvPath);

// Read .env.local content if exists
const actualEnvPath = envExists ? envPath : scriptEnvPath;
if (fs.existsSync(actualEnvPath)) {
  const content = fs.readFileSync(actualEnvPath, 'utf8');
  console.log('\n4. محتوى ' + actualEnvPath + ':');
  console.log('---');
  content.split('\n').forEach((line, i) => {
    if (line.includes('SUPABASE_SECRET_KEY')) {
      const parts = line.split('=');
      const key = parts[0];
      const value = parts[1] || '(فارغ)';
      console.log('   ' + key + '=');
      console.log('   القيمة: ' + (value.length > 0 ? 'موجودة (' + value.length + ' حرف)' : 'فارغة'));
    } else {
      console.log('   ' + line);
    }
  });
  console.log('---');
} else {
  console.log('\n4. الملف ' + actualEnvPath + ' غير موجود');
}

// Check for encoding issues
if (fs.existsSync(actualEnvPath)) {
  const buffer = fs.readFileSync(actualEnvPath);
  const bom = buffer.slice(0, 3).toString('hex');
  console.log('\n5. فحص BOM: ' + (bom === 'efbbbf' ? 'UTF-8 BOM موجود' : 'لا يوجد BOM'));
}

console.log('='.repeat(80));
