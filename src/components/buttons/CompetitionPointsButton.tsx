interface CompetitionPointsButtonProps {
  onClick: () => void
}

const CompetitionPointsButton = ({ onClick }: CompetitionPointsButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl fishapp-main-button flex items-center justify-start p-3 text-white hover:scale-105 active:scale-95 transition-all duration-300 text-3xl font-semibold"
      style={{
        height: '48px',
        background: 'linear-gradient(135deg, #000000 0%, #60a5fa 100%)',
        border: '3px solid #ffffff'
      }}
      aria-label="Competition Points Calculator"
    >
      <div className="text-2xl mr-3">🏆</div>
      <div className="text-3xl">
        Points Calculator
      </div>
    </button>
  )
}

export default CompetitionPointsButton
