const fs = require('fs');
const path = require('path');

// Required images from the 20 stands products
const requiredImages = [
  'flower-stand-001.webp',
  'custom-print-011.webp',
  'flower-stand-002.webp',
  'flower-stand-003.webp',
  'flower-stand-004.webp',
  'custom-print-012.webp',
  'flower-stand-005.webp',
  'flower-stand-006.webp',
  'flower-stand-007.webp',
  'flower-stand-008.webp',
  'flower-stand-009.webp',
  'flower-stand-010.webp',
  'custom-print-013.webp',
  'custom-print-014.webp',
  'custom-print-015.webp',
  'flower-stand-011.webp',
  'flower-stand-012.webp',
  'custom-print-016.webp',
  'flower-stand-013.webp',
  'flower-stand-014.webp'
];

// Search folders
const searchFolders = [
  'src/assets/middlemist-images',
  'src/assets/middlemist-images-backup',
  'src/assets/middlemist-ballones'
];

console.log('=== CHECKING FLOWER STAND IMAGES ===\n');

let found = 0;
let missing = [];

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
  } else {
    missing.push(img);
    console.log(`❌ ${img} - NOT FOUND`);
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
