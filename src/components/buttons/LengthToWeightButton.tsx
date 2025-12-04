interface LengthToWeightButtonProps {
  onClick: () => void
}

const LengthToWeightButton = ({ onClick }: LengthToWeightButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl fishapp-main-button flex items-center justify-start p-3 text-white hover:scale-105 active:scale-95 transition-all duration-300 text-3xl font-semibold"
      style={{
        height: '48px',
        background: 'linear-gradient(135deg, #7f1d1d 0%, #ef4444 40%, #f97373 100%)',
        border: '3px solid #ffffff'
      }}
      aria-label="Length to Weight Calculator"
    >
      <div className="text-2xl mr-3">📏</div>
      <div className="text-3xl">
        Length-to-Weight
      </div>
    </button>
  )
}

export default LengthToWeightButton
