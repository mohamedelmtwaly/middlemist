const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = 'c:\\Users\\Meto\\Downloads\\middlemist_product_image_names (1).xlsx';

try {
  console.log('Reading Excel file:', excelPath);
  
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  console.log('\nFound', data.length, 'rows');
  console.log('\nFirst 5 rows:');
  console.log(JSON.stringify(data.slice(0, 5), null, 2));
  
  console.log('\nColumn headers:', Object.keys(data[0] || {}));
  
  // Save as JSON for reference
  const outputPath = path.join(__dirname, 'product-image-mapping.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('\n✓ Data saved to:', outputPath);
  
} catch (error) {
  console.error('Error reading Excel file:', error.message);
  process.exit(1);
}
