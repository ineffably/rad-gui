/**
 * This file provides a fallback for CSS_CONTENT when not defined by webpack.
 * It's primarily used to support testing environments.
 */

// Default minimal CSS to use in tests when webpack doesn't provide CSS_CONTENT
export const DEFAULT_CSS_CONTENT = `.rad-gui { display: block; }`;

// Exported for test environments to access directly
export default DEFAULT_CSS_CONTENT; 