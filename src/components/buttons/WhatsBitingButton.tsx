interface WhatsBitingButtonProps {
  onClick: () => void
}

const WhatsBitingButton = ({ onClick }: WhatsBitingButtonProps) => {
const buttonStyle = {
  height: '48px',
  background: 'linear-gradient(135deg, #000000 0%, #60a5fa 100%)',
  border: '3px solid #ffffff',
};
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl fishapp-main-button flex items-center justify-start p-3 text-white hover:scale-105 active:scale-95 transition-all duration-300 text-2xl font-semibold"
      style={buttonStyle}
      aria-label="What's biting where?"
    >
      <div className="text-2xl mr-3">🎣</div>
              <div className="text-4xl font-semibold">
        What's biting where?
      </div>
    </button>
  )
}

export default WhatsBitingButton
