-- Create function to replace products in a single transaction
-- SECURITY WARNING: This is a destructive function that replaces all products
-- EXECUTION PERMISSION: Only service_role should execute this function
-- DO NOT call from frontend or client-side code
CREATE OR REPLACE FUNCTION replace_products_catalog(new_products JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  result JSONB;
  inserted_count INTEGER;
  deleted_count INTEGER;
  input_count INTEGER;
  elem JSONB;
  product_name TEXT;
  category_id_val UUID;
  category_exists INTEGER;
  subcategory_id_val UUID;
  subcategory_exists INTEGER;
  subcategory_parent_id UUID;
  i INTEGER;
  test_numeric NUMERIC;
  test_boolean BOOLEAN;
  test_integer INTEGER;
BEGIN
  -- Validate input: must not be NULL and must be a JSON array
  IF new_products IS NULL THEN
    RAISE EXCEPTION 'Input cannot be NULL';
  END IF;

  IF jsonb_typeof(new_products) != 'array' THEN
    RAISE EXCEPTION 'Input must be a JSON array, got type: %', jsonb_typeof(new_products);
  END IF;

  -- Validate input: must have exactly 348 products
  input_count := jsonb_array_length(new_products);
  IF input_count != 348 THEN
    RAISE EXCEPTION 'Invalid input: expected 348 products, got %', input_count;
  END IF;

  -- Validate all products BEFORE deletion
  -- This ensures we catch data issues before any destructive operation
  FOR elem IN SELECT * FROM jsonb_array_elements(new_products) LOOP
    product_name := (elem->>'name')::text;

    -- Validate name: must not be empty
    IF (elem->>'name') IS NULL OR TRIM((elem->>'name')::text) = '' THEN
      RAISE EXCEPTION 'Product missing or empty name field';
    END IF;

    -- Validate price: must exist and be convertible to NUMERIC
    IF (elem->>'price') IS NULL THEN
      RAISE EXCEPTION 'Product "%" missing price field', product_name;
    END IF;
    BEGIN
      test_numeric := (elem->>'price')::numeric;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Product "%" price is not a valid number', product_name;
    END;

    -- Validate is_active: must exist and be convertible to BOOLEAN
    IF (elem->>'is_active') IS NULL THEN
      RAISE EXCEPTION 'Product "%" missing is_active field', product_name;
    END IF;
    BEGIN
      test_boolean := (elem->>'is_active')::boolean;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Product "%" is_active is not a valid boolean', product_name;
    END;

    -- Validate sort_order: must exist and be convertible to INTEGER
    IF (elem->>'sort_order') IS NULL THEN
      RAISE EXCEPTION 'Product "%" missing sort_order field', product_name;
    END IF;
    BEGIN
      test_integer := (elem->>'sort_order')::integer;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Product "%" sort_order is not a valid integer', product_name;
    END;

    -- Validate image_url: accepts JSON null, but rejects empty string if present
    IF elem->'image_url' IS NOT NULL AND jsonb_typeof(elem->'image_url') != 'null' THEN
      IF TRIM((elem->>'image_url')::text) = '' THEN
        RAISE EXCEPTION 'Product "%" has empty image_url', product_name;
      END IF;
    END IF;

    -- Validate category: must not be empty
    IF (elem->>'category') IS NULL OR TRIM((elem->>'category')::text) = '' THEN
      RAISE EXCEPTION 'Product "%" missing or empty category field', product_name;
    END IF;

    -- Validate category_id: must be valid UUID and exist in categories table
    category_id_val := (elem->>'category_id')::uuid;
    IF category_id_val IS NULL THEN
      RAISE EXCEPTION 'Product "%" has invalid or missing category_id', product_name;
    END IF;

    SELECT COUNT(*) INTO category_exists
    FROM public.categories
    WHERE id = category_id_val;

    IF category_exists = 0 THEN
      RAISE EXCEPTION 'Product "%" has category_id % that does not exist in categories table', 
        product_name, category_id_val;
    END IF;

    -- Validate is_featured if present: must be convertible to BOOLEAN
    IF (elem->>'is_featured') IS NOT NULL THEN
      BEGIN
        test_boolean := (elem->>'is_featured')::boolean;
      EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Product "%" is_featured is not a valid boolean', product_name;
      END;
    END IF;

    -- Validate description: accepts NULL, text, or JSON object with 'ar' field
    IF elem->'description' IS NOT NULL AND jsonb_typeof(elem->'description') != 'null' THEN
      IF jsonb_typeof(elem->'description') = 'object' THEN
        IF (elem->'description'->>'ar') IS NULL THEN
          RAISE EXCEPTION 'Product "%" description object missing "ar" field', product_name;
        END IF;
      ELSIF jsonb_typeof(elem->'description') NOT IN ('string', 'object') THEN
        RAISE EXCEPTION 'Product "%" description must be null, string, or object', product_name;
      END IF;
    END IF;

    -- Validate subcategory_id if provided
    IF (elem->>'subcategory_id') IS NOT NULL AND (elem->>'subcategory_id') != '' THEN
      BEGIN
        -- Attempt to cast to UUID to validate format
        subcategory_id_val := (elem->>'subcategory_id')::uuid;
        
        -- Check if subcategory exists in categories table
        SELECT COUNT(*) INTO subcategory_exists
        FROM public.categories
        WHERE id = subcategory_id_val;

        IF subcategory_exists = 0 THEN
          RAISE EXCEPTION 'Product "%" has subcategory_id % that does not exist in categories table', 
            product_name, subcategory_id_val;
        END IF;

        -- Check that subcategory's parent_id matches product's category_id
        SELECT parent_id INTO subcategory_parent_id
        FROM public.categories
        WHERE id = subcategory_id_val;

        IF subcategory_parent_id IS NULL THEN
          RAISE EXCEPTION 'Product "%" subcategory_id % has no parent_id', 
            product_name, subcategory_id_val;
        END IF;

        IF subcategory_parent_id != category_id_val THEN
          RAISE EXCEPTION 'Product "%" subcategory_id % has parent_id % which does not match category_id %', 
            product_name, subcategory_id_val, subcategory_parent_id, category_id_val;
        END IF;

      EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Product "%" has invalid subcategory_id format or validation failed', product_name;
      END;
    END IF;

    -- Validate occasions: must be null, JSON null, or JSON array of strings
    IF elem->'occasions' IS NOT NULL AND jsonb_typeof(elem->'occasions') != 'null' THEN
      IF jsonb_typeof(elem->'occasions') != 'array' THEN
        RAISE EXCEPTION 'Product "%" occasions must be null or array', product_name;
      END IF;
      -- Verify array elements are strings, not objects or nested arrays
      FOR i IN 0..jsonb_array_length(elem->'occasions') - 1 LOOP
        IF jsonb_typeof(elem->'occasions'->i) != 'string' THEN
          RAISE EXCEPTION 'Product "%" occasions array must contain only strings', product_name;
        END IF;
      END LOOP;
    END IF;

    -- Validate display_sections: must be null, JSON null, or JSON array of strings
    IF elem->'display_sections' IS NOT NULL AND jsonb_typeof(elem->'display_sections') != 'null' THEN
      IF jsonb_typeof(elem->'display_sections') != 'array' THEN
        RAISE EXCEPTION 'Product "%" display_sections must be null or array', product_name;
      END IF;
      -- Verify array elements are strings, not objects or nested arrays
      FOR i IN 0..jsonb_array_length(elem->'display_sections') - 1 LOOP
        IF jsonb_typeof(elem->'display_sections'->i) != 'string' THEN
          RAISE EXCEPTION 'Product "%" display_sections array must contain only strings', product_name;
        END IF;
      END LOOP;
    END IF;
  END LOOP;

  -- Delete all existing products from public.products table only
  -- No foreign keys from other tables (cart_items, order_items, favorites do not exist)
  DELETE FROM public.products WHERE true;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Insert new products with explicit type casting matching actual column types:
  -- category_id: UUID
  -- subcategory_id: UUID
  -- description: TEXT
  -- occasions: TEXT[]
  -- display_sections: TEXT[]
  INSERT INTO public.products (
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
    (product_data.product_json->>'name')::text,
    (product_data.product_json->>'category')::text,
    (product_data.product_json->>'price')::numeric,
    -- image_url: accepts JSON null, converts to SQL NULL
    CASE 
      WHEN product_data.product_json->'image_url' IS NULL OR jsonb_typeof(product_data.product_json->'image_url') = 'null'
      THEN NULL
      ELSE (product_data.product_json->>'image_url')::text
    END,
    -- description: Extract Arabic text from JSON object or use as-is if plain text
    CASE 
      WHEN (product_data.product_json->'description') IS NULL THEN NULL
      WHEN jsonb_typeof(product_data.product_json->'description') = 'object' THEN (product_data.product_json->'description'->>'ar')::text
      ELSE (product_data.product_json->>'description')::text
    END,
    (product_data.product_json->>'is_active')::boolean,
    (product_data.product_json->>'sort_order')::integer,
    (product_data.product_json->>'category_id')::uuid,
    (product_data.product_json->>'legacy_id')::text,
    (product_data.product_json->>'is_featured')::boolean,
    -- occasions: TEXT[] - convert JSON array to PostgreSQL TEXT[]
    CASE
      WHEN product_data.product_json->'occasions' IS NULL OR jsonb_typeof(product_data.product_json->'occasions') = 'null'
      THEN NULL
      ELSE ARRAY(SELECT jsonb_array_elements_text(product_data.product_json->'occasions'))
    END,
    -- display_sections: TEXT[] - convert JSON array to PostgreSQL TEXT[]
    CASE
      WHEN product_data.product_json->'display_sections' IS NULL OR jsonb_typeof(product_data.product_json->'display_sections') = 'null'
      THEN NULL
      ELSE ARRAY(SELECT jsonb_array_elements_text(product_data.product_json->'display_sections'))
    END,
    -- subcategory_id: UUID - convert null to null, or UUID if provided
    CASE 
      WHEN (product_data.product_json->>'subcategory_id') IS NULL THEN NULL
      WHEN (product_data.product_json->>'subcategory_id') = '' THEN NULL
      ELSE (product_data.product_json->>'subcategory_id')::uuid
    END
  FROM jsonb_array_elements(new_products) AS product_data(product_json);

  GET DIAGNOSTICS inserted_count = ROW_COUNT;

  -- Verify insert count matches input
  IF inserted_count != 348 THEN
    RAISE EXCEPTION 'Insert mismatch: expected 348, inserted %', inserted_count;
  END IF;

  -- Build success result
  result = jsonb_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'inserted_count', inserted_count,
    'message', 'Products replaced successfully'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Re-raise the exception to trigger automatic rollback
    -- Do not catch and return error message - let it fail properly
    RAISE;
END;
$$;

-- REVOKE EXECUTE from all roles for security
REVOKE EXECUTE ON FUNCTION replace_products_catalog(JSONB) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION replace_products_catalog(JSONB) FROM anon;
REVOKE EXECUTE ON FUNCTION replace_products_catalog(JSONB) FROM authenticated;

-- GRANT EXECUTE only to service_role (server-side only)
-- This function should only be called from backend scripts using service_role key
GRANT EXECUTE ON FUNCTION replace_products_catalog(JSONB) TO service_role;

-- Comment for documentation
COMMENT ON FUNCTION replace_products_catalog(JSONB) IS 
'Destructive function that replaces all products in a single transaction. 
Only service_role can execute. Must be called from server-side code with service_role key.
Validates: 348 products input, required fields (name, price, is_active, sort_order, category), 
image_url accepts JSON null (converts to SQL NULL) but rejects empty string,
category_id existence in categories table, subcategory_id validation (existence + parent_id match), 
occasions/display_sections format before deletion.
Performs atomic delete+insert of 181 products with 348 new products.
Column types: category_id=UUID, subcategory_id=UUID, description=TEXT, occasions=TEXT[], display_sections=TEXT[], image_url=TEXT(nullable).
Note: cart_items, order_items, favorites tables do not exist in this database.';
