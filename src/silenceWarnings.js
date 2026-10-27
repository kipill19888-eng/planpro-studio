// src/silenceWarnings.js
const originalWarn = console.warn;
console.warn = (...args) => {
  const first = args[0];
  if (
    typeof first === 'string' &&
    (first.includes('THREE.Clock') || first.includes('PCFSoftShadowMap'))
  ) {
    return;
  }
  originalWarn(...args);
};