"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    setMousePosition({ x: clientX, y: clientY });
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-30 transition duration-300",
        className
      )}
    >
      <div className="relative h-full w-full">
        <Beam className="top-0" style={{ top: 0, left: mousePosition.x }} />
        <Beam
          className="top-1/3"
          style={{ top: "33.33%", left: mousePosition.x + 100 }}
        />
        <Beam
          className="top-2/3"
          style={{ top: "66.66%", left: mousePosition.x - 100 }}
        />
      </div>
    </div>
  );
};

const Beam = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.5] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      }}
      style={style}
      className={cn(
        "absolute h-[2px] w-[200px] bg-gradient-to-r from-transparent via-spanish-orange to-transparent",
        className
      )}
    />
  );
};