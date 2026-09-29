"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Theme, Language, Direction, GlobalProps, Branding, Typography } from "@/types/global";
import { getCookie, setCookie } from "@/app/components/cookieMgment";

interface GlobalContextType extends GlobalProps {
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setDirection: (direction: Direction) => void;
  setBranding: (branding: Branding) => void;
  updateBranding: (updates: Partial<Branding>) => void;
  setTypography: (typography: Typography) => void;
  updateTypography: (updates: Partial<Typography>) => void;
  appBackgroundImage: string | undefined;
  setAppBackgroundImage: (image: string | undefined) => void;
  setDisplayFormat:(data:any)=>void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode , tokenParam:string }> = ({
  children,
  tokenParam
}) => {
  // Initialize theme from cookie or default to "light"
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = getCookie('cfg_theme');
    return (savedTheme as Theme) || "light";
  });

  const [language, setLanguage] = useState<Language>("English");
  const [token , setToken] = useState(tokenParam);

  // Initialize direction from cookie or default to "LTR"
  const [direction, setDirectionState] = useState<Direction>(() => {
    const savedDirection = getCookie('cfg_direction');
    return (savedDirection as Direction) || "LTR";
  });
  const [displayFormat,setDisplayFormat] = useState<any>({
    datePickerProperty:{
      dateDisplayFormat: "DD-MM-YYYY",
    },
    textInputProperty:{
      currencyDisplayFormat: "₹",
      decimal_places:3
    },
    timePickerProperty:{
       timeDisplayFormat: "HH:mm",
    }
  });
  const [branding, setBrandingState] = useState<Branding>({
    fontSize: "Medium",
    brandColor: "#00BFFF",
    selectionColor: "#00BFFF",
    hoverColor: "#00BFFF",
    borderRadius: "s",
  });

  const [typography, setTypographyState] = useState<Typography>({
    bodyFont: "Roboto",
    headerFont: "Roboto",
    displayFont: "Roboto",
  });
  const [appBackgroundImage, setAppBackgroundImage] = useState<string | undefined>(undefined);

  // Wrapper to save theme to cookie when it changes
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setCookie('cfg_theme', newTheme, 365);
  };

  // Wrapper to save direction to cookie when it changes
  const setDirection = (newDirection: Direction) => {
    setDirectionState(newDirection);
    setCookie('cfg_direction', newDirection, 365);
  };

  const setBranding = (newBranding: Branding) => {
    setBrandingState(newBranding);
  };

  const updateBranding = (updates: Partial<Branding>) => {
    setBrandingState((prev) => ({ ...prev, ...updates }));
  };

  const setTypography = (newTypography: Typography) => {
    setTypographyState(newTypography);
  };

  const updateTypography = (updates: Partial<Typography>) => {
    setTypographyState((prev) => ({ ...prev, ...updates }));
  };

  // Apply direction to document element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.dir = direction.toLowerCase();
    }
    if(token != tokenParam){
      setToken(tokenParam)
    }
  }, [direction , tokenParam]);

  return (
    <GlobalContext.Provider
      value={{
        token,
        theme,
        language,
        direction,
        branding,
        typography,
        appBackgroundImage,
        displayFormat,
        setTheme,
        setLanguage,
        setDirection,
        setBranding,
        updateBranding,
        setTypography,
        updateTypography,
        setAppBackgroundImage,
        setDisplayFormat,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
};
 