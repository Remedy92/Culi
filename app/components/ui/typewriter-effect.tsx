"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  const renderWords = () => {
    return (
      <div>
        {wordsArray.map((word, idx) => {
          return (
            <span key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <motion.span
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: idx * 0.3 + index * 0.05,
                  }}
                  className={cn(`dark:text-white text-black`, word.className)}
                  key={`char-${index}`}
                >
                  {char}
                </motion.span>
              ))}
              &nbsp;
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "text-base sm:text-xl md:text-2xl lg:text-3xl font-normal",
        className
      )}
    >
      {renderWords()}
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[2px] h-4 md:h-5 lg:h-6 bg-blue-500",
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });
  
  const renderWords = () => {
    return (
      <div className="inline">
        {wordsArray.map((word, idx) => {
          const wordDelay = wordsArray
            .slice(0, idx)
            .reduce((total, w) => total + w.text.length * 0.03, 0);
            
          return (
            <span key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <motion.span
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.1,
                    ease: "easeInOut",
                    delay: wordDelay + index * 0.03,
                  }}
                  className={cn(`dark:text-white text-black`, word.className)}
                  key={`char-${index}`}
                >
                  {char}
                </motion.span>
              ))}
              {idx < wordsArray.length - 1 && <span>&nbsp;</span>}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn("", className)}>
      {renderWords()}
    </div>
  );
};