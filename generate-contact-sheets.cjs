const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'src/assets/middlemist-images');
const outputDir = path.join(__dirname, 'preview-sheets');

// Get all image files starting with 'image'
const imageFiles = fs.readdirSync(imagesDir)
  .filter(file => file.startsWith('image') && (file.endsWith('.jpeg') || file.endsWith('.jpg') || file.endsWith('.png')))
  .sort();

console.log(`Found ${imageFiles.length} image files`);
console.log('Files:', imageFiles);

// Group images into batches of 12
const batchSize = 12;
const batches = [];
for (let i = 0; i < imageFiles.length; i += batchSize) {
  batches.push(imageFiles.slice(i, i + batchSize));
}

console.log(`Created ${batches.length} batches`);

// Generate HTML contact sheets for each batch
batches.forEach((batch, batchIndex) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Contact Sheet ${batchIndex + 1}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background: #f5f5f5;
    }
    .sheet {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .item img {
      max-width: 200px;
      max-height: 200px;
      object-fit: contain;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #fff;
    }
    .item .filename {
      margin-top: 8px;
      font-size: 12px;
      color: #666;
      text-align: center;
      word-break: break-all;
    }
    h1 {
      text-align: center;
      color: #333;
    }
  </style>
</head>
<body>
  <h1>Contact Sheet ${batchIndex + 1} (${batch.length} images)</h1>
  <div class="sheet">
    ${batch.map(file => `
      <div class="item">
        <img src="../src/assets/middlemist-images/${file}" alt="${file}">
        <div class="filename">${file}</div>
      </div>
    `).join('')}
  </div>
</body>
</html>
  `;

  const outputPath = path.join(outputDir, `contact-sheet-${batchIndex + 1}.html`);
  fs.writeFileSync(outputPath, html);
  console.log(`Generated: ${outputPath}`);
});

console.log('\nContact sheets generated successfully!');
console.log(`Output directory: ${outputDir}`);
