import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

interface StoreItem {
  id: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  location: string
  contactName: string
  contactPhone: string
  imageUrls: string[]
  timestamp: number
  isSold: boolean
}

interface SecondHandStoreModalProps {
  isOpen: boolean
  onClose: () => void
}

const categories = ['Rods', 'Reels', 'Tackle', 'Boats', 'Electronics', 'Clothing', 'Other']

const SecondHandStoreModal = ({ isOpen, onClose }: SecondHandStoreModalProps) => {
  const [items, setItems] = useState<StoreItem[]>([])
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadItems()
    }
  }, [isOpen])

  const loadItems = async () => {
    setIsLoading(true)
    try {
      // For now, use local storage as fallback
      const stored = localStorage.getItem('fishapp_store_items')
      if (stored) {
        setItems(JSON.parse(stored))
      }
    } catch (err) {
      console.error('Error loading items:', err)
    }
    setIsLoading(false)
  }

  const filteredItems = items.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    const matchesSearch = !searchTerm || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch && !item.isSold
  })

  if (!isOpen) return null

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto fishapp-card-3d p-4">
      <h2 className="text-2xl font-bold text-white mb-2">🛒 Second-Hand Store</h2>

      {/* Header */}
      <div className="flex items-center justify-between bg-gray-800/50 rounded-lg border border-gray-600 p-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Fishing Gear Marketplace</h3>
          <p className="text-gray-400 text-xs">Buy and sell fishing equipment</p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm"
        >
          {showUploadForm ? 'Cancel' : 'Sell'}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-gray-800/50 rounded-lg border border-gray-600 p-3 space-y-3">
          <h3 className="text-white font-semibold">Sell Your Item</h3>
          <p className="text-gray-400 text-sm">
            Upload form coming soon. Contact support to list items.
          </p>
          <button
            onClick={() => setShowUploadForm(false)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
          >
            Close
          </button>
        </div>
      )}

      {/* Items List */}
      {isLoading ? (
        <div className="text-white text-center py-4">Loading items...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🎣</div>
          <p className="text-gray-400">No items listed yet</p>
          <p className="text-gray-500 text-sm">Be the first to sell something!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-gray-800/50 rounded-lg border border-gray-600 p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-white font-semibold">{item.title}</h4>
                  <p className="text-gray-400 text-sm">{item.category} • {item.condition}</p>
                  <p className="text-green-400 font-bold">R {item.price}</p>
                </div>
                {item.imageUrls?.[0] && (
                  <img 
                    src={item.imageUrls[0]} 
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
              </div>
              <p className="text-gray-300 text-sm mt-2">{item.description}</p>
              <div className="text-gray-500 text-xs mt-2">
                📍 {item.location} • 📞 {item.contactName}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Return Button */}
      <button
        onClick={onClose}
        className="w-full rounded-xl flex items-center justify-center p-3 text-white hover:scale-105 active:scale-95 transition-all duration-300 text-lg font-semibold"
        style={{ height: '48px', background: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)' }}
      >
        Return
      </button>
    </div>
  )
}

export default SecondHandStoreModal
