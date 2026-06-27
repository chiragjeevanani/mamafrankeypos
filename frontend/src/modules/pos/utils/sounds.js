/**
 * Professional Sound Utility for POS
 * Uses AudioContext to generate sounds dynamically without external assets.
 */

let audioCtx = null;

const initAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
};

/**
 * Plays a short, high-quality 'bloop' click sound.
 */
export const playClickSound = () => {
  // Sound disabled per client request
};
