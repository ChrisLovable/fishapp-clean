-- Add common_name_for_images column to reference_table
ALTER TABLE reference_table 
ADD COLUMN common_name_for_images TEXT;

-- Optional: Add a comment to describe the column purpose
COMMENT ON COLUMN reference_table.common_name_for_images IS 'Standardized common name used for image file mapping (e.g., "albacore" for "Albacore / Longfin tuna")';

-- Optional: Create an index on this column for faster lookups
CREATE INDEX idx_reference_table_common_name_for_images ON reference_table(common_name_for_images);


