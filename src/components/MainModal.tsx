import { useState } from 'react'
import LengthToWeightButton from './buttons/LengthToWeightButton'
import SpeciesInfoButton from './buttons/SpeciesInfoButton'
import PersonalGalleryButton from './buttons/PersonalGalleryButton'
import PublicGalleryButton from './buttons/PublicGalleryButton'
import SecondHandStoreButton from './buttons/SecondHandStoreButton'
import IdentifyFishButton from './buttons/IdentifyFishButton'
import MeasureFishButton from './buttons/MeasureFishButton'
import TideAndMoonButton from './buttons/TideAndMoonButton'
import WhatsBitingButton from './buttons/WhatsBitingButton'
import CompetitionPointsButton from './buttons/CompetitionPointsButton'
import AskQuestionButton from './buttons/AskQuestionButton'
import LengthToWeightModal from './modals/LengthToWeightModal'
import SpeciesInfoModal from './modals/SpeciesInfoModal'
import PersonalGalleryModal from './modals/PersonalGalleryModal'
import PublicGalleryModal from './modals/PublicGalleryModal'
import SecondHandStoreModal from './modals/SecondHandStoreModal'
import IdentifyFishModal from './modals/IdentifyFishModal'
import MeasureFishModal from './modals/MeasureFishModal'
import TideAndMoonModal from './modals/TideAndMoonModal'
import WhatsBitingModal from './modals/WhatsBitingModal'
import CompetitionPointsModal from './modals/CompetitionPointsModal'
import AskQuestionModal from './modals/AskQuestionModal'

interface MainModalProps {
  isOpen: boolean
  onClose: () => void
}

const MainModal = ({ isOpen, onClose }: MainModalProps) => {
  const [activeModal, setActiveModal] = useState<string | null>(null)

  if (!isOpen) return null

  const handleButtonClick = (modalType: string) => {
    setActiveModal(modalType)
    console.log(`Opening ${modalType} modal`)
  }

  const closeActiveModal = () => {
    setActiveModal(null)
  }

  // Render the active modal content inside the same panel
  const renderActiveModal = () => {
    switch (activeModal) {
      case 'length-to-weight':
        return <LengthToWeightModal isOpen={true} onClose={closeActiveModal} />
      case 'species-info':
        return <SpeciesInfoModal isOpen={true} onClose={closeActiveModal} />
      case 'identify-fish':
        return <IdentifyFishModal isOpen={true} onClose={closeActiveModal} />
      case 'measure-fish':
        return <MeasureFishModal isOpen={true} onClose={closeActiveModal} />
      case 'whats-biting':
        return <WhatsBitingModal isOpen={true} onClose={closeActiveModal} />
      case 'competition-points':
        return <CompetitionPointsModal isOpen={true} onClose={closeActiveModal} />
      case 'personal-gallery':
        return <PersonalGalleryModal isOpen={true} onClose={closeActiveModal} />
      case 'public-gallery':
        return <PublicGalleryModal isOpen={true} onClose={closeActiveModal} />
      case 'second-hand-store':
        return <SecondHandStoreModal isOpen={true} onClose={closeActiveModal} />
      case 'tide-and-moon':
        return <TideAndMoonModal isOpen={true} onClose={closeActiveModal} />
      case 'ask-question':
        return <AskQuestionModal isOpen={true} onClose={closeActiveModal} />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center modal-overlay p-4">
      <div
        className="relative w-full mx-1"
        style={{ maxWidth: '414px', marginTop: '178px' }} // moved up by ~30px from previous 208px
      >
        <div className="modal-content rounded-2xl p-6 flex flex-col" style={{background: 'linear-gradient(135deg, #1e3a8a 0%, #000000 100%)'}}>
          {activeModal ? (
            renderActiveModal()
          ) : (
            <div className="space-y-4">
              <LengthToWeightButton onClick={() => handleButtonClick('length-to-weight')} />
              <SpeciesInfoButton onClick={() => handleButtonClick('species-info')} />
              <IdentifyFishButton onClick={() => handleButtonClick('identify-fish')} />
              <MeasureFishButton onClick={() => handleButtonClick('measure-fish')} />
              <WhatsBitingButton onClick={() => handleButtonClick('whats-biting')} />
              <CompetitionPointsButton onClick={() => handleButtonClick('competition-points')} />
              <PersonalGalleryButton onClick={() => handleButtonClick('personal-gallery')} />
              <PublicGalleryButton onClick={() => handleButtonClick('public-gallery')} />
              <SecondHandStoreButton onClick={() => handleButtonClick('second-hand-store')} />
              <TideAndMoonButton onClick={() => handleButtonClick('tide-and-moon')} />
              <AskQuestionButton onClick={() => handleButtonClick('ask-question')} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MainModal
