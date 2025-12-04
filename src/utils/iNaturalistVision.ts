// iNaturalist Fish Identification Utility
// Uses iNaturalist's computer vision API to suggest likely taxa for an image

export interface FishIdentificationResult {
  species: string;
  confidence: number;
  alternativeSpecies: Array<{ name: string; confidence: number }>;
  characteristics: string[];
  scientificName?: string;
  commonNames?: string[];
  isUncertain?: boolean;
  detailedAnalysis?: string;
}

// Helper: convert data URL (base64) to Blob
const dataUrlToBlob = (dataUrl: string): Blob => {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/data:(.*);base64/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
};

// Map iNaturalist response into our common result format
const mapINatResponse = (data: any): FishIdentificationResult => {
  const results = data?.results || data?.suggestions || [];
  if (!Array.isArray(results) || results.length === 0) {
    return {
      species: 'Identification Failed',
      confidence: 0,
      alternativeSpecies: [],
      characteristics: ['No suggestions returned from iNaturalist'],
      isUncertain: true,
      detailedAnalysis: JSON.stringify(data, null, 2)
    };
  }

  const primary = results[0];
  const taxon = primary.taxon || {};

  const speciesName =
    taxon.preferred_common_name ||
    taxon.name ||
    'Unknown species';

  const confidence = typeof primary.score === 'number'
    ? primary.score
    : 0;

  const alternatives = results.slice(1, 5).map((r: any) => ({
    name: r.taxon?.preferred_common_name || r.taxon?.name || 'Unknown',
    confidence: typeof r.score === 'number' ? r.score : 0
  }));

  return {
    species: speciesName,
    confidence,
    alternativeSpecies: alternatives,
    characteristics: [
      'iNaturalist computer-vision suggestion',
      taxon.rank ? `Rank: ${taxon.rank}` : '',
      taxon.name ? `Scientific: ${taxon.name}` : ''
    ].filter(Boolean),
    scientificName: taxon.name,
    commonNames: taxon.preferred_common_name ? [taxon.preferred_common_name] : [],
    isUncertain: confidence < 0.7,
    detailedAnalysis: JSON.stringify(data, null, 2)
  };
};

// Main iNaturalist identification function
// NOTE: iNaturalist APIs are public but may enforce CORS / rate limits when called directly from the browser.
// This implementation is best-effort and surfaces detailed debug info on failure.
export const identifyFishWithINaturalist = async (
  imageBase64: string
): Promise<FishIdentificationResult> => {
  try {
    console.log('🔍 Starting iNaturalist fish identification...');

    const blob = dataUrlToBlob(imageBase64);
    const formData = new FormData();
    // iNaturalist expects the form field to be named "image"
    formData.append('image', blob, 'fish.jpg');

    // Use the score_image endpoint which returns CV scores for taxa
    const endpoint = 'https://api.inaturalist.org/v1/computervision/score_image';

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    console.log('📡 iNaturalist status:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ iNaturalist error:', response.status, text);
      throw new Error(`iNaturalist error ${response.status}: ${text}`);
    }

    const data = await response.json();
    console.log('✅ iNaturalist response:', data);

    return mapINatResponse(data);
  } catch (error) {
    console.error('❌ iNaturalist identification error:', error);
    return {
      species: 'Identification Failed (iNaturalist)',
      confidence: 0,
      alternativeSpecies: [],
      characteristics: ['Unable to process image with iNaturalist'],
      isUncertain: true,
      detailedAnalysis:
        error instanceof Error ? error.message : 'Unknown error from iNaturalist'
    };
  }
};


