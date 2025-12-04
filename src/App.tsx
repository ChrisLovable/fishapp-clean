import { useState, useEffect } from 'react'
import MainModal from './components/MainModal'
import OnboardingFlow from './components/OnboardingFlow'
import './App.css'

function App() {
  const [isMainModalOpen, setIsMainModalOpen] = useState(true)

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }
  }, [])

  return (
    <OnboardingFlow>
      <div className="min-h-screen w-full flex flex-col items-center p-4 relative">
        {/* Large Logo at Top Center - Above modal, clear and sharp, round */}
        <div className="flex flex-col items-center mb-6 mt-2 relative z-[60] pointer-events-none">
          <img 
            src="/zoolooklogo.jpg" 
            alt="FishApp Logo" 
            className="h-36 w-36 rounded-full object-cover"
            style={{ 
              imageRendering: 'auto',
              filter: 'none',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
          />
        </div>
        
        <div className="w-full max-w-4xl flex flex-col items-center mt-12">
          <div className="w-full flex-1 flex items-center justify-center">
            {!isMainModalOpen && (
              <button
                onClick={() => setIsMainModalOpen(true)}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Open FishApp Menu
              </button>
            )}

            <MainModal 
              isOpen={isMainModalOpen}
              onClose={() => setIsMainModalOpen(false)}
            />
          </div>
        </div>
      </div>
    </OnboardingFlow>
  )
}

export default App
