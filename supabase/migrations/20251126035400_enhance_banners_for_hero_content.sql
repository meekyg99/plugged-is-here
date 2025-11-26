/*
  # Enhance Banners Table for Hero Content Management

  ## Summary
  Extends the existing banners table to support comprehensive hero section and homepage content management.
  Adds fields to differentiate between hero main section, category banners, and promotional content.

  ## Changes

  1. New Columns Added
    - `banner_type` (text) - Identifies banner purpose: 'hero_main', 'hero_category', 'promotional'
    - `position` (text) - Specific position identifier: 'main', 'men', 'women', 'accessories'
    - `cta_text` (text) - Call-to-action button text for hero main banner
    - `cta_url` (text) - Call-to-action button destination URL
    - `background_type` (text) - Hero background type: 'gradient', 'image'
    - `gradient_from` (text) - Starting color for gradient background
    - `gradient_via` (text) - Middle color for gradient background
    - `gradient_to` (text) - Ending color for gradient background
    - `updated_at` (timestamptz) - Track when banner was last modified

  2. Indexes
    - Index on banner_type for efficient filtering
    - Index on position for quick lookups
    - Index on is_active and display_order for homepage queries

  3. Default Values
    - Set default banner_type to 'promotional' for backward compatibility
    - Set default background_type to 'gradient'

  ## Important Notes
  - Existing banners data is preserved
  - No breaking changes to current functionality
  - All new columns are nullable to support existing records
  - Hero main banner should have banner_type='hero_main' and position='main'
  - Category banners should have banner_type='hero_category' and position='men'/'women'/'accessories'
*/

-- Add new columns to banners table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'banner_type'
  ) THEN
    ALTER TABLE banners ADD COLUMN banner_type text DEFAULT 'promotional';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'position'
  ) THEN
    ALTER TABLE banners ADD COLUMN position text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'cta_text'
  ) THEN
    ALTER TABLE banners ADD COLUMN cta_text text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'cta_url'
  ) THEN
    ALTER TABLE banners ADD COLUMN cta_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'background_type'
  ) THEN
    ALTER TABLE banners ADD COLUMN background_type text DEFAULT 'gradient';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'gradient_from'
  ) THEN
    ALTER TABLE banners ADD COLUMN gradient_from text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'gradient_via'
  ) THEN
    ALTER TABLE banners ADD COLUMN gradient_via text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'gradient_to'
  ) THEN
    ALTER TABLE banners ADD COLUMN gradient_to text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE banners ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add check constraint for banner_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_banner_type'
  ) THEN
    ALTER TABLE banners
    ADD CONSTRAINT valid_banner_type
    CHECK (banner_type IN ('hero_main', 'hero_category', 'promotional'));
  END IF;
END $$;

-- Add check constraint for position
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_position'
  ) THEN
    ALTER TABLE banners
    ADD CONSTRAINT valid_position
    CHECK (position IN ('main', 'men', 'women', 'accessories') OR position IS NULL);
  END IF;
END $$;

-- Add check constraint for background_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_background_type'
  ) THEN
    ALTER TABLE banners
    ADD CONSTRAINT valid_background_type
    CHECK (background_type IN ('gradient', 'image') OR background_type IS NULL);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_banners_type ON banners(banner_type);
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);
CREATE INDEX IF NOT EXISTS idx_banners_active_order ON banners(is_active, display_order);

-- Add trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_banners_updated_at'
  ) THEN
    CREATE TRIGGER update_banners_updated_at
    BEFORE UPDATE ON banners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert default hero content if none exists
INSERT INTO banners (
  title,
  subtitle,
  banner_type,
  position,
  cta_text,
  cta_url,
  background_type,
  gradient_from,
  gradient_via,
  gradient_to,
  image_url,
  is_active,
  display_order
)
SELECT
  'Spring Summer',
  '2024 Collection',
  'hero_main',
  'main',
  'Shop Now',
  '/category/all',
  'gradient',
  '#fef3c7',
  '#fed7aa',
  '#fecdd3',
  '',
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM banners WHERE banner_type = 'hero_main' AND position = 'main'
);

-- Insert default category banners if none exist
INSERT INTO banners (
  title,
  subtitle,
  banner_type,
  position,
  image_url,
  link_url,
  is_active,
  display_order
)
SELECT
  'Men''s Collection',
  '',
  'hero_category',
  'men',
  'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=1200',
  '/category/all?gender=men',
  true,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM banners WHERE banner_type = 'hero_category' AND position = 'men'
);

INSERT INTO banners (
  title,
  subtitle,
  banner_type,
  position,
  image_url,
  link_url,
  is_active,
  display_order
)
SELECT
  'Women''s Collection',
  '',
  'hero_category',
  'women',
  'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=1200',
  '/category/all?gender=women',
  true,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM banners WHERE banner_type = 'hero_category' AND position = 'women'
);

INSERT INTO banners (
  title,
  subtitle,
  banner_type,
  position,
  image_url,
  link_url,
  is_active,
  display_order
)
SELECT
  'Accessories Collection',
  '',
  'hero_category',
  'accessories',
  'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=1200',
  '/category/accessories',
  true,
  3
WHERE NOT EXISTS (
  SELECT 1 FROM banners WHERE banner_type = 'hero_category' AND position = 'accessories'
);
