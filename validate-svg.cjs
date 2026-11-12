const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('فحص صحة placeholder.svg');
console.log('='.repeat(80));

const svgPath = path.join(__dirname, 'public', 'placeholder.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

console.log('\nحجم الملف:', svgContent.length, 'بايت');
console.log('\nالمحتوى:');
console.log(svgContent);

// Basic SVG validation
const isValid = svgContent.trim().startsWith('<svg') && svgContent.trim().endsWith('</svg>');
console.log('\n' + '='.repeat(80));
console.log('التحقق:');
console.log('='.repeat(80));
console.log('SVG يبدأ بـ <svg؟', svgContent.trim().startsWith('<svg') ? '✓ نعم' : '✗ لا');
console.log('SVG ينتهي بـ </svg>؟', svgContent.trim().endsWith('</svg>') ? '✓ نعم' : '✗ لا');
console.log('يحتوي على xmlns؟', svgContent.includes('xmlns=') ? '✓ نعم' : '✗ لا');
console.log('يحتوي على viewBox؟', svgContent.includes('viewBox=') ? '✓ نعم' : '✗ لا');
console.log('اللون الخلفي كريمي؟', svgContent.includes('#F5F5DC') ? '✓ نعم' : '✗ لا');
console.log('يحتوي على أيقونة زهرة؟', svgContent.includes('petals') ? '✓ نعم' : '✗ لا');
console.log('بدون نصوص؟', !svgContent.includes('<text') ? '✓ نعم' : '✗ لا');
console.log('بدون أسماء منتجات؟', !svgContent.includes('اسم') && !svgContent.includes('name') ? '✓ نعم' : '✗ لا');
console.log('بدون أسعار؟', !svgContent.includes('سعر') && !svgContent.includes('price') ? '✓ نعم' : '✗ لا');

console.log('\n' + '='.repeat(80));
console.log('النتيجة النهائية:', isValid ? '✓ SVG صالح' : '✗ SVG غير صالح');
console.log('='.repeat(80));
