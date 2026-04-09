const toCamelCase = (str: string) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

export const normalizeStyles = (styles: Record<string, string>) => {
  const normalized: Record<string, any> = {};
  Object.entries(styles).forEach(([key, val]) => {
    const camelKey = toCamelCase(key);
    normalized[camelKey] = val;
    
    // v12.1 Refinement: Parse numeric fallbacks for Inspector (Problem 3)
    if (typeof val === 'string' && /^-?\d+(\.\d+)?(px|rem|em|%)?$/.test(val)) {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        normalized[`${camelKey}Numeric`] = num;
      }
    }
  });
  return normalized;
};
