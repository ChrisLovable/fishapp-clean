import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Always create Supabase client with fallback
const finalUrl = supabaseUrl || 'https://gvijhiueitaujezwsdut.supabase.co'
const finalKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2aWpoaXVlaXRhdWplendzZHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MDE3NjEsImV4cCI6MjA3MjM3Nzc2MX0.x3ScEnQlt5pmQn9qE9Tw7qTSDeyvJkOa3nQAn7beaIs'

export const supabase = createClient(finalUrl, finalKey)

// Helper functions for image URLs
export const getFishImageUrl = (imageName: string, speciesName?: string) => {
  // Use database image name directly
  let imageFile = imageName
  
  // If no image name provided, return empty string - NO FALLBACK
  if (!imageFile) {
    return ''
  }

  // Ensure the image file has .jpg extension if it doesn't already
  if (!imageFile.endsWith('.jpg') && !imageFile.endsWith('.JPG')) {
    imageFile = imageFile + '.jpg'
  }
  
  // ALWAYS use local images - fish images are stored locally, not in Supabase
  return `/images/fish/${imageFile}`
}

export const getDistributionMapUrl = (mapName: string) => {
  // Default fallback map
  const defaultMap = 'MAP22.jpg'
  
  // If no map name provided, use default
  let finalMapName = mapName || defaultMap
  
  // Normalize the map name: convert to uppercase with .jpg extension
  if (finalMapName) {
    finalMapName = finalMapName.toUpperCase()
    if (!finalMapName.endsWith('.JPG')) {
      finalMapName = finalMapName + '.JPG'
    }
    // Convert extension to lowercase to match actual files
    finalMapName = finalMapName.replace('.JPG', '.jpg')
  }
  
  // Try Supabase first
  try {
    const { data } = supabase.storage
      .from('distribution-maps')
      .getPublicUrl(finalMapName)
    
    if (data?.publicUrl) {
      return data.publicUrl
    }
  } catch (error) {
    // Silently fallback
  }
  
  // Return empty string if failed - show "NOT AVAILABLE"
  return ''
}
