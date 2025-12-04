import { useState, useEffect } from 'react'
import { supabase, getFishImageUrl } from '../../config/supabase'

interface SpeciesInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Species {
  english_name: string
  afrikaans_name?: string
  scientific_name?: string
  min_size?: number
  bag_limit?: number
  closed_season?: string
  sassi_status?: string
  sassi_list?: string
  common_name_for_images?: string
  distribution?: string
  description?: string
  detailed_description?: string
  notes?: string
}

// Extract distribution from notes (last sentence often contains "Occurs from X to Y")
const extractDistributionFromNotes = (notes: string): string => {
  if (!notes) return ''
  
  // Look for patterns like "Occurs from X to Y" or "Found from X to Y"
  const patterns = [
    /occurs?\s+from\s+([a-z\s]+)\s+to\s+([a-z\s]+)/i,
    /found\s+from\s+([a-z\s]+)\s+to\s+([a-z\s]+)/i,
    /from\s+([a-z\s]+)\s+to\s+([a-z\s]+)/i,
  ]
  
  for (const pattern of patterns) {
    const match = notes.match(pattern)
    if (match) {
      return `${match[1].trim()} to ${match[2].trim()}`
    }
  }
  
  return ''
}

// Map distribution descriptions to map filenames
const getDistributionMapUrl = (text: string): string => {
  if (!text) return ''
  
  const dist = text.toLowerCase()
  
  const mapMappings: { [key: string]: string } = {
    'mozambique to namibia': 'FromMozambiquetoNamibia.jpg',
    'mozambique to cape agulhas': 'FromMozambiquetoCapeAgulhas.jpg',
    'mozambique to durban': 'FromMozambiquetoDurban.jpg',
    'mozambique to east london': 'FromMozambiquetoEastLondon.jpg',
    'mozambique to knysna': 'FromMozambiquetoKnysna.jpg',
    'mozambique to mossel bay': 'FromMozambiquetoMosselBay.jpg',
    'mozambique to port edward': 'FromMozambiquetoPortEdward.jpg',
    'mozambique to port elizabeth': 'FromMozambiquetoPortElizabeth.jpg',
    'mozambique to saldanha bay': 'FromMozambiquetoSaldanhaBay.jpg',
    'kosi bay to cape agulhas': 'FromKosiBaytoCapeAgulhas.jpg',
    'kosi bay to false bay': 'FromKosiBaytoFalseBay.jpg',
    'kosi bay to mossel bay': 'FromKosiBaytoMosselBay.jpg',
    'kosi bay to port elizabeth': 'FromKosiBaytoPortElizabeth.jpg',
    'durban to namibia': 'FromDurbantoNamibia.jpg',
    'durban to cape agulhas': 'FromDurbantoCapeAgulhas.jpg',
    'durban to false bay': 'FromDurbantoFalseBay.jpg',
    'durban to saldanha bay': 'FromDurbantoSaldanhaBay.jpg',
    'east london to namibia': 'FromEastLondontoNamibia.jpg',
    'false bay to namibia': 'FromFalseBaytoNamibia.jpg',
    'port edward to false bay': 'FromPortEdwardtoFalseBay.jpg',
    'port edward to saldanha bay': 'FromPortEdwardtoSaldanhaBay.jpg',
    'port elizabeth to namibia': 'FromPortElizabethtoNamibia.jpg',
    'port elizabeth to saldanha bay': 'FromPortElizabethtoSaldanhaBay.jpg',
  }
  
  for (const [pattern, filename] of Object.entries(mapMappings)) {
    if (dist.includes(pattern)) {
      return `/images/maps/${filename}`
    }
  }
  
  return ''
}

// Get SASSI status color and image
const getSassiInfo = (sassiStatus: string): { image: string, color: string, bg: string, label: string } => {
  if (!sassiStatus) return { image: '/images/SASSI_all.jpg', color: 'text-gray-400', bg: 'bg-gray-800', label: 'Unknown' }
  
  const status = sassiStatus.toLowerCase()
  if (status.includes('green') || status.includes('best')) {
    return { image: '/images/SASSI_green.jpg', color: 'text-green-400', bg: 'bg-green-900/40', label: '✓ Best Choice' }
  } else if (status.includes('orange') || status.includes('yellow') || status.includes('think')) {
    return { image: '/images/SASSI_yellow.jpg', color: 'text-yellow-400', bg: 'bg-yellow-900/40', label: '⚠ Think Twice' }
  } else if (status.includes('red') || status.includes('avoid') || status.includes('don\'t')) {
    return { image: '/images/SASSI_red.jpg', color: 'text-red-400', bg: 'bg-red-900/40', label: '✗ Avoid' }
  }
  return { image: '/images/SASSI_all.jpg', color: 'text-gray-400', bg: 'bg-gray-800', label: 'Check Status' }
}

const SpeciesInfoModal = ({ isOpen, onClose }: SpeciesInfoModalProps) => {
  const [species, setSpecies] = useState<Species[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && species.length === 0) {
      loadSpecies()
    }
  }, [isOpen])

  const loadSpecies = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('reference_table')
        .select('*')
        .order('english_name')

      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        setError('Failed to load from database')
      } else if (data && data.length > 0) {
        console.log(`Loaded ${data.length} species`)
        setSpecies(data)
      } else {
        setError('No species data found')
      }
    } catch (err) {
      console.error('Error loading species:', err)
      setError('Connection error')
    }
    
    setLoading(false)
  }

  const filteredSpecies = species.filter(s =>
    s.english_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.afrikaans_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.scientific_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isOpen) return null

  const fishImageUrl = selectedSpecies?.common_name_for_images 
    ? getFishImageUrl(selectedSpecies.common_name_for_images)
    : ''
  
  // Extract distribution from notes first, then fall back to distribution field
  const distributionFromNotes = selectedSpecies?.notes 
    ? extractDistributionFromNotes(selectedSpecies.notes)
    : ''
  const distributionText = distributionFromNotes || selectedSpecies?.distribution || ''
  const distributionMapUrl = distributionText ? getDistributionMapUrl(distributionText) : ''
  
  const sassiInfo = getSassiInfo(selectedSpecies?.sassi_list || '')

  return (
    <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">🐠 Species Info</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {!selectedSpecies ? (
        <>
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Search species..."
              className="w-full px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-xl border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
            {species.length > 0 && (
              <span className="absolute right-3 top-3 text-gray-500 text-sm">{species.length} species</span>
            )}
          </div>

          {/* Species List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin text-4xl">🐟</div>
              <span className="ml-3 text-white">Loading species...</span>
            </div>
          ) : error ? (
            <div className="text-center py-6 bg-red-900/20 rounded-xl border border-red-500/30">
              <p className="text-red-400">{error}</p>
              <button onClick={loadSpecies} className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">Retry</button>
            </div>
          ) : filteredSpecies.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              {species.length === 0 ? 'No species loaded' : `No results for "${searchTerm}"`}
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 380px)' }}>
              {filteredSpecies.map((s, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSpecies(s)}
                  className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${index % 2 === 0 ? '#1e3a5f' : '#2d3748'} 0%, ${index % 2 === 0 ? '#0f2744' : '#1a202c'} 100%)` }}
                >
                  <div className="font-semibold text-white">{s.english_name}</div>
                  {s.afrikaans_name && <div className="text-blue-300 text-sm">{s.afrikaans_name}</div>}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          {/* Header Card with Fish Image */}
          <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0a1929 100%)' }}>
            {fishImageUrl && (
              <img 
                src={fishImageUrl} 
                alt={selectedSpecies.english_name}
                className="w-full h-48 object-contain bg-gray-900/50"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <div className="p-4">
              <h3 className="text-2xl font-bold text-white">{selectedSpecies.english_name}</h3>
              {selectedSpecies.afrikaans_name && (
                <p className="text-cyan-300 text-lg">{selectedSpecies.afrikaans_name}</p>
              )}
              {selectedSpecies.scientific_name && (
                <p className="text-gray-400 italic text-sm mt-1">{selectedSpecies.scientific_name}</p>
              )}
            </div>
          </div>

          {/* Distribution Map - Right below fish image */}
          {distributionText && (
            <div className="rounded-xl p-3" style={{ background: 'linear-gradient(135deg, #134e4a 0%, #042f2e 100%)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🗺️</span>
                <h4 className="text-white font-semibold">Distribution</h4>
              </div>
              <p className="text-teal-200 text-sm mb-2 capitalize">{distributionText}</p>
              {distributionMapUrl && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={distributionMapUrl} 
                    alt="Distribution map"
                    className="w-full h-36 object-contain bg-gray-900/50"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl p-3 text-center" style={{ background: 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)' }}>
              <div className="text-green-300 text-xs font-medium">MIN SIZE</div>
              <div className="text-white text-lg font-bold">
                {selectedSpecies.min_size ? `${selectedSpecies.min_size}cm` : '—'}
              </div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #5c1f0e 100%)' }}>
              <div className="text-orange-300 text-xs font-medium">BAG LIMIT</div>
              <div className="text-white text-lg font-bold">
                {selectedSpecies.bag_limit || '—'}
              </div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' }}>
              <div className="text-blue-300 text-xs font-medium">SEASON</div>
              <div className="text-white text-sm font-bold">
                {selectedSpecies.closed_season || 'Open'}
              </div>
            </div>
          </div>

          {/* Description */}
          {(selectedSpecies.description || selectedSpecies.detailed_description) && (
            <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📖</span>
                <h4 className="text-white font-semibold">Description</h4>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {selectedSpecies.detailed_description || selectedSpecies.description}
              </p>
            </div>
          )}

          {/* Notes */}
          {selectedSpecies.notes && (
            <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📝</span>
                <h4 className="text-white font-semibold">Fishing Notes</h4>
              </div>
              <p className="text-indigo-200 text-sm leading-relaxed">{selectedSpecies.notes}</p>
            </div>
          )}

          {/* SASSI Status Card */}
          {sassiInfo && (
            <div className={`rounded-xl p-4 ${sassiInfo.bg}`}>
              <div className="flex items-center gap-4">
                <img 
                  src={sassiInfo.image} 
                  alt="SASSI"
                  className="w-20 h-20 object-contain"
                />
                <div className="flex-1">
                  <div className="text-white text-xs font-medium mb-1">SASSI STATUS</div>
                  <div className={`font-bold text-lg ${sassiInfo.color}`}>{sassiInfo.label}</div>
                  {selectedSpecies.sassi_list && (
                    <div className="text-gray-300 text-sm">{selectedSpecies.sassi_list}</div>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* Back Button */}
          <button
            onClick={() => setSelectedSpecies(null)}
            className="w-full rounded-xl flex items-center justify-center p-3 text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold"
            style={{ height: '48px', background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' }}
          >
            ← Back to Search
          </button>
        </div>
      )}

      {/* Return Button */}
      <button
        onClick={onClose}
        className="w-full rounded-xl flex items-center justify-center p-3 text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold"
        style={{ height: '48px', background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)' }}
      >
        Return
      </button>
    </div>
  )
}

export default SpeciesInfoModal
