-- Add multi-variation support to products and variations
ALTER TABLE public.product_variations 
ADD COLUMN IF NOT EXISTS option1_name TEXT,
ADD COLUMN IF NOT EXISTS option1_value TEXT,
ADD COLUMN IF NOT EXISTS option2_name TEXT,
ADD COLUMN IF NOT EXISTS option2_value TEXT;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS variation_config JSONB DEFAULT '[]'::jsonb;

-- Backfill existing variations
-- Assuming most existing variations are "Size"
UPDATE public.product_variations 
SET option1_name = 'Size', option1_value = name 
WHERE option1_name IS NULL;
