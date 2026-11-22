window.AudioSys = (function() {
  let ctx = null;
  let muted = false;
  let engineOsc = null;
  let engineGain = null;

  function init() {
    if (ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioContext();
    } catch(e) {
      console.warn("WebAudio not supported", e);
    }
  }

  function toggleMute() {
    muted = !muted;
    if (ctx && ctx.state === 'suspended' && !muted) {
      ctx.resume();
    }
    if (engineGain && ctx) {
      engineGain.gain.setValueAtTime(muted ? 0 : 0.05, ctx.currentTime);
    }
    return muted;
  }

  function startEngine() {
    if (!ctx || muted) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (!engineOsc) {
      try {
        engineOsc = ctx.createOscillator();
        engineGain = ctx.createGain();
        engineOsc.type = 'sawtooth';
        engineOsc.frequency.setValueAtTime(60, ctx.currentTime);
        engineGain.gain.setValueAtTime(0.02, ctx.currentTime);
        engineOsc.connect(engineGain);
        engineGain.connect(ctx.destination);
        engineOsc.start();
      } catch(e) {}
    }
  }

  function updateEngine(speed, isDriving) {
    if (!engineOsc || !ctx || muted) return;
    if (!isDriving) {
      engineGain.gain.setValueAtTime(0, ctx.currentTime);
      return;
    }
    const freq = 50 + Math.min(Math.abs(speed) * 8, 250);
    engineOsc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.1);
    engineGain.gain.setTargetAtTime(0.04, ctx.currentTime, 0.1);
  }

  function stopEngine() {
    if (engineGain && ctx) {
      engineGain.gain.setValueAtTime(0, ctx.currentTime);
    }
  }

  function playCrash() {
    if (!ctx || muted) return;
    if (ctx.state === 'suspended') ctx.resume();
    try {
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.24);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch(e) {}
  }

  function playPickup() {
    if (!ctx || muted) return;
    if (ctx.state === 'suspended') ctx.resume();
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch(e) {}
  }

  function playSiren() {
    if (!ctx || muted) return;
    if (ctx.state === 'suspended') ctx.resume();
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.3);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch(e) {}
  }

  return {
    init,
    toggleMute,
    startEngine,
    updateEngine,
    stopEngine,
    playCrash,
    playPickup,
    playSiren,
    isMuted: () => muted
  };
})();
