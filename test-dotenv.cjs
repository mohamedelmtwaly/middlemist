const path = require('path');
const fs = require('fs');

console.log('='.repeat(80));
console.log('اختبار تحميل dotenv');
console.log('='.repeat(80));

// Test 1: Load dotenv
const envPath = path.join(__dirname, '.env.local');
console.log('\n1. المسار: ' + envPath);
console.log('2. الملف موجود: ' + fs.existsSync(envPath));

require('dotenv').config({ path: envPath });

console.log('\n3. تحقق من المتغيرات بعد تحميل dotenv:');
console.log('   VITE_SUPABASE_URL: ' + (process.env.VITE_SUPABASE_URL ? 'موجود' : 'غير موجود'));
console.log('   VITE_SUPABASE_ANON_KEY: ' + (process.env.VITE_SUPABASE_ANON_KEY ? 'موجود' : 'غير موجود'));
console.log('   SUPABASE_SECRET_KEY: ' + (process.env.SUPABASE_SECRET_KEY ? 'موجود (' + process.env.SUPABASE_SECRET_KEY.length + ' حرف)' : 'غير موجود'));

// Test 2: Read file directly and check
console.log('\n4. قراءة الملف مباشرة:');
const content = fs.readFileSync(envPath, 'utf8');
content.split('\n').forEach((line, i) => {
  if (line.includes('SUPABASE_SECRET_KEY')) {
    console.log('   السطر الأصلي: ' + line);
    const parts = line.split('=');
    console.log('   اسم المتغير: [' + parts[0] + ']');
    console.log('   القيمة: [' + (parts[1] || '(فارغ)') + ']');
    console.log('   طول القيمة: ' + (parts[1] ? parts[1].length : 0));
  }
});

// Test 3: Check with trim
console.log('\n5. اختبار مع trim:');
const trimmed = content.trim();
const lines = trimmed.split('\n');
lines.forEach((line, i) => {
  if (line.includes('SUPABASE_SECRET_KEY')) {
    const parts = line.split('=');
    const key = parts[0].trim();
    const value = parts[1] ? parts[1].trim() : '';
    console.log('   اسم المتغير (trimmed): [' + key + ']');
    console.log('   القيمة (trimmed): [' + (value || '(فارغ)') + ']');
    console.log('   طول القيمة: ' + value.length);
  }
});

console.log('='.repeat(80));
