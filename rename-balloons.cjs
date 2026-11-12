const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'src/assets/middlemist-images');

// Mapping of original files to new names (keeping original extensions)
const fileMapping = [
  { original: 'image1.jpeg', new: 'balloon-arrangement-017.jpeg' },
  { original: 'image2.jpeg', new: 'balloon-arrangement-018.jpeg' },
  { original: 'image3.jpeg', new: 'balloon-arrangement-019.jpeg' },
  { original: 'image4.jpeg', new: 'balloon-arrangement-020.jpeg' },
  { original: 'image5.jpeg', new: 'balloon-arrangement-021.jpeg' },
  { original: 'image6.jpeg', new: 'balloon-arrangement-022.jpeg' },
  { original: 'image7.jpeg', new: 'balloon-arrangement-023.jpeg' },
  { original: 'image8.jpeg', new: 'balloon-arrangement-024.jpeg' },
  { original: 'image9.jpeg', new: 'balloon-arrangement-025.jpeg' },
  { original: 'image10.jpeg', new: 'balloon-arrangement-026.jpeg' },
  { original: 'image11.jpeg', new: 'balloon-arrangement-027.jpeg' },
  { original: 'image12.jpeg', new: 'balloon-arrangement-028.jpeg' },
  { original: 'image13.jpeg', new: 'balloon-arrangement-029.jpeg' },
  { original: 'image14.jpeg', new: 'balloon-arrangement-030.jpeg' },
  { original: 'image15.png', new: 'balloon-arrangement-031.png' },
  { original: 'image16.png', new: 'balloon-arrangement-032.png' },
  { original: 'image17.png', new: 'balloon-arrangement-033.png' },
  { original: 'image18.jpeg', new: 'balloon-arrangement-034.jpeg' },
  { original: 'image19.jpeg', new: 'balloon-arrangement-035.jpeg' },
  { original: 'image20.jpeg', new: 'balloon-arrangement-036.jpeg' },
  { original: 'image26.jpeg', new: 'balloon-arrangement-037.jpeg' },
  { original: 'image27.jpeg', new: 'balloon-arrangement-038.jpeg' },
  { original: 'image28.jpeg', new: 'balloon-arrangement-039.jpeg' },
  { original: 'image29.jpeg', new: 'balloon-arrangement-040.jpeg' },
  { original: 'image30.jpeg', new: 'balloon-arrangement-041.jpeg' },
  { original: 'image31.jpeg', new: 'balloon-arrangement-042.jpeg' },
  { original: 'image32.jpeg', new: 'balloon-arrangement-043.jpeg' },
  { original: 'image33.jpeg', new: 'balloon-arrangement-044.jpeg' },
  { original: 'image34.jpeg', new: 'balloon-arrangement-045.jpeg' },
  { original: 'image35.jpeg', new: 'balloon-arrangement-046.jpeg' },
  { original: 'image36.jpeg', new: 'balloon-arrangement-047.jpeg' },
  { original: 'image37.jpeg', new: 'balloon-arrangement-048.jpeg' },
  { original: 'image38.jpeg', new: 'balloon-arrangement-049.jpeg' },
  { original: 'image39.jpeg', new: 'balloon-arrangement-050.jpeg' },
  { original: 'image40.jpeg', new: 'balloon-arrangement-051.jpeg' },
  { original: 'image41.jpeg', new: 'balloon-arrangement-052.jpeg' },
  { original: 'image42.jpeg', new: 'balloon-arrangement-053.jpeg' },
  { original: 'image43.jpeg', new: 'balloon-arrangement-054.jpeg' },
  { original: 'image44.jpeg', new: 'balloon-arrangement-055.jpeg' },
  { original: 'image45.jpeg', new: 'balloon-arrangement-056.jpeg' },
  { original: 'image46.jpeg', new: 'balloon-arrangement-057.jpeg' },
  { original: 'image47.jpeg', new: 'balloon-arrangement-058.jpeg' },
  { original: 'image48.jpeg', new: 'balloon-arrangement-059.jpeg' },
  { original: 'image49.jpeg', new: 'balloon-arrangement-060.jpeg' },
  { original: 'image50.jpeg', new: 'balloon-arrangement-061.jpeg' },
  { original: 'image51.jpeg', new: 'balloon-arrangement-062.jpeg' },
  { original: 'image52.png', new: 'balloon-arrangement-063.png' },
  { original: 'image53.png', new: 'balloon-arrangement-064.png' },
  { original: 'image54.jpeg', new: 'balloon-arrangement-065.jpeg' },
  { original: 'image55.jpeg', new: 'balloon-arrangement-066.jpeg' },
  { original: 'image56.jpeg', new: 'balloon-arrangement-067.jpeg' },
  { original: 'image57.jpeg', new: 'balloon-arrangement-068.jpeg' },
  { original: 'image58.jpeg', new: 'balloon-arrangement-069.jpeg' },
  { original: 'image59.png', new: 'balloon-arrangement-070.png' },
  { original: 'image60.png', new: 'balloon-arrangement-071.png' },
  { original: 'image61.png', new: 'balloon-arrangement-072.png' },
  { original: 'image62.jpeg', new: 'balloon-arrangement-073.jpeg' },
];

console.log(`Total files to rename: ${fileMapping.length}`);
console.log(`Images directory: ${imagesDir}\n`);

let successCount = 0;
let failCount = 0;
let errors = [];

fileMapping.forEach(mapping => {
  const originalPath = path.join(imagesDir, mapping.original);
  const newPath = path.join(imagesDir, mapping.new);

  try {
    // Check if original exists
    if (!fs.existsSync(originalPath)) {
      throw new Error(`Original file not found: ${mapping.original}`);
    }

    // Check if target already exists
    if (fs.existsSync(newPath)) {
      throw new Error(`Target file already exists: ${mapping.new}`);
    }

    // Copy the file (keeping original)
    fs.copyFileSync(originalPath, newPath);
    successCount++;
    console.log(`✓ ${mapping.original} → ${mapping.new}`);
  } catch (error) {
    failCount++;
    errors.push({ file: mapping.original, error: error.message });
    console.error(`✗ ${mapping.original}: ${error.message}`);
  }
});

console.log('\n=== Summary ===');
console.log(`Success: ${successCount}`);
console.log(`Failed: ${failCount}`);
console.log(`Total: ${fileMapping.length}`);

if (errors.length > 0) {
  console.log('\nErrors:');
  errors.forEach(err => {
    console.log(`  ${err.file}: ${err.error}`);
  });
}

if (failCount === 0) {
  console.log('\n✓ All files renamed successfully!');
  console.log('✓ Original files preserved in backup directory');
} else {
  console.log('\n✗ Some files failed to rename');
  process.exit(1);
}
