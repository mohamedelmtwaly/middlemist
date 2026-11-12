import { useEffect, useState } from "react";
import logo from "@/assets/logo-middlemist-transparent.png";

interface LoadingScreenProps {
  isLoading: boolean;
}

export function LoadingScreen({ isLoading }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setIsAnimatingOut(false);
      setIsVisible(true);
      return undefined;
    }
  }, [isLoading]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        isAnimatingOut ? "opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "var(--primary)" }}
    >
      <div className="relative flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <img
            src={logo}
            alt="Middlemist Flower"
            className="h-20 w-auto object-contain md:h-24 lg:h-28 relative z-10"
          />
          <svg
            className="absolute"
            style={{
              width: "calc(100% + 6rem)",
              height: "calc(100% + 6rem)",
              animation: "rotate 2s linear infinite",
            }}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--gold)"
              strokeWidth="2"
              strokeOpacity="0.2"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--gold-bright)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="70 200"
              style={{
                animation: "dash 1.5s ease-in-out infinite",
              }}
            />
          </svg>
        </div>
      </div>
      <style>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes dash {
          0% {
            strokeDasharray: 1 200;
            strokeDashoffset: 0;
          }
          50% {
            strokeDasharray: 89 200;
            strokeDashoffset: -35;
          }
          100% {
            strokeDasharray: 89 200;
            strokeDashoffset: -124;
          }
        }
      `}</style>
    </div>
  );
}
