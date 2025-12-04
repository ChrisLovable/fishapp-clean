-- Populate common_name_for_images for ALL species in reference_table
-- This script covers all species with explicit mappings and auto-converts the rest

-- First, update species with explicit mappings from the speciesImageMap
UPDATE reference_table SET common_name_for_images = 'albacore' WHERE english_name = 'Albacore / Longfin tuna';
UPDATE reference_table SET common_name_for_images = 'atlanticbonito' WHERE english_name = 'Atlantic bonito';
UPDATE reference_table SET common_name_for_images = 'baardman' WHERE english_name = 'Baardman';
UPDATE reference_table SET common_name_for_images = 'bandedcatshark' WHERE english_name = 'Banded catshark';
UPDATE reference_table SET common_name_for_images = 'bandedgaljoen' WHERE english_name = 'Banded galjoen';
UPDATE reference_table SET common_name_for_images = 'blackrubberlip' WHERE english_name = 'Black rubberlip / Harry hotlips';
UPDATE reference_table SET common_name_for_images = 'blackstingray' WHERE english_name = 'Shorttail stingray / Black stingray';
UPDATE reference_table SET common_name_for_images = 'bronzesharkfemale' WHERE english_name = 'Copper / Bronze shark (Female)';
UPDATE reference_table SET common_name_for_images = 'bronzesharkmale' WHERE english_name = 'Copper / Bronze shark (Male)';
UPDATE reference_table SET common_name_for_images = 'bullsharkfemale' WHERE english_name = 'Bull / Zambezi shark (Female)';
UPDATE reference_table SET common_name_for_images = 'bullsharkmale' WHERE english_name = 'Bull / Zambezi shark (Male)';
UPDATE reference_table SET common_name_for_images = 'cobia' WHERE english_name = 'Prodigal Son / Cobia';
UPDATE reference_table SET common_name_for_images = 'cowshark' WHERE english_name = 'Sevengill cowshark';
UPDATE reference_table SET common_name_for_images = 'dolphinfish' WHERE english_name = 'Dorado / Dolphin fish';
UPDATE reference_table SET common_name_for_images = 'duckbill' WHERE english_name = 'Bull ray / Duckbill';
UPDATE reference_table SET common_name_for_images = 'easternlittletuna' WHERE english_name = 'Eastern little tuna / Kawakawa';
UPDATE reference_table SET common_name_for_images = 'elephantfish' WHERE english_name = 'Elephant fish / St Joseph';
UPDATE reference_table SET common_name_for_images = 'garrick' WHERE english_name = 'Leervis / Garrick';
UPDATE reference_table SET common_name_for_images = 'giantguitarfish' WHERE english_name = 'Giant guitarfish / Giant sandshark';
UPDATE reference_table SET common_name_for_images = 'greateryellowtail' WHERE english_name = 'Greater yellowtail / Amberjack';
UPDATE reference_table SET common_name_for_images = 'greyshark' WHERE english_name = 'Dusky / Ridgeback Grey shark';
UPDATE reference_table SET common_name_for_images = 'johnbrown' WHERE english_name = 'Janbruin / John Brown';
UPDATE reference_table SET common_name_for_images = 'karanteen' WHERE english_name = 'Karanteen / Strepie';
UPDATE reference_table SET common_name_for_images = 'kingmackerel' WHERE english_name = 'King mackerel / Couta';
UPDATE reference_table SET common_name_for_images = 'redstumpnose' WHERE english_name = 'Red stumpnose / Miss Lucy';
UPDATE reference_table SET common_name_for_images = 'riverbream' WHERE english_name = 'River bream / Perch';
UPDATE reference_table SET common_name_for_images = 'riversnapper' WHERE english_name = 'River / Mangrove snapper';
UPDATE reference_table SET common_name_for_images = 'sandshark' WHERE english_name = 'Lesser guitarfish / Sandshark';
UPDATE reference_table SET common_name_for_images = 'scallopedhammerheadfemale' WHERE english_name = 'Scalloped hammerheadshark (Female)';
UPDATE reference_table SET common_name_for_images = 'scallopedhammerheadmale' WHERE english_name = 'Scalloped hammerheadshark (Male)';
UPDATE reference_table SET common_name_for_images = 'shad' WHERE english_name = 'Elf / Shad';
UPDATE reference_table SET common_name_for_images = 'skipjacktuna' WHERE english_name = 'Skipjack tuna / Oceanic Bonito';
UPDATE reference_table SET common_name_for_images = 'soldier' WHERE english_name = 'Blotcheye soldier';
UPDATE reference_table SET common_name_for_images = 'soupfinshark' WHERE english_name = 'Soupfin shark / Tope';
UPDATE reference_table SET common_name_for_images = 'spottedraggedtoothfemale' WHERE english_name = 'Spotted ragged-tooth shark (Female)';
UPDATE reference_table SET common_name_for_images = 'spottedraggedtoothmale' WHERE english_name = 'Spotted ragged-tooth shark (Male)';
UPDATE reference_table SET common_name_for_images = 'twinspotsnapper' WHERE english_name = 'Bohar / Twinspot snapper';

-- Now auto-convert remaining species using a function approach
-- For species not explicitly mapped above, convert their names to lowercase, remove spaces and special characters

-- Common conversions for remaining species (add more as needed)
UPDATE reference_table SET common_name_for_images = 'angelfish' WHERE english_name = 'Angelfish';
UPDATE reference_table SET common_name_for_images = 'barracuda' WHERE english_name = 'Barracuda';
UPDATE reference_table SET common_name_for_images = 'bass' WHERE english_name = 'Bass';
UPDATE reference_table SET common_name_for_images = 'blacktail' WHERE english_name = 'Blacktail';
UPDATE reference_table SET common_name_for_images = 'bronzebream' WHERE english_name = 'Bronze bream';
UPDATE reference_table SET common_name_for_images = 'capestumpnose' WHERE english_name = 'Cape stumpnose';
UPDATE reference_table SET common_name_for_images = 'capetonnagevis' WHERE english_name = 'Cape tonnagevis';
UPDATE reference_table SET common_name_for_images = 'chubmackerel' WHERE english_name = 'Chub mackerel';
UPDATE reference_table SET common_name_for_images = 'commonkob' WHERE english_name = 'Common kob';
UPDATE reference_table SET common_name_for_images = 'galjoen' WHERE english_name = 'Galjoen';
UPDATE reference_table SET common_name_for_images = 'giantkingfish' WHERE english_name = 'Giant kingfish';
UPDATE reference_table SET common_name_for_images = 'roman' WHERE english_name = 'Roman';
UPDATE reference_table SET common_name_for_images = 'spottedgrunter' WHERE english_name = 'Spotted grunter';
UPDATE reference_table SET common_name_for_images = 'whitesteenbras' WHERE english_name = 'White steenbras';
UPDATE reference_table SET common_name_for_images = 'zebra' WHERE english_name = 'Zebra';
UPDATE reference_table SET common_name_for_images = 'whitemusselcracker' WHERE english_name = 'White musselcracker';
UPDATE reference_table SET common_name_for_images = 'blackmusselcracker' WHERE english_name = 'Black musselcracker';

-- For any remaining species without common_name_for_images, set to auto-converted version
-- This uses a simple conversion: lowercase, remove spaces and special characters
UPDATE reference_table 
SET common_name_for_images = LOWER(
    REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(english_name, '\s+', '', 'g'),  -- Remove spaces
                    '[^a-zA-Z0-9]', '', 'g'                        -- Remove special characters
                ), 
                '\(', '', 'g'                                      -- Remove opening parentheses
            ), 
            '\)', '', 'g'                                          -- Remove closing parentheses
        ),
        '/', '', 'g'                                               -- Remove forward slashes
    )
)
WHERE common_name_for_images IS NULL OR common_name_for_images = '';

-- Verify the updates - show first 20 species
SELECT english_name, common_name_for_images 
FROM reference_table 
WHERE common_name_for_images IS NOT NULL 
ORDER BY english_name 
LIMIT 20;

-- Show count of updated species
SELECT COUNT(*) as total_species_with_images
FROM reference_table 
WHERE common_name_for_images IS NOT NULL AND common_name_for_images != '';



