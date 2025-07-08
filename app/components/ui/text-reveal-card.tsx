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
}: {
  text: string;
  revealText: string;
  children?: React.ReactNode;
  className?: string;
}) => {
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if device supports touch
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

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
        {isTouchDevice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-2 right-2"
          >
            <Languages className="h-4 w-4 text-warm-taupe/50" />
          </motion.div>
        )}
      </div>
    </div>
  );
};