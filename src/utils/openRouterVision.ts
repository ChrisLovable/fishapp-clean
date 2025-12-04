// OpenRouter Fish Identification Utility
// Uses Gemini 2.5 Flash for accurate fish identification

interface FishIdentificationResult {
  species: string;
  confidence: number;
  alternativeSpecies: Array<{ name: string; confidence: number }>;
  characteristics: string[];
  scientificName?: string;
  commonNames?: string[];
  isUncertain?: boolean;
  detailedAnalysis?: string;
}

// Species metadata for common fish
const speciesDictionary: Record<string, {
  scientificName: string;
  commonNames: string[];
  traits: string[];
  habitat?: string;
  size?: string;
  diet?: string;
}> = {
  "Clownfish": {
    scientificName: "Amphiprion ocellatus",
    commonNames: ["Nemo", "Anemonefish"],
    traits: ["Orange with white stripes", "Lives in anemones", "Small size", "Tropical reef fish"],
    habitat: "Coral reefs",
    size: "3-4 inches",
    diet: "Omnivorous"
  },
  "Butterflyfish": {
    scientificName: "Chaetodontidae",
    commonNames: ["Butterfly fish"],
    traits: ["Bright colors", "Disk-shaped body", "Small mouth", "Reef fish"],
    habitat: "Coral reefs",
    size: "4-8 inches",
    diet: "Coral polyps, small invertebrates"
  },
  "Salmon": {
    scientificName: "Salmo salar",
    commonNames: ["Atlantic Salmon", "King Salmon"],
    traits: ["Pink/orange flesh", "Streamlined body", "Migratory", "Commercial fish"],
    habitat: "Cold ocean waters, rivers",
    size: "24-36 inches",
    diet: "Small fish, crustaceans"
  },
  "Tuna": {
    scientificName: "Thunnus thynnus",
    commonNames: ["Bluefin Tuna", "Yellowfin Tuna"],
    traits: ["Large size", "Fast swimming", "Dark red flesh", "Commercial fish"],
    habitat: "Open ocean",
    size: "3-6 feet",
    diet: "Small fish, squid"
  },
  "Bass": {
    scientificName: "Micropterus salmoides",
    commonNames: ["Largemouth Bass", "Smallmouth Bass"],
    traits: ["Greenish color", "Large mouth", "Freshwater fish", "Game fish"],
    habitat: "Lakes, rivers, ponds",
    size: "12-24 inches",
    diet: "Small fish, insects, crustaceans"
  },
  "Trout": {
    scientificName: "Oncorhynchus mykiss",
    commonNames: ["Rainbow Trout", "Brown Trout"],
    traits: ["Spotted pattern", "Streamlined body", "Freshwater fish", "Game fish"],
    habitat: "Cold streams, lakes",
    size: "8-20 inches",
    diet: "Insects, small fish"
  },
  "Cod": {
    scientificName: "Gadus morhua",
    commonNames: ["Atlantic Cod", "Pacific Cod"],
    traits: ["White flesh", "Large size", "Commercial fish", "Cold water"],
    habitat: "Cold ocean waters",
    size: "24-48 inches",
    diet: "Small fish, crustaceans"
  },
  "Snapper": {
    scientificName: "Lutjanus campechanus",
    commonNames: ["Red Snapper", "Yellowtail Snapper"],
    traits: ["Red/pink color", "Sharp teeth", "Reef fish", "Commercial fish"],
    habitat: "Coral reefs, rocky areas",
    size: "12-30 inches",
    diet: "Small fish, crustaceans"
  },
  "Grouper": {
    scientificName: "Epinephelus itajara",
    commonNames: ["Goliath Grouper", "Red Grouper"],
    traits: ["Large size", "Thick body", "Reef fish", "Commercial fish"],
    habitat: "Coral reefs, rocky areas",
    size: "24-60 inches",
    diet: "Small fish, crustaceans"
  },
  "Mackerel": {
    scientificName: "Scomber scombrus",
    commonNames: ["Atlantic Mackerel", "Spanish Mackerel"],
    traits: ["Striped pattern", "Oily flesh", "Fast swimming", "Commercial fish"],
    habitat: "Open ocean",
    size: "12-24 inches",
    diet: "Small fish, plankton"
  }
};

// Image preprocessing function
const preprocessImage = (base64: string, maxWidth: number = 1024, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(base64);
        return;
      }

      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    img.src = base64;
  });
};

// Enhanced fish species mapping logic
const mapToFishSpecies = (aiResponse: string): FishIdentificationResult => {
  const response = aiResponse.toLowerCase();
  console.log('🔍 Processing AI response:', aiResponse);
  
  // Default confidence
  let confidence = 0.8;

  // Check for direct species matches in dictionary
  for (const [speciesName, metadata] of Object.entries(speciesDictionary)) {
    if (response.includes(speciesName.toLowerCase()) ||
        metadata.commonNames.some(name => response.includes(name.toLowerCase()))) {
      console.log('✅ Found dictionary match:', speciesName);
      return {
        species: speciesName,
        confidence: Math.min(confidence + 0.1, 0.95), // Boost confidence for dictionary matches
        alternativeSpecies: [],
        characteristics: metadata.traits,
        scientificName: metadata.scientificName,
        commonNames: metadata.commonNames,
        isUncertain: confidence < 0.7,
        detailedAnalysis: aiResponse
      };
    }
  }

  // Check for general fish-related keywords
  const fishKeywords = ['fish', 'salmon', 'tuna', 'bass', 'trout', 'cod', 'snapper', 'grouper', 'mackerel', 'clownfish', 'butterflyfish', 'kob', 'bream', 'shark', 'ray'];
  const isFishRelated = fishKeywords.some(keyword => response.includes(keyword));
  
  if (isFishRelated) {
    console.log('🐟 Detected as fish-related');
    return {
      species: "Fish (Unidentified Species)",
      confidence: Math.max(confidence, 0.6),
      alternativeSpecies: [],
      characteristics: ["Aquatic animal", "Fins present", "Gills for breathing"],
      isUncertain: true,
      detailedAnalysis: aiResponse
    };
  }

  // Check for non-fish classifications
  const nonFishKeywords = ['bird', 'mammal', 'insect', 'plant', 'tree', 'car', 'building', 'person', 'human', 'dog', 'cat', 'not a fish'];
  const isNonFish = nonFishKeywords.some(keyword => response.includes(keyword));
  
  if (isNonFish) {
    console.log('❌ Detected as not a fish');
    return {
      species: "Not a Fish",
      confidence: 0.9,
      alternativeSpecies: [],
      characteristics: ["Does not appear to be a fish"],
      isUncertain: false,
      detailedAnalysis: aiResponse
    };
  }

  // Default: assume it's a fish if we can't determine otherwise
  console.log('🤔 Defaulting to general fish classification');
  return {
    species: "Fish (General)",
    confidence: 0.5,
    alternativeSpecies: [],
    characteristics: ["Aquatic animal", "Unidentified species"],
    isUncertain: true,
    detailedAnalysis: aiResponse
  };
};

// Main OpenRouter fish identification function
export const identifyFishWithOpenRouter = async (imageBase64: string): Promise<FishIdentificationResult> => {
  try {
    console.log('🔍 Starting OpenRouter fish identification...');
    
    // Preprocess the image
    const processedImage = await preprocessImage(imageBase64, 1200, 0.9);
    console.log('📊 Image processed successfully');

    // Load API key from environment (no hard-coded secrets)
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;
    if (!apiKey) {
      console.error('❌ OpenRouter API key is missing. Set VITE_OPENROUTER_API_KEY in your environment.');
      throw new Error('OpenRouter API key is not configured. Please contact support.');
    }

    // Prepare the request
    const requestBody = {
      model: "google/gemini-1.5-flash",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Look at this image and identify what type of fish this is. Provide the common name and describe the key characteristics you can see. If this is not a fish, say 'Not a fish'. Be specific about colors, patterns, size, and any distinctive features."
            },
            {
              type: "image_url",
              image_url: {
                url: processedImage
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    };

    console.log('📋 Request body prepared:', {
      model: requestBody.model,
      messageCount: requestBody.messages.length,
      imageSize: processedImage.length
    });

    console.log('📡 Making API request to OpenRouter...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'FishApp'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API Response received:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid API response format:', data);
      throw new Error('Invalid API response format');
    }

    const aiResponse = data.choices[0].message.content;
    console.log('🤖 AI Response:', aiResponse);

    // Map the AI response to our fish identification result
    const result = mapToFishSpecies(aiResponse);
    
    console.log('🎯 Final result:', result);
    return result;

  } catch (error) {
    console.error('❌ Fish identification error:', error);
    
    // Return a fallback result
    return {
      species: "Identification Failed",
      confidence: 0,
      alternativeSpecies: [],
      characteristics: ["Unable to process image"],
      isUncertain: true,
      detailedAnalysis: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};