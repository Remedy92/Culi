"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Languages } from "lucide-react";

export const TextRevealCard = ({
  text,
  revealText,
  children,
  className,
  showInitialAnimation = false,
}: {
  text: string;
  revealText: string;
  children?: React.ReactNode;
  className?: string;
  showInitialAnimation?: boolean;
}) => {
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [hasShownAnimation, setHasShownAnimation] = useState(false);

  useEffect(() => {
    // Check if device supports touch
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    // Show initial animation on mobile for first card
    if (showInitialAnimation && isTouchDevice && !hasShownAnimation) {
      // Brief reveal animation with better timing
      setTimeout(() => {
        setIsClicked(true);
        setTimeout(() => {
          setIsClicked(false);
          setHasShownAnimation(true);
        }, 1000);
      }, 1500);
    }
  }, [showInitialAnimation, isTouchDevice, hasShownAnimation]);

  const isRevealed = isMouseOver || isClicked;

  const handleClick = () => {
    // Toggle on click for mobile
    setIsClicked(!isClicked);
  };

  const handleMouseEnter = () => {
    // Only use hover on non-touch devices
    if (!isTouchDevice) {
      setIsMouseOver(true);
    }
  };

  const handleMouseLeave = () => {
    // Only use hover on non-touch devices
    if (!isTouchDevice) {
      setIsMouseOver(false);
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={cn(
        "bg-warm-taupe/10 border border-warm-taupe/20 w-full rounded-3xl p-8 relative overflow-hidden shadow-warm hover:shadow-warm-lg transition-all duration-300 cursor-pointer select-none",
        className
      )}
    >
      {children}

      <div className="h-32 relative flex items-center justify-center">
        {/* Original text */}
        <motion.div
          animate={{
            opacity: isRevealed ? 0 : 1,
            scale: isRevealed ? 0.8 : 1,
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <p className="text-2xl sm:text-3xl font-bold text-warm-taupe">
            {text}
          </p>
        </motion.div>

        {/* Revealed text */}
        <motion.div
          animate={{
            opacity: isRevealed ? 1 : 0,
            scale: isRevealed ? 1 : 1.2,
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cream to-warm-taupe/5 rounded-2xl"
        >
          <p className="text-2xl sm:text-3xl font-bold text-terracotta">
            {revealText}
          </p>
        </motion.div>

        {/* Mobile indicator */}
        {isTouchDevice && !isClicked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-2 right-2 flex items-center gap-1 z-10 bg-cream/80 backdrop-blur-sm rounded-full px-2 py-1"
          >
            <motion.span 
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-sm text-terracotta font-medium"
            >
              Tap
            </motion.span>
            <Languages className="h-4 w-4 text-terracotta" />
          </motion.div>
        )}
        
        {/* Tap animation indicator */}
        {showInitialAnimation && isTouchDevice && !hasShownAnimation && (
          <>
            {/* Ripple effect */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 2, 2.5],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 2,
                delay: 1,
                times: [0, 0.5, 1]
              }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <div className="w-20 h-20 rounded-full bg-terracotta/50" />
            </motion.div>
            
            {/* Tap finger indicator */}
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ 
                scale: [0, 1, 1, 0],
                opacity: [0, 1, 1, 0],
                y: [20, 0, 0, -10]
              }}
              transition={{
                duration: 2,
                delay: 1,
                times: [0, 0.3, 0.7, 1]
              }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            >
              <div className="w-12 h-12 rounded-full bg-terracotta flex items-center justify-center shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.5 10.5C10.5 9.67157 11.1716 9 12 9C12.8284 9 13.5 9.67157 13.5 10.5V16.5C13.5 17.3284 12.8284 18 12 18C11.1716 18 10.5 17.3284 10.5 16.5V10.5Z" fill="white"/>
                  <path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" fill="white"/>
                </svg>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};