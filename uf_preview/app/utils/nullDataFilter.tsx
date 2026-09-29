'use client'

// Helper function for recursive filtering
const recursiveNullFilter = (data: any): any => {
  // Handle null, undefined, or empty string
  if (data === undefined || data === null || data === '') {
    return undefined;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    const filteredArray = data
      .map((item) => recursiveNullFilter(item))
      .filter((item) => item !== undefined && (typeof item !== 'object' || Object.keys(item).length > 0));
    return filteredArray.length > 0 ? filteredArray : undefined;
  }

  // Handle File/Blob instances - return as-is so native properties are preserved
  if ((typeof File !== 'undefined' && data instanceof File) ||
      (typeof Blob !== 'undefined' && data instanceof Blob)) {
    return data;
  }

  // Handle objects
  if (typeof data === 'object') {
    const filteredData: any = {};
    Object.keys(data).forEach((key) => {
      const filteredValue = recursiveNullFilter(data[key]);
      if (filteredValue !== undefined) {
        filteredData[key] = filteredValue;
      }
    });

    // Return object (even if empty for nested objects, but filter will handle it)
    return filteredData;
  }

  // Return primitive values as-is
  return data;
};

export const nullFilter = (data: any): any => {
  // Handle top-level null or undefined
  if (data === undefined || data === null) {
    return {};
  }

  // Handle arrays at top level
  if (Array.isArray(data)) {
    const result = recursiveNullFilter(data);
    return result !== undefined ? result : [];
  }

  // Handle objects at top level
  if (typeof data === 'object' && Object.keys(data).length === 0) {
    return {};
  }

  const result = recursiveNullFilter(data);

  // Return appropriate type based on input
  if (Array.isArray(data)) {
    return result !== undefined ? result : [];
  }

  return result && typeof result === 'object' && !Array.isArray(result) ? result : {};
};
