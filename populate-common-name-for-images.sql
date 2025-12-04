-- Populate common_name_for_images column with correct image filenames
-- Based on the species name mapping from getFishImageUrl function

UPDATE reference_table SET common_name_for_images = 'albacore' WHERE english_name = 'Albacore / Longfin tuna';
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

-- Add more species as needed based on your speciesImageMap
-- For species not in the mapping above, they will use the auto-converted filename
-- (lowercase, no spaces, no special characters + .jpg)

-- Verify the updates
SELECT english_name, common_name_for_images 
FROM reference_table 
WHERE common_name_for_images IS NOT NULL 
ORDER BY english_name;


