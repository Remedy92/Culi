"use client"

import { motion } from "framer-motion"
import { TypeAnimation } from "react-type-animation"
import { useState, useEffect, useRef } from "react"
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(motionQuery.matches)
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current)
    }
  }, [])

  const handleSequenceComplete = () => {
    // Show loading dots after question is typed
    setShowLoading(true)
    
    // After 1.5 seconds, hide loading and show answer
    loadingTimeoutRef.current = setTimeout(() => {
      setShowLoading(false)
      setShowAnswer(true)
      
      // After answer is shown for 3 seconds, move to next conversation
      timeoutRef.current = setTimeout(() => {
        setShowAnswer(false)
        setCurrentConversation((prev) => (prev + 1) % conversations.length)
      }, 4000)
    }, 1500)
  }


  return (
    <div className="mx-auto max-w-container-narrow md:max-w-container-standard px-4 sm:px-0">
      <div className="relative rounded-2xl bg-white/50 backdrop-blur-sm border border-warm-taupe/10 p-4 sm:p-6 md:p-8 shadow-warm touch-manipulation">
        
        {/* Chat messages container */}
        <div className="space-y-3 sm:space-y-4 min-h-[180px] sm:min-h-[200px]">
          {/* Question */}
          <motion.div
            key={`question-${currentConversation}`}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            className="flex justify-end"
          >
            <div className="max-w-[85%] sm:max-w-[80%] rounded-2xl bg-spanish-orange text-white px-3 py-2 sm:px-4 sm:py-3">
              <TypeAnimation
                sequence={[
                  conversations[currentConversation].question,
                  handleSequenceComplete
                ]}
                wrapper="p"
                speed={70}
                className="text-sm sm:text-base leading-relaxed"
                cursor={false}
              />
            </div>
          </motion.div>

          {/* Loading dots */}
          {showLoading && (
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              className="flex justify-start"
            >
              <div className="rounded-2xl bg-seasalt px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex space-x-1.5 sm:space-x-2">
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
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              className="flex justify-start"
            >
              <div className="max-w-[85%] sm:max-w-[80%] rounded-2xl bg-seasalt px-3 py-2 sm:px-4 sm:py-3">
                <TypeAnimation
                  sequence={[conversations[currentConversation].answer]}
                  wrapper="p"
                  speed={80}
                  className="text-sm sm:text-base text-eerie-black leading-relaxed"
                  cursor={false}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Culi indicator */}
        <div className="mt-4 sm:mt-6 flex items-center justify-center text-xs text-warm-taupe">
          <span className="font-medium">{t('poweredBy')}</span>
        </div>
      </div>

      {/* CSS for loading dots */}
      <style jsx>{`
        .loading-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #ae9990;
          animation: loading-pulse 1.5s ease-in-out infinite;
        }
        
        @media (min-width: 640px) {
          .loading-dot {
            width: 8px;
            height: 8px;
          }
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
        
        @media (prefers-reduced-motion: reduce) {
          .loading-dot {
            animation: none;
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  )
}