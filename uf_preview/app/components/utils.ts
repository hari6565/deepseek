import _ from "lodash";


export function isLightColor(hex:string) {
  hex = hex.replace("#", "");
  // Ensure valid 6-character hex format
  if (hex.length === 3) {
    hex = hex.split("").map((char) => char + char).join(""); // Convert shorthand (e.g., #abc) to full hex
  }
  if (hex.length !== 6) {
    throw new Error("Invalid HEX color format");
  }
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  // Calculate relative luminance (per WCAG standard)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // If dark (luminance <= 0.5), return white (#fff), else return black (#000)
  return luminance <= 0.5 ? "#fff" : "#000";
}

export function hexWithOpacity(hex: string, opacity: number) {
  // Ensure opacity is between 0 and 1
  opacity = Math.round(opacity * 255);

  // Remove the hash if present
  hex = hex.replace("#", "");

  // Ensure the hex code is valid
  if (hex.length !== 6) {
    throw new Error("Invalid hex color");
  }

  // Convert the opacity to a 2-character hex string
  let alpha = opacity.toString(16).padStart(2, "0").toUpperCase();

  // Return the original hex color with appended alpha value
  return `#${hex}${alpha}`;
}

export const logout = () => {
  localStorage.clear();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const from = encodeURIComponent(`${basePath}/`);
  window.location.href = `${basePath}/next-api/auth/logout?from=${from}`;
};