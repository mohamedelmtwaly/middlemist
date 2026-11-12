const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'src/assets/middlemist-images');

// Mapping of original files to new names
const fileMapping = [
  { original: 'image1.jpeg', new: 'balloon-arrangement-017.webp' },
  { original: 'image2.jpeg', new: 'balloon-arrangement-018.webp' },
  { original: 'image3.jpeg', new: 'balloon-arrangement-019.webp' },
  { original: 'image4.jpeg', new: 'balloon-arrangement-020.webp' },
  { original: 'image5.jpeg', new: 'balloon-arrangement-021.webp' },
  { original: 'image6.jpeg', new: 'balloon-arrangement-022.webp' },
  { original: 'image7.jpeg', new: 'balloon-arrangement-023.webp' },
  { original: 'image8.jpeg', new: 'balloon-arrangement-024.webp' },
  { original: 'image9.jpeg', new: 'balloon-arrangement-025.webp' },
  { original: 'image10.jpeg', new: 'balloon-arrangement-026.webp' },
  { original: 'image11.jpeg', new: 'balloon-arrangement-027.webp' },
  { original: 'image12.jpeg', new: 'balloon-arrangement-028.webp' },
  { original: 'image13.jpeg', new: 'balloon-arrangement-029.webp' },
  { original: 'image14.jpeg', new: 'balloon-arrangement-030.webp' },
  { original: 'image15.png', new: 'balloon-arrangement-031.webp' },
  { original: 'image16.png', new: 'balloon-arrangement-032.webp' },
  { original: 'image17.png', new: 'balloon-arrangement-033.webp' },
  { original: 'image18.jpeg', new: 'balloon-arrangement-034.webp' },
  { original: 'image19.jpeg', new: 'balloon-arrangement-035.webp' },
  { original: 'image20.jpeg', new: 'balloon-arrangement-036.webp' },
  { original: 'image26.jpeg', new: 'balloon-arrangement-037.webp' },
  { original: 'image27.jpeg', new: 'balloon-arrangement-038.webp' },
  { original: 'image28.jpeg', new: 'balloon-arrangement-039.webp' },
  { original: 'image29.jpeg', new: 'balloon-arrangement-040.webp' },
  { original: 'image30.jpeg', new: 'balloon-arrangement-041.webp' },
  { original: 'image31.jpeg', new: 'balloon-arrangement-042.webp' },
  { original: 'image32.jpeg', new: 'balloon-arrangement-043.webp' },
  { original: 'image33.jpeg', new: 'balloon-arrangement-044.webp' },
  { original: 'image34.jpeg', new: 'balloon-arrangement-045.webp' },
  { original: 'image35.jpeg', new: 'balloon-arrangement-046.webp' },
  { original: 'image36.jpeg', new: 'balloon-arrangement-047.webp' },
  { original: 'image37.jpeg', new: 'balloon-arrangement-048.webp' },
  { original: 'image38.jpeg', new: 'balloon-arrangement-049.webp' },
  { original: 'image39.jpeg', new: 'balloon-arrangement-050.webp' },
  { original: 'image40.jpeg', new: 'balloon-arrangement-051.webp' },
  { original: 'image41.jpeg', new: 'balloon-arrangement-052.webp' },
  { original: 'image42.jpeg', new: 'balloon-arrangement-053.webp' },
  { original: 'image43.jpeg', new: 'balloon-arrangement-054.webp' },
  { original: 'image44.jpeg', new: 'balloon-arrangement-055.webp' },
  { original: 'image45.jpeg', new: 'balloon-arrangement-056.webp' },
  { original: 'image46.jpeg', new: 'balloon-arrangement-057.webp' },
  { original: 'image47.jpeg', new: 'balloon-arrangement-058.webp' },
  { original: 'image48.jpeg', new: 'balloon-arrangement-059.webp' },
  { original: 'image49.jpeg', new: 'balloon-arrangement-060.webp' },
  { original: 'image50.jpeg', new: 'balloon-arrangement-061.webp' },
  { original: 'image51.jpeg', new: 'balloon-arrangement-062.webp' },
  { original: 'image52.png', new: 'balloon-arrangement-063.webp' },
  { original: 'image53.png', new: 'balloon-arrangement-064.webp' },
  { original: 'image54.jpeg', new: 'balloon-arrangement-065.webp' },
  { original: 'image55.jpeg', new: 'balloon-arrangement-066.webp' },
  { original: 'image56.jpeg', new: 'balloon-arrangement-067.webp' },
  { original: 'image57.jpeg', new: 'balloon-arrangement-068.webp' },
  { original: 'image58.jpeg', new: 'balloon-arrangement-069.webp' },
  { original: 'image59.png', new: 'balloon-arrangement-070.webp' },
  { original: 'image60.png', new: 'balloon-arrangement-071.webp' },
  { original: 'image61.png', new: 'balloon-arrangement-072.webp' },
  { original: 'image62.jpeg', new: 'balloon-arrangement-073.webp' },
];

console.log(`Total files to convert: ${fileMapping.length}`);
console.log(`Images directory: ${imagesDir}\n`);

// Check if all original files exist
let missingFiles = [];
fileMapping.forEach(mapping => {
  const originalPath = path.join(imagesDir, mapping.original);
  if (!fs.existsSync(originalPath)) {
    missingFiles.push(mapping.original);
  }
});

if (missingFiles.length > 0) {
  console.error('ERROR: Missing original files:');
  missingFiles.forEach(file => console.error(`  - ${file}`));
  process.exit(1);
}

console.log('✓ All original files found');

// Check if any new files already exist
let conflictingFiles = [];
fileMapping.forEach(mapping => {
  const newPath = path.join(imagesDir, mapping.new);
  if (fs.existsSync(newPath)) {
    conflictingFiles.push(mapping.new);
  }
});

if (conflictingFiles.length > 0) {
  console.error('ERROR: Target files already exist:');
  conflictingFiles.forEach(file => console.error(`  - ${file}`));
  console.error('Aborting to prevent overwrite.');
  process.exit(1);
}

console.log('✓ No conflicts with existing files');
console.log('\nConversion process will use browser (requires manual intervention).');
console.log('Please use a tool like Squoosh.app or similar to convert the images.');
console.log('\nConversion list:');
fileMapping.forEach(mapping => {
  console.log(`  ${mapping.original} → ${mapping.new}`);
});

console.log('\nNote: Since ImageMagick is not available, manual conversion is required.');
console.log('Alternatively, you can use an online converter or install ImageMagick.');
