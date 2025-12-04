// Hugging Face Vision API integration for fish identification

interface FishIdentificationResult {
  species: string
  confidence: number
  alternativeSpecies: Array<{
    name: string
    confidence: number
  }>
  characteristics: string[]
  scientificName?: string
  commonNames?: string[]
  isUncertain?: boolean
  topPredictions?: Array<{
    label: string
    score: number
  }>
}

interface SpeciesMetadata {
  scientificName: string
  commonNames: string[]
  traits: string[]
  habitat?: string
  size?: string
  diet?: string
}

// Comprehensive species metadata dictionary
const speciesDictionary: Record<string, SpeciesMetadata> = {
  "Clownfish": {
    scientificName: "Amphiprioninae",
    commonNames: ["Clown anemonefish", "Nemo fish"],
    traits: ["Orange with white bands", "Symbiotic with anemones", "Small size", "Bright colors"],
    habitat: "Coral reefs",
    size: "3-4 inches",
    diet: "Omnivorous"
  },
  "Butterflyfish": {
    scientificName: "Chaetodontidae",
    commonNames: ["Bannerfish", "Coralfish"],
    traits: ["Disc-shaped body", "Often yellow with black/white patterns", "Small mouth", "Colorful"],
    habitat: "Coral reefs",
    size: "4-8 inches",
    diet: "Coral polyps, small invertebrates"
  },
  "Salmon": {
    scientificName: "Salmo salar",
    commonNames: ["Atlantic Salmon", "King Salmon"],
    traits: ["Pink flesh", "Streamlined body", "Anadromous", "Large size"],
    habitat: "Rivers and oceans",
    size: "20-40 inches",
    diet: "Small fish, crustaceans"
  },
  "Tuna": {
    scientificName: "Thunnus thynnus",
    commonNames: ["Bluefin Tuna", "Yellowfin Tuna"],
    traits: ["Large size", "Fast swimming", "Commercial fish", "Streamlined"],
    habitat: "Open ocean",
    size: "3-6 feet",
    diet: "Small fish, squid"
  },
  "Bass": {
    scientificName: "Micropterus salmoides",
    commonNames: ["Largemouth Bass", "Black Bass"],
    traits: ["Predatory fish", "Large mouth", "Freshwater", "Green coloration"],
    habitat: "Lakes, rivers, ponds",
    size: "12-24 inches",
    diet: "Small fish, insects, crayfish"
  },
  "Trout": {
    scientificName: "Oncorhynchus mykiss",
    commonNames: ["Rainbow Trout", "Steelhead"],
    traits: ["Stream fish", "Colorful", "Game fish", "Spotted pattern"],
    habitat: "Cold streams, lakes",
    size: "8-20 inches",
    diet: "Insects, small fish"
  },
  "Cod": {
    scientificName: "Gadus morhua",
    commonNames: ["Atlantic Cod", "Whitefish"],
    traits: ["White flesh", "Large head", "Three dorsal fins", "Commercial fish"],
    habitat: "Cold ocean waters",
    size: "2-4 feet",
    diet: "Small fish, crustaceans"
  },
  "Snapper": {
    scientificName: "Lutjanidae",
    commonNames: ["Red Snapper", "Mangrove Snapper"],
    traits: ["Red coloration", "Sharp teeth", "Reef fish", "Popular food fish"],
    habitat: "Coral reefs, rocky areas",
    size: "12-30 inches",
    diet: "Small fish, crustaceans"
  },
  "Grouper": {
    scientificName: "Epinephelus",
    commonNames: ["Gag Grouper", "Red Grouper"],
    traits: ["Large size", "Thick body", "Reef fish", "Predatory"],
    habitat: "Coral reefs, rocky areas",
    size: "2-4 feet",
    diet: "Small fish, crustaceans"
  },
  "Mackerel": {
    scientificName: "Scomber scombrus",
    commonNames: ["Atlantic Mackerel", "Spanish Mackerel"],
    traits: ["Streamlined body", "Blue-green back", "Fast swimming", "Oily fish"],
    habitat: "Open ocean",
    size: "12-18 inches",
    diet: "Small fish, plankton"
  }
}

// Enhanced image preprocessing with normalization
const preprocessImage = (base64: string, maxWidth: number = 1024, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Calculate new dimensions
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      canvas.width = width
      canvas.height = height
      
      // Enhanced preprocessing: normalize brightness and contrast
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Get image data for processing
      const imageData = ctx?.getImageData(0, 0, width, height)
      if (imageData) {
        const data = imageData.data
        
        // Simple brightness and contrast normalization
        let sum = 0
        for (let i = 0; i < data.length; i += 4) {
          sum += (data[i] + data[i + 1] + data[i + 2]) / 3
        }
        const avgBrightness = sum / (data.length / 4)
        
        // Normalize brightness to target (128)
        const brightnessFactor = 128 / avgBrightness
        
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * brightnessFactor)     // R
          data[i + 1] = Math.min(255, data[i + 1] * brightnessFactor) // G
          data[i + 2] = Math.min(255, data[i + 2] * brightnessFactor) // B
        }
        
        ctx?.putImageData(imageData, 0, 0)
      }
      
      const processedBase64 = canvas.toDataURL('image/jpeg', quality)
      resolve(processedBase64)
    }
    img.src = base64
  })
}

// Convert base64 to blob for API call
const base64ToBlob = (base64: string): Blob => {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

// Enhanced fish species mapping with top-K predictions and confidence thresholding
const mapToFishSpecies = (predictions: Array<{label: string, score: number}>): FishIdentificationResult => {
  // Sort predictions by confidence (highest first)
  const sortedPredictions = predictions.sort((a, b) => b.score - a.score)
  const topPrediction = sortedPredictions[0]
  const lowerClassification = topPrediction.label.toLowerCase()
  
  // Confidence threshold for uncertainty
  const CONFIDENCE_THRESHOLD = 0.7
  const isUncertain = topPrediction.score < CONFIDENCE_THRESHOLD
  
  // Check for direct species matches in our dictionary
  for (const [speciesName, metadata] of Object.entries(speciesDictionary)) {
    if (lowerClassification.includes(speciesName.toLowerCase()) || 
        metadata.commonNames.some(name => lowerClassification.includes(name.toLowerCase()))) {
      return {
        species: speciesName,
        confidence: topPrediction.score,
        alternativeSpecies: sortedPredictions.slice(1, 5).map(p => ({
          name: p.label,
          confidence: p.score
        })),
        characteristics: metadata.traits,
        scientificName: metadata.scientificName,
        commonNames: metadata.commonNames,
        isUncertain,
        topPredictions: sortedPredictions.slice(0, 5)
      }
    }
  }
  
  // Check for general fish-related keywords
  const fishKeywords = ['fish', 'salmon', 'tuna', 'bass', 'trout', 'cod', 'snapper', 'grouper', 'mackerel']
  const isFishRelated = fishKeywords.some(keyword => lowerClassification.includes(keyword))
  
  if (isFishRelated) {
    return {
      species: 'Fish (Unidentified Species)',
      confidence: Math.max(topPrediction.score * 0.8, 0.3),
      alternativeSpecies: sortedPredictions.slice(1, 5).map(p => ({
        name: p.label,
        confidence: p.score
      })),
      characteristics: ['Aquatic animal', 'Fins', 'Gills', 'Unknown species'],
      scientificName: 'Pisces (Unknown)',
      commonNames: ['Fish'],
      isUncertain: true,
      topPredictions: sortedPredictions.slice(0, 5)
    }
  }
  
  // Check for aquatic/animal keywords
  const aquaticKeywords = ['animal', 'creature', 'organism', 'living', 'wildlife', 'marine', 'aquatic', 'sea', 'water', 'ocean', 'river', 'lake']
  const isAquatic = aquaticKeywords.some(keyword => lowerClassification.includes(keyword))
  
  if (isAquatic) {
    return {
      species: 'Fish (Possible)',
      confidence: Math.max(topPrediction.score * 0.6, 0.25),
      alternativeSpecies: sortedPredictions.slice(1, 5).map(p => ({
        name: p.label,
        confidence: p.score
      })),
      characteristics: ['Possible aquatic animal', 'Unknown species'],
      scientificName: 'Unknown',
      commonNames: ['Fish'],
      isUncertain: true,
      topPredictions: sortedPredictions.slice(0, 5)
    }
  }
  
  // Check for non-fish classifications
  const nonFishKeywords = ['bird', 'mammal', 'insect', 'plant', 'tree', 'car', 'building', 'person', 'human', 'dog', 'cat']
  const isNonFish = nonFishKeywords.some(keyword => lowerClassification.includes(keyword))
  
  if (isNonFish) {
    return {
      species: 'Not a Fish',
      confidence: topPrediction.score,
      alternativeSpecies: sortedPredictions.slice(1, 5).map(p => ({
        name: p.label,
        confidence: p.score
      })),
      characteristics: ['Not aquatic', 'Not fish-like'],
      scientificName: 'N/A',
      commonNames: [],
      isUncertain: false,
      topPredictions: sortedPredictions.slice(0, 5)
    }
  }
  
  // Default: assume it's a fish if we can't determine otherwise
  return {
    species: 'Fish (General)',
    confidence: Math.max(topPrediction.score * 0.5, 0.2),
    alternativeSpecies: sortedPredictions.slice(1, 5).map(p => ({
      name: p.label,
      confidence: p.score
    })),
    characteristics: ['Aquatic animal', 'Fins', 'Gills'],
    scientificName: 'Pisces',
    commonNames: ['Fish'],
    isUncertain: true,
    topPredictions: sortedPredictions.slice(0, 5)
  }
}

export const identifyFishWithHuggingFace = async (imageBase64: string): Promise<FishIdentificationResult> => {
  console.log('🔍 Starting enhanced fish identification with Hugging Face...')
  console.log('📱 User Agent:', navigator.userAgent)
  console.log('🌐 Network Status:', navigator.onLine ? 'Online' : 'Offline')
  
  // Enhanced image preprocessing with normalization
  const processedImage = await preprocessImage(imageBase64, 1200, 0.9)
  
  // Convert to blob for API call
  const imageBlob = base64ToBlob(processedImage)
  
  const apiKey = import.meta.env.VITE_HUGGINGFACE_TOKEN
  if (!apiKey) {
    throw new Error('Hugging Face API key not found. Please check your .env file.')
  }

  try {
    console.log('📡 Making API request to Hugging Face...')
    console.log('📊 Image size (processed):', (imageBlob.size / 1024).toFixed(2), 'KB')
    
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    const response = await fetch('https://api-inference.huggingface.co/models/google/vit-base-patch16-224', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/octet-stream'
      },
      signal: controller.signal,
      body: imageBlob
    })

    // Clear timeout since request completed
    clearTimeout(timeoutId)
    
    console.log('📡 Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Hugging Face API Error:', errorText)
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Hugging Face API response:', result)
    
    // Process the result with top-K predictions
    if (Array.isArray(result) && result.length > 0) {
      // Get top 5 predictions
      const topKPredictions = result.slice(0, 5)
      const mappedResult = mapToFishSpecies(topKPredictions)
      
      console.log('✅ Enhanced fish identification successful:', {
        species: mappedResult.species,
        confidence: mappedResult.confidence,
        isUncertain: mappedResult.isUncertain,
        topPredictions: mappedResult.topPredictions?.length || 0,
        alternativeSpecies: mappedResult.alternativeSpecies.length
      })
      
      return mappedResult
    } else {
      throw new Error('Invalid response format from Hugging Face API')
    }

  } catch (error) {
    console.error('Hugging Face fish identification error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your internet connection and try again.')
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.')
      }
    }
    
    throw new Error(`Failed to identify fish: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
