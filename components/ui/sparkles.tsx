"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const SparklesCore = (props: {
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
}) => {
  const {
    background = "transparent",
    minSize = 0.4,
    maxSize = 1,
    particleDensity = 100,
    className,
    particleColor = "#FFF"
  } = props;
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      delay: number;
      duration: number;
    }>
  >([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < particleDensity; i++) {
        newParticles.push({
          id: Math.random(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * (maxSize - minSize) + minSize,
          delay: Math.random() * 2,
          duration: Math.random() * 3 + 2,
        });
      }
      setParticles(newParticles);
    };
    generateParticles();
  }, [particleDensity, maxSize, minSize]);

  return (
    <div
      className={cn("absolute inset-0", className)}
      style={{
        background,
      }}
    >
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute inline-block animate-sparkle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          <svg
            width={particle.size}
            height={particle.size}
            viewBox="0 0 10 10"
          >
            <circle cx="5" cy="5" r="5" fill={particleColor} />
          </svg>
        </span>
      ))}
      <style jsx>{`
        @keyframes sparkle {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0);
          }
        }
        .animate-sparkle {
          animation: sparkle linear infinite;
        }
      `}</style>
    </div>
  );
};

export const Sparkles = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
} & React.ComponentProps<typeof SparklesCore>) => {
  return (
    <div className={cn("relative", className)}>
      <SparklesCore {...props} />
      <div className="relative z-10">{children}</div>
    </div>
  );
};