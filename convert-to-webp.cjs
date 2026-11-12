const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, 'src/assets/middlemist-images');

// Target files: balloon-arrangement-017 to balloon-arrangement-073
const targetFiles = [];
for (let i = 17; i <= 73; i++) {
  const num = i.toString().padStart(3, '0');
  targetFiles.push(`balloon-arrangement-${num}`);
}

console.log(`Target files: ${targetFiles.length}`);
console.log(`Images directory: ${imagesDir}\n`);

async function convertFiles() {
  let successCount = 0;
  let failCount = 0;
  let errors = [];
  let conversionResults = [];

  // Find all matching files
  const allFiles = fs.readdirSync(imagesDir);

  for (const baseName of targetFiles) {
    // Find files with this base name (could be .jpeg, .png, or .webp)
    const matchingFiles = allFiles.filter(f => f.startsWith(baseName) && (f.endsWith('.jpeg') || f.endsWith('.png')));
    
    if (matchingFiles.length === 0) {
      console.log(`⚠ No source file found for: ${baseName}`);
      continue;
    }

    // Use the first matching file
    const sourceFile = matchingFiles[0];
    const sourcePath = path.join(imagesDir, sourceFile);
    const targetFile = `${baseName}.webp`;
    const targetPath = path.join(imagesDir, targetFile);

    // Check if target already exists
    if (fs.existsSync(targetPath)) {
      console.log(`⚠ Target already exists: ${targetFile} (skipping)`);
      continue;
    }

    try {
      // Get original file size
      const originalStats = fs.statSync(sourcePath);
      const originalSize = originalStats.size;

      // Convert to WebP with quality 85
      const info = await sharp(sourcePath)
        .webp({ quality: 85 })
        .toFile(targetPath);

      const newSize = info.size;
      const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
      
      successCount++;
      conversionResults.push({
        source: sourceFile,
        target: targetFile,
        originalSize: originalSize,
        newSize: newSize,
        savings: savings
      });
      
      console.log(`✓ ${sourceFile} → ${targetFile} (${originalSize} → ${newSize} bytes, ${savings}% smaller)`);
    } catch (error) {
      failCount++;
      errors.push({ file: sourceFile, error: error.message });
      console.error(`✗ ${sourceFile}: ${error.message}`);
    }
  }

  console.log('\n=== Conversion Summary ===');
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total: ${targetFiles.length}`);

  if (conversionResults.length > 0) {
    console.log('\n=== Size Comparison ===');
    conversionResults.forEach(result => {
      console.log(`${result.source} → ${result.target}: ${result.originalSize} → ${result.newSize} bytes (${result.savings}% savings)`);
    });
  }

  if (errors.length > 0) {
    console.log('\n=== Errors ===');
    errors.forEach(err => {
      console.log(`${err.file}: ${err.error}`);
    });
  }

  if (failCount === 0) {
    console.log('\n✓ All files converted successfully!');
  } else {
    console.log('\n✗ Some files failed to convert');
    process.exit(1);
  }
}

convertFiles().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
