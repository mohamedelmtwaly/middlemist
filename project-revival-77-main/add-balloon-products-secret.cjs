const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, '.env.local');
dotenv.config({ path: envPath });

console.log('='.repeat(80));
console.log('إضافة منتجات البالونات إلى قاعدة البيانات (باستخدام Secret Key)');
console.log('='.repeat(80));

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error('✗ خطأ: Missing Supabase credentials');
  process.exit(1);
}

console.log('\n✓ متغيرات البيئة موجودة');
console.log(`  URL: ${supabaseUrl}`);
console.log('  Secret Key: موجود (مخفي للأمان)');

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseSecretKey);

// Load image URLs
const imageUrlsPath = path.join(__dirname, 'balloon-images-upload-urls.json');
const imageUrls = JSON.parse(fs.readFileSync(imageUrlsPath, 'utf-8'));

// Load existing product names
const existingProductsPath = path.join(__dirname, 'existing-products-names.json');
const existingProducts = JSON.parse(fs.readFileSync(existingProductsPath, 'utf-8'));
const existingNames = new Set(existingProducts.map(p => p.name));

// Products to add (from the review report)
const productsToAdd = [
  { name: 'باقة الام-1', image: 'balloon_001_baqh_alam_1.webp', subcategory: 'باقات الام' },
  { name: 'باقة الام-2', image: 'balloon_002_baqh_alam_2.webp', subcategory: 'باقات الام' },
  { name: 'باقة حب-1', image: 'balloon_003_baqh_hb_1.webp', subcategory: 'باقات الحب' },
  { name: 'باقة الحب-2', image: 'balloon_004_baqh_alhb_2.webp', subcategory: 'باقات الحب' },
  { name: 'باقة الحب-3', image: 'balloon_005_baqh_alhb_3.webp', subcategory: 'باقات الحب' },
  { name: 'باقة حب-4', image: 'balloon_006_baqh_hb_4.webp', subcategory: 'باقات الحب' },
  { name: 'باقة التخرج |6', image: 'balloon_007_baqh_altkhrg_6.webp', subcategory: 'التخرج' },
  { name: 'باقة التخرج |7', image: 'balloon_008_baqh_altkhrg_7.webp', subcategory: 'التخرج' },
  { name: 'باقة التخرج |8', image: 'balloon_009_baqh_altkhrg_8.webp', subcategory: 'التخرج' },
  { name: 'باقة عيد ميلاد | 2', image: 'balloon_012_baqh_ayd_mylad_2.webp', subcategory: 'عيد ميلاد' },
  { name: 'باقة عيد ميلاد| 1', image: 'balloon_011_baqh_ayd_mylad_1.webp', subcategory: 'عيد ميلاد' },
  { name: 'باقة عيد ميلاد 3', image: 'balloon_013_baqh_ayd_mylad_3.webp', subcategory: 'عيد ميلاد' },
  { name: '4|باقة عيد ميلاد', image: 'balloon_014_4_baqh_ayd_mylad.webp', subcategory: 'عيد ميلاد' },
  { name: 'باقة عيد ميلاد | 8', image: 'balloon_019_baqh_ayd_mylad_8.webp', subcategory: 'عيد ميلاد' },
  { name: '9 | باقة عيد الميلاد', image: 'balloon_020_9_baqh_ayd_almylad.webp', subcategory: 'عيد ميلاد' },
  { name: 'باقة عيد ميلاد | 10', image: 'balloon_021_baqh_ayd_mylad_10.webp', subcategory: 'عيد ميلاد' },
  { name: 'باقة عيد الميلاد |6', image: 'balloon_017_baqh_ayd_almylad_6.webp', subcategory: 'عيد ميلاد' },
  { name: 'باقة عيد الميلاد | 7', image: 'balloon_018_baqh_ayd_almylad_7.webp', subcategory: 'عيد ميلاد' },
  { name: 'باقة مولود ولد |3', image: 'balloon_022_baqh_mwlwd_wld_3.webp', subcategory: 'مواليد' },
  { name: 'باقة مولودة بنت| 3', image: 'balloon_023_baqh_mwlwdh_bnt_3.webp', subcategory: 'مواليد' },
  { name: 'باقة تحديد جنس الجنين | He or She', image: 'balloon_028_baqh_thdyd_gns_algnyn_he_or_she.webp', subcategory: 'مواليد' },
  { name: 'باقة مولود ولد1', image: 'balloon_029_baqh_mwlwd_wld1.webp', subcategory: 'مواليد' },
  { name: 'باقة مولودة بنت | 2', image: 'balloon_024_baqh_mwlwdh_bnt_2.webp', subcategory: 'مواليد' },
  { name: 'باقة مولود ولد | 2', image: 'balloon_025_baqh_mwlwd_wld_2.webp', subcategory: 'مواليد' },
  { name: 'باقة مولودة بنت1', image: 'balloon_030_baqh_mwlwdh_bnt1.webp', subcategory: 'مواليد' },
  { name: 'باقة زواج | 1', image: 'balloon_034_baqh_zwag_1.webp', subcategory: 'باقات زواج' },
  { name: 'باقة اماني الزواج السعيدة', image: 'balloon_035_baqh_amany_alzwag_alsaydh.webp', subcategory: 'باقات زواج' },
  { name: 'الباقة الفاخرة', image: 'balloon_037_albaqh_alfakhrh.webp', subcategory: 'باقات هيليوم' },
  { name: 'بالونات هيليوم سادة', image: 'balloon_041_balwnat_hylywm_sadh.webp', subcategory: 'بالونات هيليوم بالحبة' },
  { name: 'بالونات سادة كروم', image: 'balloon_042_balwnat_sadh_krwm.webp', subcategory: 'بالونات هيليوم بالحبة' },
  { name: 'باقة بالونات هيليوم ذهبي', image: 'balloon_043_baqh_balwnat_hylywm_thhby.webp', subcategory: 'باقات هيليوم' },
  { name: 'باقة بالونات هيليوم فوشي', image: 'balloon_044_baqh_balwnat_hylywm_fwshy.webp', subcategory: 'باقات هيليوم' },
  { name: 'باقة بالونات هيليوم أزرق داكن', image: 'balloon_045_baqh_balwnat_hylywm_azrq_dakn.webp', subcategory: 'باقات هيليوم' },
  { name: 'باقة بالونات هيليوم أسود', image: 'balloon_046_baqh_balwnat_hylywm_aswd.webp', subcategory: 'باقات هيليوم' },
  { name: 'باقة بالونات هيليوم أصفر', image: 'balloon_047_baqh_balwnat_hylywm_asfr.webp', subcategory: 'باقات هيليوم' },
  { name: 'باقة بالونات هيليوم أحمر', image: 'balloon_048_baqh_balwnat_hylywm_ahmr.webp', subcategory: 'باقات هيليوم' },
  { name: 'باقة بالونات هيليوم كروم|ذهبي-بنفسجي', image: 'balloon_051_baqh_balwnat_hylywm_krwm_thhby_bnfsgy.webp', subcategory: 'باقات هيليوم' },
  { name: 'باقة بالونات هيليوم بنفسجي', image: 'balloon_049_baqh_balwnat_hylywm_bnfsgy.webp', subcategory: 'باقات هيليوم' },
  { name: 'باقة بالونات هيليوم فضي', image: 'balloon_050_baqh_balwnat_hylywm_fdy.webp', subcategory: 'باقات هيليوم' },
  { name: 'باقة بالونات هيليوم كروم ملونة', image: 'balloon_052_baqh_balwnat_hylywm_krwm_mlwnh.webp', subcategory: 'باقات هيليوم' },
  { name: 'حروف فضية هيليوم 34 انش', image: 'balloon_053_hrwf_fdyh_hylywm_34_ansh.webp', subcategory: 'حروف و ارقام' },
  { name: 'حروف ذهبية هيليوم 34 انش', image: 'balloon_055_hrwf_thhbyh_hylywm_34_ansh.webp', subcategory: 'حروف و ارقام' },
  { name: 'ارقام ذهبية هيليوم 34 انش', image: 'balloon_056_arqam_thhbyh_hylywm_34_ansh.webp', subcategory: 'حروف و ارقام' },
  { name: 'ارقام فضية هيليوم 34 انش', image: 'balloon_054_arqam_fdyh_hylywm_34_ansh.webp', subcategory: 'حروف و ارقام' },
  { name: 'حروف روز جولد هيليوم 34 انش', image: 'balloon_057_hrwf_rwz_gwld_hylywm_34_ansh.webp', subcategory: 'حروف و ارقام' },
  { name: 'ارقام روز جولد هيليوم 34 انش', image: 'balloon_058_arqam_rwz_gwld_hylywm_34_ansh.webp', subcategory: 'حروف و ارقام' },
  { name: 'باقة التخرج 2', image: 'balloon_064_baqh_altkhrg_2.webp', subcategory: 'التخرج' },
  { name: 'باقة حروف فضي', image: 'balloon_082_baqh_hrwf_fdy.webp', subcategory: 'حروف و ارقام' },
  { name: 'باقة حروف ذهبي', image: 'balloon_083_baqh_hrwf_thhby.webp', subcategory: 'حروف و ارقام' },
  { name: 'باقة حروف روز جولد', image: 'balloon_084_baqh_hrwf_rwz_gwld.webp', subcategory: 'حروف و ارقام' }
];

console.log(`\nProducts to add: ${productsToAdd.length}`);

// Category ID
const CATEGORY_ID = '3edcc1e9-2221-41ec-bb8a-c6a62021fb82';
const CATEGORY_NAME = 'البالونات';

// Get image URL by filename
function getImageUrl(filename) {
  const image = imageUrls.find(img => img.name === filename);
  return image ? image.publicUrl : null;
}

// Add product to database
async function addProduct(product) {
  const imageUrl = getImageUrl(product.image);
  
  if (!imageUrl) {
    return { success: 'failed', name: product.name, reason: 'Image URL not found' };
  }

  // Check if product already exists
  if (existingNames.has(product.name)) {
    return { success: 'skipped', name: product.name, reason: 'Product already exists' };
  }

  const productData = {
    name: product.name,
    category: CATEGORY_NAME,
    category_id: CATEGORY_ID,
    subcategory_id: null,
    price: 99,
    image_url: imageUrl,
    description: null,
    is_active: true,
    sort_order: Math.floor(Math.random() * 100) + 400,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select('id, name');

  if (error) {
    return { success: 'failed', name: product.name, reason: error.message };
  }

  return { success: 'added', name: product.name, id: data[0].id, imageUrl: imageUrl };
}

// Process all products
async function processProducts() {
  const results = {
    added: [],
    skipped: [],
    failed: []
  };

  console.log('\n' + '='.repeat(80));
  console.log('بدء إضافة المنتجات...');
  console.log('='.repeat(80));

  for (const product of productsToAdd) {
    console.log(`\nProcessing: ${product.name}`);

    const result = await addProduct(product);

    if (result.success === 'added') {
      results.added.push(result);
      console.log(`  ✓ Added: ${result.name} (ID: ${result.id})`);
    } else if (result.success === 'skipped') {
      results.skipped.push(result);
      console.log(`  ⊘ Skipped: ${result.name} (${result.reason})`);
    } else {
      results.failed.push(result);
      console.log(`  ✗ Failed: ${result.name} (${result.reason})`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('ملخص عملية الإضافة:');
  console.log('='.repeat(80));
  console.log(`المنتجات التي تم إضافتها: ${results.added.length}`);
  console.log(`المنتجات التي تم تخطيها (موجودة مسبقًا): ${results.skipped.length}`);
  console.log(`المنتجات التي فشلت إضافتها: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\nتفاصيل الفشل:');
    results.failed.forEach(f => {
      console.log(`  - ${f.name}: ${f.reason}`);
    });
  }

  // Save results
  fs.writeFileSync(
    'balloon-products-insert-results.json',
    JSON.stringify(results, null, 2)
  );
  console.log('\nResults saved to balloon-products-insert-results.json');
}

processProducts();
