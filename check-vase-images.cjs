const fs = require('fs');
const path = require('path');

// Required images from the 57 vases products
const requiredImages = [
  'flower-vase-004.webp',
  'flower-vase-005.webp',
  'flower-vase-006.webp',
  'flower-vase-007.webp',
  'flower-vase-008.webp',
  'flower-vase-009.webp',
  'flower-vase-010.webp',
  'flower-vase-011.webp',
  'flower-vase-012.webp',
  'flower-vase-013.webp',
  'flower-vase-014.webp',
  'flower-vase-015.webp',
  'rose-bouquet-007.webp', // Special case
  'flower-vase-016.webp',
  'flower-vase-017.webp',
  'flower-vase-018.webp',
  'flower-vase-019.webp',
  'flower-vase-020.webp',
  'flower-vase-021.webp',
  'flower-vase-022.webp',
  'flower-vase-023.webp',
  'flower-vase-024.webp',
  'flower-vase-025.webp',
  'flower-vase-026.webp',
  'flower-vase-027.webp',
  'flower-vase-028.webp',
  'flower-vase-029.webp',
  'flower-vase-030.webp',
  'flower-vase-031.webp',
  'flower-vase-032.webp',
  'flower-vase-033.webp',
  'rose-bouquet-008.webp', // Special case
  'flower-vase-034.webp',
  'flower-vase-035.webp',
  'flower-vase-036.webp',
  'flower-vase-037.webp',
  'flower-vase-038.webp',
  'flower-vase-039.webp',
  'flower-vase-040.webp',
  'flower-vase-041.webp',
  'flower-vase-042.webp',
  'flower-vase-043.webp',
  'flower-vase-044.webp',
  'flower-vase-045.webp',
  'flower-vase-046.webp',
  'flower-vase-047.webp',
  'balloon-arrangement-004.webp', // Special case
  'flower-vase-048.webp',
  'flower-vase-049.webp',
  'flower-vase-050.webp',
  'flower-vase-051.webp',
  'flower-vase-052.webp',
  'flower-vase-053.webp',
  'flower-vase-054.webp',
  'flower-vase-055.webp',
  'flower-vase-056.webp',
  'flower-vase-057.webp'
];

// Search folders
const searchFolders = [
  'src/assets/middlemist-images',
  'src/assets/middlemist-images-backup',
  'src/assets/middlemist-ballones'
];

console.log('=== CHECKING VASE IMAGES ===\n');

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
