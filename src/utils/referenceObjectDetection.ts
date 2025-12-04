/**
 * Automatic Reference Object Detection
 * Detects common reference objects in images (credit cards, bottles, cans, etc.)
 */

interface DetectedObject {
  name: string
  length: number
  confidence: number
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  referencePoints: {
    x1: number
    y1: number
    x2: number
    y2: number
  }
}

interface ReferenceObject {
  name: string
  length: number
  width?: number
  aspectRatio: number
  minArea: number
  maxArea: number
}

// Known reference objects with their dimensions
const REFERENCE_OBJECTS: ReferenceObject[] = [
  {
    name: 'Credit Card',
    length: 8.6,
    width: 5.4,
    aspectRatio: 1.59, // 8.6 / 5.4
    minArea: 30,
    maxArea: 100
  },
  {
    name: '340ml Soda Can',
    length: 12.2,
    width: 6.6,
    aspectRatio: 1.85, // 12.2 / 6.6
    minArea: 40,
    maxArea: 150
  },
  {
    name: '440ml Soda Bottle',
    length: 23.0,
    width: 6.5,
    aspectRatio: 3.54, // 23.0 / 6.5
    minArea: 60,
    maxArea: 250
  },
  {
    name: '2L Soda Bottle',
    length: 32.0,
    width: 9.5,
    aspectRatio: 3.37, // 32.0 / 9.5
    minArea: 100,
    maxArea: 400
  },
  {
    name: '330ml Beer Bottle',
    length: 22.0,
    width: 6.5,
    aspectRatio: 3.38, // 22.0 / 6.5
    minArea: 60,
    maxArea: 250
  },
  {
    name: '20 Cigarette Pack',
    length: 8.5,
    width: 5.5,
    aspectRatio: 1.55, // 8.5 / 5.5
    minArea: 30,
    maxArea: 100
  }
]

/**
 * Detect edges in the image using Sobel operator
 */
function detectEdges(imageData: ImageData): ImageData {
  const width = imageData.width
  const height = imageData.height
  const data = imageData.data
  const edges = new ImageData(width, height)

  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0
      let gy = 0

      // Apply Sobel kernels
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
          const kernelIdx = (ky + 1) * 3 + (kx + 1)
          gx += gray * sobelX[kernelIdx]
          gy += gray * sobelY[kernelIdx]
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy)
      const edgeIdx = (y * width + x) * 4
      edges.data[edgeIdx] = magnitude
      edges.data[edgeIdx + 1] = magnitude
      edges.data[edgeIdx + 2] = magnitude
      edges.data[edgeIdx + 3] = 255
    }
  }

  return edges
}

/**
 * Find contours in the edge-detected image
 */
function findContours(imageData: ImageData, threshold: number = 100): Array<Array<{ x: number; y: number }>> {
  const width = imageData.width
  const height = imageData.height
  const data = imageData.data
  const visited = new Array(width * height).fill(false)
  const contours: Array<Array<{ x: number; y: number }>> = []

  function isEdge(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= width || y >= height) return false
    const idx = (y * width + x) * 4
    return data[idx] > threshold
  }

  function traceContour(startX: number, startY: number): Array<{ x: number; y: number }> {
    const contour: Array<{ x: number; y: number }> = []
    const stack = [{ x: startX, y: startY }]

    while (stack.length > 0) {
      const point = stack.pop()!
      const idx = point.y * width + point.x

      if (visited[idx] || !isEdge(point.x, point.y)) continue

      visited[idx] = true
      contour.push(point)

      // Check 8-connected neighbors
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue
          stack.push({ x: point.x + dx, y: point.y + dy })
        }
      }
    }

    return contour
  }

  // Find all contours
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (!visited[idx] && isEdge(x, y)) {
        const contour = traceContour(x, y)
        if (contour.length > 50) { // Minimum contour size
          contours.push(contour)
        }
      }
    }
  }

  return contours
}

/**
 * Get bounding box from contour
 */
function getBoundingBox(contour: Array<{ x: number; y: number }>) {
  let minX = Infinity, minY = Infinity
  let maxX = -Infinity, maxY = -Infinity

  for (const point of contour) {
    minX = Math.min(minX, point.x)
    minY = Math.min(minY, point.y)
    maxX = Math.max(maxX, point.x)
    maxY = Math.max(maxY, point.y)
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
}

/**
 * Match detected rectangle to known reference objects
 */
function matchReferenceObject(boundingBox: { width: number; height: number }): ReferenceObject | null {
  const aspectRatio = boundingBox.width / boundingBox.height
  const area = boundingBox.width * boundingBox.height

  let bestMatch: ReferenceObject | null = null
  let bestScore = Infinity

  for (const refObj of REFERENCE_OBJECTS) {
    // Check if aspect ratio matches (within tolerance)
    const aspectDiff = Math.abs(aspectRatio - refObj.aspectRatio)
    const aspectTolerance = 0.3

    // Check if area is within range
    const areaInRange = area >= refObj.minArea && area <= refObj.maxArea

    if (aspectDiff < aspectTolerance && areaInRange) {
      if (aspectDiff < bestScore) {
        bestScore = aspectDiff
        bestMatch = refObj
      }
    }
  }

  return bestMatch
}

/**
 * Main detection function
 */
export async function detectReferenceObject(imageUrl: string): Promise<DetectedObject | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        // Create canvas and get image data
        const canvas = document.createElement('canvas')
        const maxSize = 800 // Reduce image size for faster processing
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        // Detect edges
        const edges = detectEdges(imageData)

        // Find contours
        const contours = findContours(edges)

        // Find rectangular objects
        const rectangles = contours
          .map(contour => getBoundingBox(contour))
          .filter(bbox => {
            // Filter for rectangles (reasonable aspect ratios)
            const aspectRatio = bbox.width / bbox.height
            return aspectRatio > 0.3 && aspectRatio < 5 && bbox.width > 20 && bbox.height > 20
          })
          .sort((a, b) => (b.width * b.height) - (a.width * a.height)) // Sort by area

        // Try to match each rectangle to known reference objects
        for (const rect of rectangles) {
          const match = matchReferenceObject(rect)
          
          if (match) {
            // Scale coordinates back to original image size
            const scaleBack = 1 / scale

            const detectedObject: DetectedObject = {
              name: match.name,
              length: match.length,
              confidence: 0.7, // Arbitrary confidence score
              boundingBox: {
                x: rect.x * scaleBack,
                y: rect.y * scaleBack,
                width: rect.width * scaleBack,
                height: rect.height * scaleBack
              },
              referencePoints: {
                x1: rect.x * scaleBack,
                y1: (rect.y + rect.height / 2) * scaleBack,
                x2: (rect.x + rect.width) * scaleBack,
                y2: (rect.y + rect.height / 2) * scaleBack
              }
            }

            resolve(detectedObject)
            return
          }
        }

        resolve(null)
      } catch (error) {
        console.error('Error detecting reference object:', error)
        resolve(null)
      }
    }

    img.onerror = () => {
      resolve(null)
    }

    img.src = imageUrl
  })
}

