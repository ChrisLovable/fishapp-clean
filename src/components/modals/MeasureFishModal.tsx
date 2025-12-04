import React, { useState, useRef, useEffect } from 'react'

interface MeasureFishModalProps {
  isOpen: boolean
  onClose: () => void
}

interface MeasurementPoint {
  x: number
  y: number
}

interface ReferenceObject {
  name: string
  length: number // in cm
  image: string
}

const commonReferenceObjects: ReferenceObject[] = [
  // NOTE: file names match images under public (lowercase .jpg)
  { name: 'Credit Card', length: 8.6, image: '/credit.jpg' },
  { name: '440ml Soda Bottle', length: 23.0, image: '/bottle.jpg' },
  { name: '2L Soda Bottle', length: 32.0, image: '/2lcoke.jpg' },
  { name: '340ml Soda Can', length: 12.2, image: '/can.jpg' },
  { name: '330ml Beer Bottle', length: 22.0, image: '/beerbottle.jpg' },
  { name: '20 Cigarette Pack', length: 8.5, image: '/cigs.jpg' },
]

export default function MeasureFishModal({ isOpen, onClose }: MeasureFishModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [referenceObject, setReferenceObject] = useState<ReferenceObject | null>(null)
  const [referencePoints, setReferencePoints] = useState<MeasurementPoint[]>([])
  const [fishPoints, setFishPoints] = useState<MeasurementPoint[]>([])
  const [calculatedLength, setCalculatedLength] = useState<number | null>(null)
  const [mode, setMode] = useState<'reference' | 'fish'>('reference')
  
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string)
        setReferencePoints([])
        setFishPoints([])
        setCalculatedLength(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !selectedImage) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    if (mode === 'reference' && referencePoints.length < 2) {
      setReferencePoints([...referencePoints, { x, y }])
      if (referencePoints.length === 1) {
        setMode('fish')
      }
    } else if (mode === 'fish') {
      setFishPoints([...fishPoints, { x, y }])
    }
  }

  // Calculate length when points change
  useEffect(() => {
    if (referencePoints.length === 2 && fishPoints.length >= 2 && referenceObject) {
      const refDist = Math.sqrt(
        Math.pow(referencePoints[1].x - referencePoints[0].x, 2) +
        Math.pow(referencePoints[1].y - referencePoints[0].y, 2)
      )
      
      let fishDist = 0
      for (let i = 1; i < fishPoints.length; i++) {
        fishDist += Math.sqrt(
          Math.pow(fishPoints[i].x - fishPoints[i-1].x, 2) +
          Math.pow(fishPoints[i].y - fishPoints[i-1].y, 2)
        )
      }
      
      const pixelsPerCm = refDist / referenceObject.length
      const fishLength = fishDist / pixelsPerCm
      setCalculatedLength(fishLength)
    }
  }, [referencePoints, fishPoints, referenceObject])

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !selectedImage) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Draw reference points (blue)
      ctx.fillStyle = '#0066ff'
      referencePoints.forEach((p, i) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 8, 0, 2 * Math.PI)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.font = '12px Arial'
        ctx.fillText(`R${i+1}`, p.x - 8, p.y - 12)
        ctx.fillStyle = '#0066ff'
      })
      if (referencePoints.length === 2) {
        ctx.strokeStyle = '#0066ff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(referencePoints[0].x, referencePoints[0].y)
        ctx.lineTo(referencePoints[1].x, referencePoints[1].y)
        ctx.stroke()
      }

      // Draw fish points (red)
      ctx.fillStyle = '#ff0000'
      fishPoints.forEach((p, i) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 8, 0, 2 * Math.PI)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.fillText(`F${i+1}`, p.x - 8, p.y - 12)
        ctx.fillStyle = '#ff0000'
      })
      if (fishPoints.length >= 2) {
        ctx.strokeStyle = '#ff0000'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(fishPoints[0].x, fishPoints[0].y)
        fishPoints.slice(1).forEach(p => ctx.lineTo(p.x, p.y))
        ctx.stroke()
      }
    }
    img.src = selectedImage
  }, [selectedImage, referencePoints, fishPoints])

  const reset = () => {
    setSelectedImage(null)
    setReferenceObject(null)
    setReferencePoints([])
    setFishPoints([])
    setCalculatedLength(null)
    setMode('reference')
  }

  if (!isOpen) return null

  return (
    <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
      <h2 className="text-2xl font-bold text-white mb-2">📏 Measure Fish</h2>

      {/* Step 1: Upload Image */}
      <div>
        <label className="block text-white text-sm font-semibold mb-2">
          1. Upload Fish Photo
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 text-sm"
        />
      </div>

      {/* Step 2: Select Reference Object (always visible with 6 images + radios) */}
      <div>
        <label className="block text-white text-sm font-semibold mb-2">
          2. Select Reference Object
        </label>
        <div className="grid grid-cols-3 gap-3">
          {commonReferenceObjects.map((ref) => (
            <label
              key={ref.name}
              className={`flex flex-col items-center p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                referenceObject?.name === ref.name
                  ? 'border-blue-400 bg-blue-900/70 shadow-md'
                  : 'border-gray-600 bg-gray-800/80 hover:bg-gray-700/80'
              }`}
            >
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  name="referenceObject"
                  value={ref.name}
                  checked={referenceObject?.name === ref.name}
                  onChange={() => setReferenceObject(ref)}
                  className="mr-2"
                />
                <span className="text-white text-[11px] font-semibold text-center leading-tight">
                  {ref.name}
                </span>
              </div>
              <div className="w-16 h-16 mb-2 rounded-lg overflow-hidden border border-gray-700 bg-black">
                <img
                  src={ref.image}
                  alt={ref.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-gray-300 text-[10px] mt-1">{ref.length} cm</div>
            </label>
          ))}
        </div>
      </div>

      {/* Canvas for measurement */}
      {selectedImage && referenceObject && (
        <div>
          <div className="text-white text-sm mb-2">
            {mode === 'reference' 
              ? `3. Click 2 points on ${referenceObject.name} (${referencePoints.length}/2)`
              : `4. Click points along fish body (${fishPoints.length} points)`
            }
          </div>
          <div className="border border-gray-600 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full cursor-crosshair"
              style={{ maxHeight: '200px', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}

      {/* Result */}
      {calculatedLength !== null && (
        <div className="p-4 bg-green-900/30 rounded-lg border border-green-500/50">
          <h3 className="text-white font-semibold mb-2">Fish Length:</h3>
          <p className="text-green-200 text-2xl font-bold">
            {calculatedLength.toFixed(1)} cm
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex-1 rounded-xl flex items-center justify-center p-3 text-white hover:scale-105 active:scale-95 transition-all duration-300 text-lg font-semibold"
          style={{ height: '48px', background: 'linear-gradient(135deg, #4b5563 0%, #9ca3af 100%)' }}
        >
          Reset
        </button>
        <button
          onClick={onClose}
          className="flex-1 rounded-xl flex items-center justify-center p-3 text-white hover:scale-105 active:scale-95 transition-all duration-300 text-lg font-semibold"
          style={{ height: '48px', background: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)' }}
        >
          Return
        </button>
      </div>
    </div>
  )
}
