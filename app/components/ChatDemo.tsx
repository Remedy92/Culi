"use client"

import { motion } from "framer-motion"
import { TypeAnimation } from "react-type-animation"
import { useState } from "react"

const conversations = [
  {
    question: "Culi, what do you suggest for me on this menu?",
    answer: "Based on popular choices, I recommend the grilled salmon with seasonal vegetables. It's perfectly seasoned and pairs beautifully with our house white wine."
  },
  {
    question: "Does the pasta contain gluten?",
    answer: "Yes, our traditional pasta contains gluten. However, we offer gluten-free alternatives made from rice flour. Would you like me to highlight all gluten-free options?"
  },
  {
    question: "¿Qué es 'Coq au Vin'?",
    answer: "Coq au Vin es un clásico plato francés de pollo cocinado lentamente en vino tinto con champiñones, tocino y cebollas perladas. Es tierno y lleno de sabor."
  }
]

export function ChatDemo() {
  const [currentConversation, setCurrentConversation] = useState(0)
  const [showLoading, setShowLoading] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const handleSequenceComplete = () => {
    // Show loading dots after question is typed
    setShowLoading(true)
    
    // After 1.5 seconds, hide loading and show answer
    setTimeout(() => {
      setShowLoading(false)
      setShowAnswer(true)
      
      // After answer is shown for 3 seconds, move to next conversation
      setTimeout(() => {
        setShowAnswer(false)
        setCurrentConversation((prev) => (prev + 1) % conversations.length)
      }, 4000)
    }, 1500)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl bg-white/50 backdrop-blur-sm border border-warm-taupe/10 p-6 sm:p-8 shadow-warm">
        {/* Chat messages container */}
        <div className="space-y-4 min-h-[200px]">
          {/* Question */}
          <motion.div
            key={`question-${currentConversation}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-end"
          >
            <div className="max-w-[80%] rounded-2xl bg-spanish-orange text-white px-4 py-3">
              <TypeAnimation
                sequence={[
                  conversations[currentConversation].question,
                  handleSequenceComplete
                ]}
                wrapper="p"
                speed={70}
                className="text-sm sm:text-base"
                cursor={false}
              />
            </div>
          </motion.div>

          {/* Loading dots */}
          {showLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-start"
            >
              <div className="rounded-2xl bg-seasalt px-4 py-3">
                <div className="flex space-x-2">
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Answer */}
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-start"
            >
              <div className="max-w-[80%] rounded-2xl bg-seasalt px-4 py-3">
                <TypeAnimation
                  sequence={[conversations[currentConversation].answer]}
                  wrapper="p"
                  speed={80}
                  className="text-sm sm:text-base text-eerie-black"
                  cursor={false}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Culi indicator */}
        <div className="mt-6 flex items-center justify-center text-xs text-warm-taupe">
          <span className="font-medium">Powered by Culi AI</span>
        </div>
      </div>

      {/* CSS for loading dots */}
      <style jsx>{`
        .loading-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #ae9990;
          animation: loading-pulse 1.5s ease-in-out infinite;
        }

        .loading-dot:nth-child(1) {
          animation-delay: 0s;
        }

        .loading-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .loading-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes loading-pulse {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          30% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}