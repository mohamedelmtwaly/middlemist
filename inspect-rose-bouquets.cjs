const fs = require('fs');
const path = require('path');

// Load the original products file
const productsData = JSON.parse(fs.readFileSync('middlemist-products.json', 'utf8'));

// Products from user's table (111 products)
const userProducts = [
  { id: 1, name: "باقة ميدل ميست مولودة", price: 250, description: "باقة ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-009.webp" },
  { id: 2, name: "باقة الزياره 4", price: 170, description: "باقة ورد طبيعي مناسبه للزيارات", image: "rose-bouquet-010.webp" },
  { id: 3, name: "باقة عيد الميلاد 2", price: 250, description: "باقة ورد طبيعي منوع على حسب", image: "rose-bouquet-011.webp" },
  { id: 4, name: "باقه مولودة ميدل ميست", price: 250, description: "باقة ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-012.webp" },
  { id: 5, name: "باقه المحبه والتقدير 3", price: 200, description: "باقه ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-013.webp" },
  { id: 6, name: "باقة حمد لله على السلامه", price: 250, description: "ورد طبيعي منوع", image: "rose-bouquet-014.webp" },
  { id: 7, name: "باقة الزهور الطبيعية", price: 250, description: "ورد طبيعي منوع", image: "rose-bouquet-015.webp" },
  { id: 8, name: "باقة ميدل ميست مولود", price: 250, description: "باقة ورد طبيعي منوع", image: "rose-bouquet-016.webp" },
  { id: 9, name: "باقه الخطوبة والزواج", price: 350, description: "باقة ورد احمر للمناسبات", image: "rose-bouquet-017.webp" },
  { id: 10, name: "باقة ميدل ميست فلاور 3", price: 200, description: "باقة ورد طبيعي منوع", image: "rose-bouquet-018.webp" },
  { id: 11, name: "بوكيه زياره", price: 150, description: "باقة ورد طبيعي منوع", image: "rose-bouquet-019.webp" },
  { id: 12, name: "بوكيه حمد لله على السلامه", price: 70, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-020.webp" },
  { id: 13, name: "باقة ميدل ميست فلاور 5", price: 280, description: "باقة ورد طبيعي منوع", image: "rose-bouquet-021.webp" },
  { id: 14, name: "باقة ميدل ميست فلاور مع تغليف راقي", price: 180, description: "باقة ورد طبيعي منوع", image: "rose-bouquet-022.webp" },
  { id: 15, name: "باقة ورد احمر للمناسبات الخاصه", price: 350, description: "ورد طبيعي على حسب الطلب", image: "rose-bouquet-023.webp" },
  { id: 16, name: "باقة مولود ميدل ميست", price: 170, description: "باقة ورد طبيعي منوع", image: "rose-bouquet-024.webp" },
  { id: 17, name: "باقة المولود 5", price: 350, description: "باقة ورد طبيعي منوع", image: "rose-bouquet-025.webp" },
  { id: 18, name: "باقة المشاعر والأحاسيس", price: 250, description: "باقة ورود طبيعي احمر فاخر", image: "rose-bouquet-026.webp" },
  { id: 19, name: "باقة الموده ميدل ميست", price: 350, description: "باقة ورد طبيعي منوع", image: "rose-bouquet-027.webp" },
  { id: 20, name: "بوكيه ورد الزياره", price: 100, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-028.webp" },
  { id: 21, name: "بوكيه المحبه", price: 170, description: "ورد طبيعي منوع", image: "rose-bouquet-029.webp" },
  { id: 22, name: "باقة حمد لله على السلامه", price: 170, description: "باقة ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-030.webp" },
  { id: 23, name: "باقة الزياره العائليه", price: 170, description: "باقة ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-031.webp" },
  { id: 24, name: "باقة الزياره العائليه والأهل والأصدقاء", price: 270, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-032.webp" },
  { id: 25, name: "باقة ميدل ميست الفاخره", price: 455, description: "باقه مميزه ورائعه", image: "rose-bouquet-033.webp" },
  { id: 26, name: "باقة الصداقة والمحبه والسلام", price: 170, description: "باقة ورد طبيعي منوع", image: "rose-bouquet-034.webp" },
  { id: 27, name: "باقة الزياره العائليه 3", price: 170, description: "باقه ورد طبيعي منوع", image: "rose-bouquet-035.webp" },
  { id: 28, name: "باقة أعياد ومناسبات", price: 200, description: "باقة ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-036.webp" },
  { id: 29, name: "باقه عيد الميلاد 3", price: 170, description: "باقة عيد ميلاد 3", image: "rose-bouquet-037.webp" },
  { id: 30, name: "باقة عيد الميلاد 5", price: 250, description: "ورد طبيعي منوع", image: "rose-bouquet-038.webp" },
  { id: 31, name: "باقة المناسبات والافراح", price: 180, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-039.webp" },
  { id: 32, name: "باقة عيد الميلاد 5", price: 300, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-040.webp" },
  { id: 33, name: "بوكيه الزياره", price: 150, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-041.webp" },
  { id: 34, name: "باقة ميدل ميست فلاور للمواليد", price: 200, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-042.webp" },
  { id: 35, name: "باقه الافراح ميدل ميست فلاور", price: 350, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-043.webp" },
  { id: 36, name: "باقة ورد للاعياد والمناسبات", price: 250, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-044.webp" },
  { id: 37, name: "باقه الصداقة والمحبه ميدل ميست فلاور", price: 280, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-045.webp" },
  { id: 38, name: "باقة ميدل ميست فلاور الفاخره 8", price: 280, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-046.webp" },
  { id: 39, name: "باقة الزياره العائليه", price: 130, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-047.webp" },
  { id: 40, name: "باقة الزياره العائليه والأهل", price: 180, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-048.webp" },
  { id: 41, name: "بوكيه زياره", price: 100, description: "ورد طبيعي منوع", image: "rose-bouquet-049.webp" },
  { id: 42, name: "بوكيه الصداقه", price: 120, description: "ورد طبيعي منوع", image: "rose-bouquet-050.webp" },
  { id: 43, name: "باقة ميدل ميست فلاور الفاخره 9", price: 350, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-051.webp" },
  { id: 44, name: "باقه للتسامح والاعتزاز", price: 220, description: "باقه ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-052.webp" },
  { id: 45, name: "باقه الشمعة", price: 250, description: "باقه ورد أحمر من دون الشمعة", image: "rose-bouquet-053.webp" },
  { id: 46, name: "باقه للتسامح والاعتزاز", price: 220, description: "باقه ورد طبيعي منوع", image: "rose-bouquet-054.webp" },
  { id: 47, name: "باقة باستيل ميدل ميست", price: 350, description: "ورد طبيعي", image: "rose-bouquet-055.webp" },
  { id: 48, name: "باقة التخرج والمناسبات الخاصة ميدل ميست", price: 280, description: "باقة ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-056.webp" },
  { id: 49, name: "باقة ميدل ميست فلاور الفاخره 8", price: 299, description: "باقة ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-057.webp" },
  { id: 50, name: "باقة ميدل ميست فلاور الفاخره 7", price: 299, description: "باقة ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-058.webp" },
  { id: 51, name: "بوكيه ورد الزياره", price: 130, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-059.webp" },
  { id: 52, name: "بوكيهات الزياره", price: 100, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-060.webp" },
  { id: 53, name: "باقه للاعياد والمناسبات الخاصه 5", price: 280, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-061.webp" },
  { id: 54, name: "باقة الخطوبة والمناسبات", price: 350, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-062.webp" },
  { id: 55, name: "بوكيه زياره", price: 100, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-063.webp" },
  { id: 56, name: "باقة ميدل ميست فلاور الفاخره 6", price: 350, description: "باقة ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-064.webp" },
  { id: 57, name: "باقه للاعياد والمناسبات الاجتماعيه", price: 350, description: "باقه ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-065.webp" },
  { id: 58, name: "باقة ميدل ميست مولودة 3", price: 290, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-066.webp" },
  { id: 59, name: "باقه جوجو", price: 189, description: "باقه للشكر", image: "rose-bouquet-067.webp" },
  { id: 60, name: "باقة الصداقه", price: 189, description: "ورد طبيعي منوع", image: "rose-bouquet-068.webp" },
  { id: 61, name: "باقه المحبه", price: 169, description: "ورد جوري فاخر", image: "rose-bouquet-069.webp" },
  { id: 62, name: "باقه عيد الحب", price: 299, description: "باقه فاخره", image: "rose-bouquet-070.webp" },
  { id: 63, name: "باقه همس الحب", price: 199, description: "ورد طبيعي منوع", image: "rose-bouquet-071.webp" },
  { id: 64, name: "باقه الغرام", price: 169, description: "ورد طبيعي منوع", image: "rose-bouquet-072.webp" },
  { id: 65, name: "باقة الجمال مع سلسال نسائى", price: 369, description: "ورد طبيعي منوع مع سلسال نسائى عيار 925 فضة", image: "rose-bouquet-073.webp" },
  { id: 66, name: "باقه الفخامه", price: 149, description: "ورد طبيعي منوع", image: "rose-bouquet-074.webp" },
  { id: 67, name: "باقة الذكرايات", price: 179, description: "ورد طبيعي منوع", image: "rose-bouquet-075.webp" },
  { id: 68, name: "باقة شكلت أني و داني", price: 259, description: "ورد مع شكلت فاخر", image: "rose-bouquet-076.webp" },
  { id: 69, name: "باقه اشراقه", price: 169, description: "ورد منوع جميل", image: "rose-bouquet-077.webp" },
  { id: 70, name: "باقه مكس الوان فوشي", price: 199, description: "مكس ألوان جميله مع إضافات أغصان كازا بلانكا هولندي", image: "rose-bouquet-078.webp" },
  { id: 71, name: "باقه ورد بيبي روز بنك بتصميم أنيق", price: 239, description: "باقة بيبي روز بتدرجات الوردي الفاتح", image: "rose-bouquet-079.webp" },
  { id: 72, name: "باقة المساء ميدل ميست", price: 249, description: "باقة ورد أحمر", image: "rose-bouquet-080.webp" },
  { id: 73, name: "باقة ورد احمر أنيقة", price: 239, description: "باقة ورد أحمر للمناسبات", image: "rose-bouquet-081.webp" },
  { id: 74, name: "باقة ورد بيبي روز بينك بتغليف جذاب", price: 239, description: "تنسيق باقة بمظهر ممتلئ", image: "rose-bouquet-082.webp" },
  { id: 75, name: "باقة الكازابلنكا", price: 369, description: "مكس الكازا بلانكا مع البيبي روز", image: "rose-bouquet-083.webp" },
  { id: 76, name: "باقة قبلت", price: 300, description: "باقة العمر 100 وردة حمراء", image: "rose-bouquet-084.webp" },
  { id: 77, name: "باقه الحب 1", price: 99, description: "ورد طبيعي منوع", image: "rose-bouquet-085.webp" },
  { id: 78, name: "باقه ورد تخرج", price: 229, description: "ورد طبيعي منوع", image: "rose-bouquet-086.webp" },
  { id: 79, name: "باقة شمس ي شموسه", price: 349, description: "ورد طبيعي منوع", image: "rose-bouquet-087.webp" },
  { id: 80, name: "باقة شمس 1", price: 349, description: "ورد طبيعي منوع", image: "rose-bouquet-088.webp" },
  { id: 81, name: "باقه ازرق مولود", price: 199, description: "ورد طبيعي منوع", image: "rose-bouquet-089.webp" },
  { id: 82, name: "باقه ورد الشفا", price: 299, description: "ورد طبيعي منوع", image: "rose-bouquet-090.webp" },
  { id: 83, name: "باقه ورد سماوي", price: 199, description: "ورد طبيعي منوع", image: "rose-bouquet-091.webp" },
  { id: 84, name: "باقه ورد طبيعي", price: 150, description: "منوعات من الورد", image: "rose-bouquet-092.webp" },
  { id: 85, name: "باقه ورد طبيعي", price: 229, description: "ورد منوع", image: "rose-bouquet-093.webp" },
  { id: 86, name: "باقه ورد", price: 159, description: "ورد متنوع كل صنف", image: "rose-bouquet-094.webp" },
  { id: 87, name: "باقه ورد", price: 50, description: "ورد طبيعي", image: "rose-bouquet-095.webp" },
  { id: 88, name: "باقة ورد طبيعي", price: 159, description: "ورد طبيعي منوع وتغليف وكرت شكر", image: "rose-bouquet-096.webp" },
  { id: 89, name: "باقة ورد احمر", price: 170, description: "تنسيق حسب الطلب", image: "rose-bouquet-098.webp" },
  { id: 90, name: "باقة الميلاد مع سلسال نسائي", price: 349, description: "باقه ورد مع سلسال نسائي حسب الطلب", image: "rose-bouquet-099.webp" },
  { id: 91, name: "باقة تخرج 2", price: 249, description: "باقه للتخاريج والمناسبات", image: "rose-bouquet-100.webp" },
  { id: 92, name: "باقه الموده 3", price: 150, description: "باقه ورد تعبر عن الموده", image: "rose-bouquet-101.webp" },
  { id: 93, name: "باقه الزياره", price: 139, description: "باقه للزياره والأفراح", image: "rose-bouquet-102.webp" },
  { id: 94, name: "باقه المحبه", price: 150, description: "ورد طبيعي مع تغليف راقي", image: "rose-bouquet-103.webp" },
  { id: 95, name: "باقة للشكر والعرفان", price: 128, description: "باقه ورد طبيعي مع تغليف راقي", image: "rose-bouquet-104.webp" },
  { id: 96, name: "باقة جزال ميدل ميست", price: 390, description: "ورد صناعي", image: "rose-bouquet-105.webp" },
  { id: 97, name: "باقة الصداقة والمحبه", price: 150, description: "ورد طبيعي منوع", image: "rose-bouquet-106.webp" },
  { id: 98, name: "باقة عيد الحب ميدل ميست", price: 170, description: "ورد طبيعي أحمر مع تغليف راقي", image: "rose-bouquet-107.webp" },
  { id: 99, name: "باقة ميدل ميست مولودة", price: 170, description: "للمواليد", image: "rose-bouquet-108.webp" },
  { id: 100, name: "باقة الصداقة والمحبه", price: 200, description: "ورد طبيعي منوع على حسب الطلب", image: "rose-bouquet-109.webp" },
  { id: 101, name: "باقة الزياره", price: 150, description: "ورد طبيعي على حسب الطلب", image: "rose-bouquet-110.webp" },
  { id: 102, name: "باقة متنوعة", price: 150, description: "ورد طبيعي", image: "rose-bouquet-111.webp" },
  { id: 103, name: "باقة ملهمه ميدل ميست", price: 390, description: "ورد صناعي", image: "rose-bouquet-113.webp" },
  { id: 104, name: "باقة مولوده تحمد بالسلامة", price: 130, description: "باقة مولودة تحمد بالسلامة", image: "rose-bouquet-114.webp" },
  { id: 105, name: "باقة مراسيل", price: 199, description: "ورد طبيعي", image: "rose-bouquet-115.webp" },
  { id: 106, name: "باقة الحمدالله على السلامه", price: 269, description: "يمكنكم تغيير ألوان الورد حسب رغبتكم", image: "rose-bouquet-116.webp" },
  { id: 107, name: "باقة ورد اصفر تغليف قماش", price: 225, description: "يمكنكم تغيير ألوان الورد حسب رغبتكم", image: "rose-bouquet-117.webp" },
  { id: 108, name: "باقة كلاسيك هولندي", price: 369, description: "يمكنكم تغيير ألوان الورد حسب رغبتكم", image: "rose-bouquet-118.webp" },
  { id: 109, name: "باقة مشاعر", price: 329, description: "يمكنكم تغيير ألوان الورد حسب رغبتكم", image: "rose-bouquet-119.webp" },
  { id: 110, name: "باقة اعتذار", price: 189, description: "يمكنكم تغيير ألوان الورد حسب رغبتك", image: "rose-bouquet-120.webp" },
  { id: 111, name: "باقة ميدل ميست", price: 199, description: "يمكنكم تغيير ألوان الورد حسب رغبتك", image: "rose-bouquet-121.webp" }
];

// Local images path
const imagesPath = path.join(__dirname, 'src', 'assets', 'middlemist-images');

console.log('🔍 Starting inspection of 111 rose bouquet products...\n');

let matchedCount = 0;
let notFoundCount = 0;
let priceMismatchCount = 0;
let descMismatchCount = 0;
let imageMismatchCount = 0;
let missingImages = [];

console.log('=== PRODUCT DATA VERIFICATION ===\n');

for (const userProduct of userProducts) {
  // Find matching product in source by name and image
  const sourceProduct = productsData.products.find(p => 
    p.name === userProduct.name && 
    p.image_filename === userProduct.image
  );

  if (!sourceProduct) {
    console.log(`❌ #${userProduct.id} NOT FOUND: ${userProduct.name} (${userProduct.image})`);
    notFoundCount++;
    continue;
  }

  // Check price
  const priceMatch = Math.abs(sourceProduct.price - userProduct.price) < 0.01;
  
  // Check description (normalize spaces and commas)
  const normalizeDesc = (desc) => desc.replace(/[\s,،.]/g, '').toLowerCase();
  const descMatch = normalizeDesc(sourceProduct.description) === normalizeDesc(userProduct.description);

  // Check if image file exists locally
  const imagePath = path.join(imagesPath, userProduct.image);
  const imageExists = fs.existsSync(imagePath);

  console.log(`✅ #${userProduct.id} MATCHED: ${userProduct.name}`);
  console.log(`   Source Price: ${sourceProduct.price} | User Price: ${userProduct.price} ${priceMatch ? '✓' : '✗'}`);
  console.log(`   Source Desc: ${sourceProduct.description}`);
  console.log(`   User Desc:  ${userProduct.description} ${descMatch ? '✓' : '✗'}`);
  console.log(`   Image: ${userProduct.image} ${imageExists ? '✓ EXISTS' : '✗ MISSING'}`);
  console.log('');

  matchedCount++;
  
  if (!priceMatch) priceMismatchCount++;
  if (!descMatch) descMismatchCount++;
  if (!imageExists) {
    imageMismatchCount++;
    missingImages.push(userProduct.image);
  }
}

console.log('\n=== SUMMARY ===');
console.log(`Total products to check: ${userProducts.length}`);
console.log(`✅ Matched in source: ${matchedCount}`);
console.log(`❌ Not found in source: ${notFoundCount}`);
console.log(`⚠️  Price mismatches: ${priceMismatchCount}`);
console.log(`⚠️  Description mismatches: ${descMismatchCount}`);
console.log(`⚠️  Missing images locally: ${imageMismatchCount}`);

if (missingImages.length > 0) {
  console.log('\n=== MISSING IMAGES ===');
  missingImages.forEach(img => console.log(`  - ${img}`));
}

console.log('\n=== RECOMMENDATION ===');
if (notFoundCount > 0) {
  console.log('⚠️  Some products are not in the source file. Review them before proceeding.');
}
if (priceMismatchCount > 0 || descMismatchCount > 0) {
  console.log('⚠️  Some products have data mismatches. Review the differences above.');
}
if (imageMismatchCount > 0) {
  console.log('⚠️  Some images are missing locally. Check the src/assets/middlemist-images folder.');
}
if (notFoundCount === 0 && priceMismatchCount === 0 && descMismatchCount === 0 && imageMismatchCount === 0) {
  console.log('✅ All products verified successfully. Ready for import.');
}
