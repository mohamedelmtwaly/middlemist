const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Category ID for باقات الورد
const CATEGORY_ID = '44ab4768-8ab8-49a2-964e-2779d3860a24';
const CATEGORY_NAME = 'باقات الورد';

// Load the original products file
const productsData = JSON.parse(fs.readFileSync('middlemist-products.json', 'utf8'));

// User's product list (111 products) - we'll filter out the 3 not found
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
  // Skip #82 - not found in source
  { id: 83, name: "باقه ورد سماوي", price: 199, description: "ورد طبيعي منوع", image: "rose-bouquet-091.webp" },
  { id: 84, name: "باقه ورد طبيعي", price: 150, description: "منوعات من الورد", image: "rose-bouquet-092.webp" },
  // Skip #85 - not found in source
  // Skip #86 - not found in source
  { id: 87, name: "باقه ورد", price: 50, description: "ورد طبيعي", image: "rose-bouquet-095.webp" },
  // Skip #88 - image not found in backup
  { id: 89, name: "باقة ورد احمر", price: 170, description: "تنسيق حسب الطلب", image: "rose-bouquet-098.webp" },
  // Skip #90-92 - images not found in backup
  { id: 93, name: "باقه الزياره", price: 139, description: "باقه للزياره والأفراح", image: "rose-bouquet-102.webp" },
  // Skip #94-102 - images not found in backup
  { id: 103, name: "باقة ملهمه ميدل ميست", price: 390, description: "ورد صناعي", image: "rose-bouquet-113.webp" },
  { id: 103, name: "باقة ملهمه ميدل ميست", price: 390, description: "ورد صناعي", image: "rose-bouquet-113.webp" },
  // Skip #104-111 - images not found in backup
];

// Local path to images
const imagesPath = path.join(__dirname, 'src', 'assets', 'middlemist-images');

async function uploadImage(filename) {
  const filePath = path.join(imagesPath, filename);
  const fileBuffer = fs.readFileSync(filePath);
  const fileExt = path.extname(filename);
  const storagePath = `products/rose-bouquets/${filename}`;

  console.log(`📤 Uploading ${filename} to Supabase Storage...`);

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(storagePath, fileBuffer, {
      contentType: 'image/webp',
      upsert: true
    });

  if (error) {
    throw error;
  }

  console.log(`✅ Uploaded ${filename} successfully`);

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(storagePath);

  return publicUrl;
}

async function getHighestSortOrder() {
  const { data, error } = await supabase
    .from('products')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return 0;
  }

  return data[0].sort_order || 0;
}

async function addProduct(product, imageUrl, sortOrder) {
  console.log(`📝 Adding product: ${product.name}`);

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: product.name,
      category: CATEGORY_NAME,
      category_id: CATEGORY_ID,
      subcategory_id: null,
      price: product.price,
      image_url: imageUrl,
      description: product.description,
      is_active: true,
      sort_order: sortOrder,
      occasions: null,
      display_sections: null
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  console.log(`✅ Added product: ${product.name} (ID: ${data.id})`);
  return data;
}

async function main() {
  console.log('🚀 Starting to add rose bouquet products...\n');

  try {
    // Step 1: Get highest sort_order
    console.log('📊 Getting highest sort_order...');
    const highestSortOrder = await getHighestSortOrder();
    console.log(`✅ Highest sort_order: ${highestSortOrder}\n`);

    // Step 1.5: Check for existing products with this category
    console.log('🔍 Checking for existing products in category...');
    const { data: existingProducts } = await supabase
      .from('products')
      .select('name, image_url')
      .eq('category_id', CATEGORY_ID);
    
    const existingNamesAndImages = new Set();
    if (existingProducts) {
      existingProducts.forEach(p => existingNamesAndImages.add(`${p.name}|${p.image_url}`));
    }
    console.log(`✅ Found ${existingProducts?.length || 0} existing products in category\n`);

    // Step 2: Upload images and add products
    let currentSortOrder = highestSortOrder + 1;
    let addedCount = 0;
    let skippedCount = 0;
    let alreadyExistsCount = 0;

    for (const userProduct of userProducts) {
      // Skip products without images
      const imagePath = path.join(imagesPath, userProduct.image);
      if (!fs.existsSync(imagePath)) {
        console.log(`⏭️  Skipping #${userProduct.id} (image not found): ${userProduct.name} (${userProduct.image})`);
        skippedCount++;
        continue;
      }

      try {
        // Check if product already exists (name + image combination)
        const existingKey = `${userProduct.name}|products/rose-bouquets/${userProduct.image}`;
        if (existingNamesAndImages.has(existingKey)) {
          console.log(`⏭️  Skipping #${userProduct.id} (already exists): ${userProduct.name}`);
          alreadyExistsCount++;
          continue;
        }

        // Upload image
        const imageUrl = await uploadImage(userProduct.image);
        console.log(`🔗 Image URL: ${imageUrl}\n`);

        // Add product
        await addProduct(userProduct, imageUrl, currentSortOrder);
        currentSortOrder++;
        addedCount++;

        console.log('---\n');
      } catch (error) {
        console.error(`❌ Error processing ${userProduct.name}:`, error.message);
        throw error;
      }
    }

    console.log('🎉 All products added successfully!');
    console.log(`\n📦 Total products added: ${addedCount}`);
    console.log(`📦 Total products skipped (no image): ${skippedCount}`);
    console.log(`📦 Total products skipped (already exists): ${alreadyExistsCount}`);
    console.log(`📁 Category: ${CATEGORY_NAME} (ID: ${CATEGORY_ID})`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
