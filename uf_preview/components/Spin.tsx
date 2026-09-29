"use client";

import React from "react";

export type SpinSize = "xs" | "s" | "m" | "l" | "xl";
export type SpinStyle = "circular" | "dots" | "bars" | "pulse" | "ring";
export type SpinColor = "primary" | "secondary" | "success" | "warning" | "error" | "info";

interface SpinProps {
  /** Size of the spinner */
  size?: SpinSize;
  /** Style/type of the spinner */
  style?: SpinStyle;
  /** Color theme of the spinner */
  color?: SpinColor;
  /** Custom className */
  className?: string;
  /** Whether to show loading text */
  showText?: boolean;
  /** Custom loading text */
  text?: string;
  /** Whether spinner is visible */
  spinning?: boolean;
  /** Children to wrap (will show overlay when spinning) */
  children?: React.ReactNode;
  /** Custom styles */
  customStyle?: React.CSSProperties;
  /** Speed of animation (in seconds) */
  speed?: number;
}

const sizeMap = {
  xs: "w-3 h-3",
  s: "w-4 h-4", 
  m: "w-6 h-6",
  l: "w-8 h-8",
  xl: "w-12 h-12"
};

const textSizeMap = {
  xs: "text-xs",
  s: "text-sm",
  m: "text-base", 
  l: "text-lg",
  xl: "text-xl"
};

const colorMap = {
  primary: "text-blue-600 border-blue-600",
  secondary: "text-gray-600 border-gray-600",
  success: "text-green-600 border-green-600", 
  warning: "text-yellow-600 border-yellow-600",
  error: "text-red-600 border-red-600",
  info: "text-cyan-600 border-cyan-600"
};

// Circular spinner component
const CircularSpinner: React.FC<{ size: SpinSize; color: SpinColor; speed: number }> = ({ 
  size, 
  color, 
  speed 
}) => (
  <div 
    className={`${sizeMap[size]} ${colorMap[color]} border-2 border-t-transparent rounded-full animate-spin`}
    style={{ animationDuration: `${speed}s` }}
  />
);

// Dots spinner component  
const DotsSpinner: React.FC<{ size: SpinSize; color: SpinColor; speed: number }> = ({ 
  size, 
  color, 
  speed 
}) => {
  const dotSize = {
    xs: "w-1 h-1",
    s: "w-1.5 h-1.5",
    m: "w-2 h-2", 
    l: "w-2.5 h-2.5",
    xl: "w-3 h-3"
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${dotSize[size]} ${colorMap[color]} bg-current rounded-full animate-pulse`}
          style={{ 
            animationDelay: `${i * 0.2}s`,
            animationDuration: `${speed}s` 
          }}
        />
      ))}
    </div>
  );
};

// Bars spinner component
const BarsSpinner: React.FC<{ size: SpinSize; color: SpinColor; speed: number }> = ({ 
  size, 
  color, 
  speed 
}) => {
  const barHeight = {
    xs: "h-3",
    s: "h-4", 
    m: "h-6",
    l: "h-8", 
    xl: "h-12"
  };

  const barWidth = {
    xs: "w-0.5",
    s: "w-1",
    m: "w-1", 
    l: "w-1.5",
    xl: "w-2"
  };

  return (
    <div className="flex space-x-1 items-end">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`${barWidth[size]} ${barHeight[size]} ${colorMap[color]} bg-current animate-pulse`}
          style={{ 
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${speed}s`,
            transformOrigin: 'bottom'
          }}
        />
      ))}
    </div>
  );
};

// Pulse spinner component
const PulseSpinner: React.FC<{ size: SpinSize; color: SpinColor; speed: number }> = ({ 
  size, 
  color, 
  speed 
}) => (
  <div 
    className={`${sizeMap[size]} ${colorMap[color]} bg-current rounded-full animate-ping`}
    style={{ animationDuration: `${speed}s` }}
  />
);

// Ring spinner component
const RingSpinner: React.FC<{ size: SpinSize; color: SpinColor; speed: number }> = ({ 
  size, 
  color, 
  speed 
}) => (
  <div className="relative">
    <div className={`${sizeMap[size]} ${colorMap[color]} border-2 border-current opacity-25 rounded-full`} />
    <div 
      className={`${sizeMap[size]} ${colorMap[color]} border-2 border-t-transparent border-current rounded-full animate-spin absolute top-0 left-0`}
      style={{ animationDuration: `${speed}s` }}
    />
  </div>
);

const spinnerComponents = {
  circular: CircularSpinner,
  dots: DotsSpinner,
  bars: BarsSpinner,
  pulse: PulseSpinner,
  ring: RingSpinner
};

export const Spin: React.FC<SpinProps> = ({
  size = "m",
  style = "circular",
  color = "primary",
  className = "",
  showText = false,
  text = "Loading...",
  spinning = true,
  children,
  customStyle,
  speed = 1
}) => {
  const SpinnerComponent = spinnerComponents[style];

  // If no children, render just the spinner
  if (!children) {
    return (
      <div 
        className={`flex flex-col items-center justify-center space-y-2 ${className}`}
        style={customStyle}
      >
        {spinning && <SpinnerComponent size={size} color={color} speed={speed} />}
        {showText && spinning && (
          <span className={`${textSizeMap[size]} ${colorMap[color]} font-medium`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // If children exist, render overlay spinner
  return (
    <div className={`relative ${className}`} style={customStyle}>
      {children}
      {spinning && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex flex-col items-center justify-center space-y-2 z-50 rounded-lg">
          <SpinnerComponent size={size} color={color} speed={speed} />
          {showText && (
            <span className={`${textSizeMap[size]} ${colorMap[color]} font-medium`}>
              {text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Hook for managing loading states
export const useSpin = (initialLoading = false) => {
  const [loading, setLoading] = React.useState(initialLoading);

  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);
  const toggleLoading = () => setLoading(prev => !prev);

  return {
    loading,
    startLoading,
    stopLoading,
    toggleLoading,
    setLoading
  };
};

// Predefined spinner variants for common use cases
export const SpinVariants = {
  // Small inline spinner
  inline: (props?: Partial<SpinProps>) => (
    <Spin size="s" style="circular" {...props} />
  ),
  
  // Page loading overlay
  pageLoader: (props?: Partial<SpinProps>) => (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50">
      <Spin size="xl" showText text="Loading page..." {...props} />
    </div>
  ),
  
  // Button loading state
  buttonLoader: (props?: Partial<SpinProps>) => (
    <Spin size="s" style="circular" color="secondary" {...props} />
  ),
  
  // Card loading state
  cardLoader: (props?: Partial<SpinProps>) => (
    <Spin size="m" showText text="Loading content..." {...props} />
  )
};

export default Spin;