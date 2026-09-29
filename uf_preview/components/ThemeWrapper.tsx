"use client";

import { useEffect, ReactNode } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useGlobal } from "@/context/GlobalContext";

interface ThemeWrapperProps {
  children: ReactNode;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  const { theme, isDark, isHighContrast, bgStyle, textStyle } = useTheme();
  const { appBackgroundImage } = useGlobal();

  useEffect(() => {
    console.log('ThemeWrapper - Current theme:', theme);

    // Apply theme class to document element
    const root = document.documentElement;

    // Remove all theme classes first
    root.classList.remove("light", "dark", "light-hc", "dark-hc");

    // Add current theme class
    root.classList.add(theme);
    console.log('ThemeWrapper - Applied theme class:', theme);

    // Apply background color based on theme
    root.style.backgroundColor = bgStyle;
    root.style.color = textStyle;

    if (appBackgroundImage) {
      console.log('ThemeWrapper - Applying background image:', appBackgroundImage);
      root.style.setProperty('--app-bg-image', `url(${appBackgroundImage})`);
      document.body.style.backgroundImage = `url(${appBackgroundImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      root.style.setProperty('--app-bg-image', 'none');
      document.body.style.backgroundImage = 'none';
    }

    // Apply high contrast styles
    if (isHighContrast) {
      root.style.fontWeight = "500";
      console.log('ThemeWrapper - High contrast mode enabled');
    } else {
      root.style.fontWeight = "normal";
    }
  }, [theme, isDark, isHighContrast, bgStyle, textStyle, appBackgroundImage]);

  return <>{children}</>;
};