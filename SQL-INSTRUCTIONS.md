# تعليمات تنفيذ SQL Function

## الخطوة 1: تنفيذ SQL Function

1. افتح Supabase Dashboard
2. اذهب إلى SQL Editor
3. انسخ والصق SQL التالي:

```sql
-- Create function to replace products in a single transaction
CREATE OR REPLACE FUNCTION replace_products_catalog(new_products JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  inserted_count INTEGER;
  deleted_count INTEGER;
BEGIN
  -- Start transaction (implicit in function)
  
  -- Delete all existing products
  DELETE FROM products;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Insert new products
  INSERT INTO products (
    name,
    category,
    price,
    image_url,
    description,
    is_active,
    sort_order,
    category_id,
    legacy_id,
    is_featured,
    occasions,
    display_sections,
    subcategory_id
  )
  SELECT
    (elem->>'name')::text,
    (elem->>'category')::text,
    (elem->>'price')::numeric,
    (elem->>'image_url')::text,
    (elem->>'description')::jsonb,
    (elem->>'is_active')::boolean,
    (elem->>'sort_order')::integer,
    (elem->>'category_id')::uuid,
    (elem->>'legacy_id')::text,
    (elem->>'is_featured')::boolean,
    (elem->>'occasions')::jsonb,
    (elem->>'display_sections')::jsonb,
    (elem->>'subcategory_id')::jsonb
  FROM jsonb_array_elements(new_products) AS elem;
  
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  
  -- Build result
  result = jsonb_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'inserted_count', inserted_count,
    'message', 'Products replaced successfully'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically on exception
    result = jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Transaction rolled back due to error'
    );
    RETURN result;
END;
$$;
```

4. اضغط "Run" لتنفيذ SQL
5. تأكد من ظهور رسالة "Success" بدون أخطاء

## الخطوة 2: تشغيل سكريبت الاستيراد

بعد تنفيذ SQL Function بنجاح، قم بتشغيل:

```bash
node execute-migration.cjs
```

## ملاحظات أمنية

- SQL Function تحتوي على Transaction آمن
- في حالة أي خطأ، سيتم Rollback تلقائي
- النسخة الاحتياطية موجودة في: products-backup-2026-11-12.json
