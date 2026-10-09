// Deep path some CommonJS code uses to reach the bundle directly.
const { GUI } = require('rad-gui/lib/index.js');
window.__coldstart = { deep: typeof GUI };
