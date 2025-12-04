import { useEffect, useRef, useState } from 'react'

interface AskQuestionModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ExpertQuestion {
  id: string
  questionText: string
  imageDataUrl?: string
  userName?: string
  createdAt: string
}

interface ExpertAnswer {
  id: string
  questionId: string
  answerText: string
  userName?: string
  createdAt: string
}

interface QuestionWithAnswers extends ExpertQuestion {
  answers: ExpertAnswer[]
}

const QUESTIONS_STORAGE_KEY = 'fishapp_expert_questions'
const ANSWERS_STORAGE_KEY = 'fishapp_expert_answers'

const AskQuestionModal = ({ isOpen, onClose }: AskQuestionModalProps) => {
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([])
  const [questionText, setQuestionText] = useState('')
  const [questionUserName, setQuestionUserName] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newAnswers, setNewAnswers] = useState<Record<string, string>>({})
  const [answerNames, setAnswerNames] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadFromStorage()
    }
  }, [isOpen])

  const loadFromStorage = () => {
    setIsLoading(true)
    try {
      const storedQuestions = localStorage.getItem(QUESTIONS_STORAGE_KEY)
      const storedAnswers = localStorage.getItem(ANSWERS_STORAGE_KEY)

      const parsedQuestions: ExpertQuestion[] = storedQuestions ? JSON.parse(storedQuestions) : []
      const parsedAnswers: ExpertAnswer[] = storedAnswers ? JSON.parse(storedAnswers) : []

      const combined: QuestionWithAnswers[] = parsedQuestions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(q => ({
          ...q,
          answers: parsedAnswers
            .filter(a => a.questionId === q.id)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
        }))

      setQuestions(combined)
    } catch (error) {
      console.error('Error loading Ask a Question data from storage:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveToStorage = (updatedQuestions: QuestionWithAnswers[]) => {
    try {
      const flatQuestions: ExpertQuestion[] = updatedQuestions.map(({ answers, ...q }) => q)
      const flatAnswers: ExpertAnswer[] = updatedQuestions.flatMap(q => q.answers)

      localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(flatQuestions))
      localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(flatAnswers))
    } catch (error) {
      console.error('Error saving Ask a Question data to storage:', error)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const supportedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
      'image/tiff',
      'image/bmp',
    ]

    if (!supportedTypes.includes(file.type.toLowerCase())) {
      alert('Please select a valid image file (JPEG, PNG, WebP, HEIC, etc.)')
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result as string
      setSelectedImage(result)
    }
    reader.onerror = error => {
      console.error('FileReader error:', error)
      alert('Failed to process the selected image. Please try again.')
    }
    reader.readAsDataURL(file)
  }

  const resetQuestionForm = () => {
    setQuestionText('')
    setQuestionUserName('')
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmitQuestion = async () => {
    if (!questionText.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      const newQuestion: QuestionWithAnswers = {
        id: Date.now().toString(),
        questionText: questionText.trim(),
        imageDataUrl: selectedImage || undefined,
        userName: questionUserName.trim() || undefined,
        createdAt: new Date().toISOString(),
        answers: [],
      }

      const updatedQuestions = [newQuestion, ...questions]
      setQuestions(updatedQuestions)
      saveToStorage(updatedQuestions)
      resetQuestionForm()
    } catch (error) {
      console.error('Error submitting question:', error)
      alert('Failed to submit your question. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitAnswer = (questionId: string) => {
    const answerText = newAnswers[questionId]?.trim()
    if (!answerText) return

    const userName = answerNames[questionId]?.trim()

    const newAnswer: ExpertAnswer = {
      id: `${questionId}-${Date.now().toString()}`,
      questionId,
      answerText,
      userName: userName || undefined,
      createdAt: new Date().toISOString(),
    }

    const updatedQuestions = questions.map(q =>
      q.id === questionId
        ? {
            ...q,
            answers: [...q.answers, newAnswer],
          }
        : q,
    )

    setQuestions(updatedQuestions)
    saveToStorage(updatedQuestions)

    setNewAnswers(prev => ({ ...prev, [questionId]: '' }))
    setAnswerNames(prev => ({ ...prev, [questionId]: '' }))
  }

  const formatDateTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('en-ZA', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isOpen) return null

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto fishapp-card-3d p-4">
      <h2 className="text-2xl font-bold text-white mb-2">🧠 Ask the Community</h2>

      {/* New Question */}
      <div className="bg-blue-900/30 rounded-lg border border-blue-500/50 p-4 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-white">Ask a Question</h3>
          <span className="text-xs text-blue-200">Questions are stored on this device for now</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={questionUserName}
            onChange={e => setQuestionUserName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
          />

          <textarea
            placeholder="What would you like to ask? (e.g. 'Is this a legal size galjoen from Durban?')"
            value={questionText}
            onChange={e => setQuestionText(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm resize-none"
          />

          {/* Image Upload */}
          <div>
            <label className="block text-white text-sm font-semibold mb-1">Optional photo</label>
            {!selectedImage ? (
              <div className="border-2 border-dashed border-blue-400 rounded-lg p-3 text-center">
                <div className="text-3xl mb-1">📸</div>
                <p className="text-blue-200 mb-2 text-xs">Attach a photo to give more context</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-xs"
                />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Question"
                  className="w-full max-h-64 object-contain rounded-lg bg-gray-800"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmitQuestion}
            disabled={isSubmitting || !questionText.trim()}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
          >
            {isSubmitting ? 'Posting...' : 'Post Question'}
          </button>
        </div>
      </div>

      {/* Existing Questions */}
      <div>
        <h3 className="text-lg font-bold text-white mb-2">
          Community Questions ({questions.length})
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-white">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
            <span className="ml-2 text-sm">Loading questions...</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p>No questions yet.</p>
            <p className="text-sm mt-1">Be the first to ask the FishApp community!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map(question => (
              <div
                key={question.id}
                className="bg-gray-800/50 rounded-lg border border-gray-600 p-3 space-y-2"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-300 text-sm font-semibold">
                        {question.userName || 'Anonymous angler'}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {formatDateTime(question.createdAt)}
                      </span>
                    </div>
                    <p className="text-white text-sm">{question.questionText}</p>
                  </div>
                </div>

                {question.imageDataUrl && (
                  <img
                    src={question.imageDataUrl}
                    alt="Question"
                    className="w-full max-h-48 object-contain rounded-lg bg-gray-900 mt-1"
                  />
                )}

                {/* Answers */}
                <div className="mt-2 space-y-2">
                  {question.answers.length > 0 && (
                    <div className="space-y-1">
                      {question.answers.map(answer => (
                        <div
                          key={answer.id}
                          className="bg-gray-900/70 rounded-md border border-gray-700 p-2"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-green-300 text-xs font-semibold">
                              {answer.userName || 'Community member'}
                            </span>
                            <span className="text-gray-500 text-[10px]">
                              {formatDateTime(answer.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-100 text-xs">{answer.answerText}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Answer */}
                  <div className="bg-gray-900/40 rounded-md border border-gray-700 p-2 space-y-1">
                    <input
                      type="text"
                      placeholder="Your name (optional)"
                      value={answerNames[question.id] || ''}
                      onChange={e =>
                        setAnswerNames(prev => ({ ...prev, [question.id]: e.target.value }))
                      }
                      className="w-full px-2 py-1 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none text-[11px] mb-1"
                    />
                    <textarea
                      placeholder="Add your answer or advice..."
                      value={newAnswers[question.id] || ''}
                      onChange={e =>
                        setNewAnswers(prev => ({ ...prev, [question.id]: e.target.value }))
                      }
                      rows={2}
                      className="w-full px-2 py-1 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none text-xs resize-none mb-1"
                    />
                    <button
                      onClick={() => handleSubmitAnswer(question.id)}
                      disabled={!newAnswers[question.id]?.trim()}
                      className="w-full py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded text-xs font-semibold transition-colors"
                    >
                      Post Answer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

export default AskQuestionModal


