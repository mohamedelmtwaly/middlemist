const fs = require('fs');
const path = require('path');

// Required images from the 55 balloon products
const requiredImages = [
  'rose-bouquet-124.webp',
  'rose-bouquet-125.webp',
  'rose-bouquet-126.webp',
  'rose-bouquet-127.webp',
  'rose-bouquet-128.webp',
  'balloon-arrangement-017.webp',
  'balloon-arrangement-018.webp',
  'balloon-arrangement-019.webp',
  'balloon-arrangement-020.webp',
  'balloon-arrangement-021.webp',
  'balloon-arrangement-022.webp',
  'balloon-arrangement-023.webp',
  'balloon-arrangement-024.webp',
  'balloon-arrangement-025.webp',
  'balloon-arrangement-026.webp',
  'balloon-arrangement-027.webp',
  'balloon-arrangement-028.webp',
  'balloon-arrangement-029.webp',
  'balloon-arrangement-030.webp',
  'balloon-arrangement-031.webp',
  'balloon-arrangement-032.webp',
  'balloon-arrangement-033.webp',
  'balloon-arrangement-034.webp',
  'balloon-arrangement-035.webp',
  'balloon-arrangement-036.webp',
  'balloon-arrangement-037.webp',
  'balloon-arrangement-038.webp',
  'balloon-arrangement-039.webp',
  'balloon-arrangement-040.webp',
  'balloon-arrangement-041.webp',
  'balloon-arrangement-042.webp',
  'balloon-arrangement-043.webp',
  'balloon-arrangement-044.webp',
  'balloon-arrangement-045.webp',
  'balloon-arrangement-046.webp',
  'balloon-arrangement-047.webp',
  'balloon-arrangement-048.webp',
  'balloon-arrangement-049.webp',
  'balloon-arrangement-050.webp',
  'balloon-arrangement-051.webp',
  'balloon-arrangement-052.webp',
  'balloon-arrangement-053.webp',
  'balloon-arrangement-054.webp',
  'balloon-arrangement-055.webp',
  'balloon-arrangement-056.webp',
  'balloon-arrangement-057.webp',
  'balloon-arrangement-058.webp',
  'balloon-arrangement-059.webp',
  'balloon-arrangement-060.webp',
  'balloon-arrangement-061.webp',
  'balloon-arrangement-062.webp',
  'balloon-arrangement-063.webp',
  'balloon-arrangement-064.webp',
  'balloon-arrangement-065.webp',
  'balloon-arrangement-066.webp'
];

// Search folders
const searchFolders = [
  'src/assets/middlemist-images',
  'src/assets/middlemist-images-backup',
  'src/assets/middlemist-ballones'
];

console.log('=== CHECKING BALLOON IMAGES ===\n');

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
