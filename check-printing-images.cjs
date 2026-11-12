const fs = require('fs');
const path = require('path');

// Required images from the 11 printing products
const requiredImages = [
  'custom-print-001.webp',
  'custom-print-002.webp',
  'custom-print-003.webp',
  'custom-print-004.webp',
  'custom-print-005.webp',
  'custom-print-006.webp',
  'custom-print-007.webp',
  'custom-print-008.webp',
  'custom-print-009.webp',
  'custom-print-010.webp',
  'custom-print-017.webp'
];

// Search folders
const searchFolders = [
  'src/assets/middlemist-images',
  'src/assets/middlemist-images-backup',
  'src/assets/middlemist-ballones'
];

console.log('=== CHECKING PRINTING IMAGES ===\n');

let found = 0;
let missing = [];
const imageDetails = [];

requiredImages.forEach(img => {
  let foundPath = null;
  for (const folder of searchFolders) {
    const filePath = path.join(__dirname, folder, img);
    if (fs.existsSync(filePath)) {
      foundPath = filePath;
      break;
    }
  }

  if (foundPath) {
    found++;
    console.log(`✅ ${img} - Found in ${foundPath}`);
    imageDetails.push({ image: img, path: foundPath, status: 'found' });
  } else {
    missing.push(img);
    console.log(`❌ ${img} - NOT FOUND`);
    imageDetails.push({ image: img, path: null, status: 'missing' });
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total required: ${requiredImages.length}`);
console.log(`Found: ${found}`);
console.log(`Missing: ${missing.length}`);

if (missing.length > 0) {
  console.log(`\n=== MISSING IMAGES ===`);
  missing.forEach(img => console.log(`  - ${img}`));
}

// Calculate total size
let totalSize = 0;
imageDetails.forEach(detail => {
  if (detail.status === 'found') {
    const stats = fs.statSync(detail.path);
    totalSize += stats.size;
  }
});

console.log(`\nTotal size of found images: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
