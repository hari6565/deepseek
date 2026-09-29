export const getCdnImage = (imageUrl: string) => {
  const cdnBase = process.env.NEXT_PUBLIC_FTP_OUTPUT_HOST || "";
  if (!imageUrl) return "";
 
  const cleanBase = cdnBase.replace(/\/$/, ""); // remove trailing slash
 
  try {
    // If full URL → extract the path
    const urlObj = new URL(imageUrl);
    return `${cleanBase}${urlObj.pathname}`;
  } catch (err) {
    // If already relative path → attach to CDN
    return `${cleanBase}/${imageUrl.replace(/^\//, "")}`;
  }
};