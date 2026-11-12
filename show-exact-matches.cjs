const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, 'product-image-matching-report.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

console.log('='.repeat(80));
console.log('المطابقات التامة (exact_match)');
console.log('='.repeat(80));

const exactMatches = report.filter(r => r.match_status === 'exact_match');
console.log(`\nعدد المطابقات التامة: ${exactMatches.length}\n`);

exactMatches.forEach((r, i) => {
  console.log(`${i + 1}. ${r.supabase_name}`);
  console.log(`   Mapping: ${r.mapping_name}`);
  console.log(`   Image: ${r.image_filename}`);
  console.log(`   URL: ${r.public_url}`);
  console.log(`   Current: ${r.current_image_url}`);
  console.log('');
});

console.log('='.repeat(80));
console.log('المطابقات عالية الثقة (high_confidence)');
console.log('='.repeat(80));

const highConfidence = report.filter(r => r.match_status === 'high_confidence');
console.log(`\nعدد المطابقات عالية الثقة: ${highConfidence.length}\n`);

highConfidence.forEach((r, i) => {
  console.log(`${i + 1}. ${r.supabase_name}`);
  console.log(`   Mapping: ${r.mapping_name} (${r.match_score}%)`);
  console.log(`   Image: ${r.image_filename}`);
  console.log(`   Reason: ${r.match_reason}`);
  console.log('');
});

console.log('='.repeat(80));
console.log('الصور المفقودة (missing_image)');
console.log('='.repeat(80));

const missingImages = report.filter(r => r.match_status === 'missing_image');
console.log(`\nعدد الصور المفقودة: ${missingImages.length}\n`);

missingImages.forEach((r, i) => {
  console.log(`${i + 1}. ${r.supabase_name}`);
  console.log(`   Mapping: ${r.mapping_name}`);
  console.log(`   Image: ${r.image_filename} (غير موجود في Storage)`);
  console.log('');
});

console.log('='.repeat(80));
