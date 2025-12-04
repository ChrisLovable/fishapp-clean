import { useState, useEffect } from 'react'
import EmailVerificationModal from './modals/EmailVerificationModal'
import PWAInstallPrompt from './PWAInstallPrompt'

interface OnboardingFlowProps {
  children: React.ReactNode
}

export default function OnboardingFlow({ children }: OnboardingFlowProps) {
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [showPWAInstall, setShowPWAInstall] = useState(false)
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null)

  useEffect(() => {
    // Skip email verification and go straight to the app
    setVerifiedEmail('demo@fishapp.com')
    setIsOnboardingComplete(true)
    
    // PWA install prompt disabled – always use web version
    setShowPWAInstall(false)
  }, [])

  const handleEmailVerified = (email: string) => {
    setVerifiedEmail(email)
    setShowEmailVerification(false)
    setIsOnboardingComplete(true)
    
    // Show PWA install prompt after email verification
    setTimeout(() => {
      setShowPWAInstall(true)
    }, 1000)
  }

  const handlePWAInstalled = () => {
    localStorage.setItem('pwaInstalled', 'true')
    setShowPWAInstall(false)
  }

  const handleCloseEmailVerification = () => {
    // Don't allow closing email verification - it's required
    // User must complete verification to use the app
  }

  const handleClosePWAInstall = () => {
    setShowPWAInstall(false)
    // User can skip PWA installation and use the web version
  }

  // Show loading state while checking onboarding status
  if (!isOnboardingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/zoolooklogo.jpg" 
            alt="FishApp Logo" 
            className="h-32 w-auto mx-auto mb-4 object-contain"
          />
          <div className="text-white text-xl font-semibold">Loading FishApp...</div>
          <div className="text-blue-200 text-sm mt-2">Preparing your fishing experience</div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Main App Content */}
      {children}
      
      {/* Email Verification Modal - Disabled for now */}
      {/* <EmailVerificationModal
        isOpen={showEmailVerification}
        onVerified={handleEmailVerified}
        onClose={handleCloseEmailVerification}
      /> */}
      
      {/* PWA Install Prompt disabled */}
      {/* <PWAInstallPrompt
        isOpen={showPWAInstall}
        onClose={handleClosePWAInstall}
        onInstalled={handlePWAInstalled}
      /> */}
    </>
  )
}
