"use client"

import { motion } from "framer-motion"
import { TypeAnimation } from "react-type-animation"
import { useState } from "react"
import { useTranslations } from 'next-intl'

export function ChatDemo() {
  const t = useTranslations('chatDemo');
  
  const conversations = [
    {
      question: t('conversations.suggestion.question'),
      answer: t('conversations.suggestion.answer')
    },
    {
      question: t('conversations.glutenFree.question'),
      answer: t('conversations.glutenFree.answer')
    },
    {
      question: t('conversations.spanish.question'),
      answer: t('conversations.spanish.answer')
    }
  ];
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
          <span className="font-medium">{t('poweredBy')}</span>
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