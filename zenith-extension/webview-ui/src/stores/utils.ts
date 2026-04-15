const toCamelCase = (str: string) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

/**
 * Normalize a CSSStyleDeclaration-like object to camelCase string values.
 * 
 * A-4 Fix: Removed the ${key}Numeric shadow keys that were polluting computedStyles
 * with non-CSS properties (e.g. "widthNumeric: 100"). These leaked into iframe
 * style patches and the sidecar batch payload, causing silent failures.
 * 
 * If numeric values are needed by Inspector components, parse them at point of use
 * via parseFloat(), rather than storing them in the shared styles record.
 */
export const normalizeStyles = (styles: Record<string, string>): Record<string, string> => {
  const normalized: Record<string, string> = {};
  Object.entries(styles).forEach(([key, val]) => {
    const camelKey = toCamelCase(key);
    normalized[camelKey] = val;
  });
  return normalized;
};
