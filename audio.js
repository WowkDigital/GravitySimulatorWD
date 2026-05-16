/**
 * GravityAudio - Sound Synthesis and Music Management for Gravity Simulation
 * Designed to be modular and optional.
 */
class GravityAudio {
    constructor(config) {
        this.config = config || {
            DEFAULT_MUSIC_VOL: 0.1,
            DEFAULT_SFX_VOL: 0.7,
            ZOOM_ATTENUATION: 0.5
        };
        this.ctx = null;
        this.masterGain = null;
        this.isInitialized = false;

        // Music state
        this.bgMusic = null;
        this.bgMusicSource = null;
        this.musicGain = null;

        // Ambient state
        this.isAmbientRunning = false;
        this.sizzleSource = null;
        this.sizzleGain = null;
        this.whooshSource = null;
        this.whooshGain = null;
        this.whooshFilter = null;

        // User preference
        this.proximityHissEnabled = false;
    }

    initialize(sfxEnabled, initialSfxVol, musicEnabled, initialMusicVol) {
        if (this.isInitialized) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                console.warn("AudioContext not supported in this browser.");
                return;
            }

            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = sfxEnabled ? (initialSfxVol || this.config.DEFAULT_SFX_VOL) : 0;
            this.masterGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.connect(this.ctx.destination);

            this.isInitialized = true;
            console.log("GravityAudio initialized.");

            // Explicitly resume context as initialize is called from a user gesture
            this.ctx.resume().then(() => {
                this._startAmbientSounds();
                if (musicEnabled) {
                    this.startMusic(initialMusicVol);
                }
            });
        } catch (e) {
            console.error("GravityAudio initialization failed:", e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    time() {
        return this.ctx ? this.ctx.currentTime : 0;
    }

    setMasterVolume(val) {
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(val, this.time(), 0.1);
        }
    }

    setMusicVolume(val) {
        if (this.bgMusic) {
            this.bgMusic.volume = val;
        }
    }

    _startAmbientSounds() {
        if (!this.isInitialized || this.isAmbientRunning) return;

        // Sizzle (Star Proximity)
        const sizzleBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
        const sizzleData = sizzleBuffer.getChannelData(0);
        for (let i = 0; i < sizzleData.length; i++) sizzleData[i] = Math.random() * 2 - 1;

        this.sizzleSource = this.ctx.createBufferSource();
        this.sizzleSource.buffer = sizzleBuffer;
        this.sizzleSource.loop = true;

        const sizzleFilter = this.ctx.createBiquadFilter();
        sizzleFilter.type = 'highpass';
        sizzleFilter.frequency.value = 6000;

        this.sizzleGain = this.ctx.createGain();
        this.sizzleGain.gain.value = 0;

        this.sizzleSource.connect(sizzleFilter);
        sizzleFilter.connect(this.sizzleGain);
        this.sizzleGain.connect(this.masterGain);
        this.sizzleSource.start();

        // Whoosh (Planet Speed)
        const whooshBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
        const whooshData = whooshBuffer.getChannelData(0);
        for (let i = 0; i < whooshData.length; i++) whooshData[i] = Math.random() * 2 - 1;

        this.whooshSource = this.ctx.createBufferSource();
        this.whooshSource.buffer = whooshBuffer;
        this.whooshSource.loop = true;

        this.whooshFilter = this.ctx.createBiquadFilter();
        this.whooshFilter.type = 'lowpass';
        this.whooshFilter.frequency.value = 400;

        this.whooshGain = this.ctx.createGain();
        this.whooshGain.gain.value = 0;

        this.whooshSource.connect(this.whooshFilter);
        this.whooshFilter.connect(this.whooshGain);
        this.whooshGain.connect(this.masterGain);
        this.whooshSource.start();

        this.isAmbientRunning = true;
    }

    updateAmbient(sim, viewport, scale, attenuation) {
        if (!this.isAmbientRunning) return;

        let maxProximityIntensity = 0;
        let maxSpeedIntensity = 0;
        const thresholdProximity = 400;
        const maxSpeedRef = 600;

        const isVisible = (x, y, r) => {
            return x + r > viewport.left && x - r < viewport.right &&
                y + r > viewport.top && y - r < viewport.bottom;
        };

        sim.planets.forEach(p => {
            if (p.isDebris) return;
            const planetInView = isVisible(p.x, p.y, p.radius);

            // Proximity Hiss
            if (this.proximityHissEnabled) {
                sim.stars.forEach(s => {
                    const starInView = isVisible(s.x, s.y, s.radius);
                    if (!planetInView && !starInView) return;

                    const dx = p.x - s.x;
                    const dy = p.y - s.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const intensity = Math.max(0, 1 - (dist - s.radius) / thresholdProximity);
                    if (intensity > maxProximityIntensity) maxProximityIntensity = intensity;
                });
            }

            // Whoosh SFX
            if (planetInView) {
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                const intensity = Math.min(1, speed / maxSpeedRef);
                if (intensity > maxSpeedIntensity) maxSpeedIntensity = intensity;
            }
        });

        const t = this.time();
        const zoomVolFactor = Math.min(1.0, Math.pow(scale, attenuation));

        const crackle = 0.1 + Math.random() * 0.6;
        this.sizzleGain.gain.setTargetAtTime(maxProximityIntensity * 0.25 * crackle * zoomVolFactor, t, 0.1);

        this.whooshGain.gain.setTargetAtTime(maxSpeedIntensity * 0.2 * zoomVolFactor, t, 0.1);
        if (this.whooshFilter) {
            this.whooshFilter.frequency.setTargetAtTime(300 + maxSpeedIntensity * 1500, t, 0.1);
        }
    }

    playLaunch(zoomVolFactor) {
        if (!this.isInitialized) return;
        const t = this.time();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.3);
        gain.gain.setValueAtTime(0.3 * zoomVolFactor, t);
        gain.gain.exponentialRampToValueAtTime(0.01 * zoomVolFactor, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
    }

    playCollision(zoomVolFactor) {
        if (!this.isInitialized) return;
        const t = this.time();
        const bufferSize = this.ctx.sampleRate * 0.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.exponentialRampToValueAtTime(100, t + 0.4);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        noiseGain.gain.setValueAtTime(0.5 * zoomVolFactor, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01 * zoomVolFactor, t + 0.5);
        noise.start(t);
    }

    playTargetHit(zoomVolFactor) {
        if (!this.isInitialized) return;
        const t = this.time();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, t); // C5
        osc.frequency.setValueAtTime(659.25, t + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, t + 0.2); // G5 
        gain.gain.setValueAtTime(0.1 * zoomVolFactor, t);
        gain.gain.linearRampToValueAtTime(0.4 * zoomVolFactor, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01 * zoomVolFactor, t + 0.6);
        osc.start(t);
        osc.stop(t + 0.6);
    }

    playStarBurn(zoomVolFactor) {
        if (!this.isInitialized) return;
        const t = this.time();
        const bufferSize = this.ctx.sampleRate * 0.8;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(4000, t);
        filter.frequency.exponentialRampToValueAtTime(1000, t + 0.3);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        noiseGain.gain.setValueAtTime(0.6 * zoomVolFactor, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01 * zoomVolFactor, t + 0.3);
        noise.start(t);
    }

    setProximityHissEnabled(enabled) {
        this.proximityHissEnabled = enabled;
    }

    startMusic(volume = 0.1) {
        if (!this.isInitialized) return;

        if (!this.bgMusic) {
            this.bgMusic = new Audio('soundtrack.mp3');
            this.bgMusic.loop = true;
            // Bypassing MediaElementSource to avoid CORS issues on local files
        }

        this.setMusicVolume(volume);

        if (this.bgMusic.paused) {
            this.bgMusic.play().catch(e => console.warn("Music play blocked:", e));
        }
    }

    stopMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause();
        }
    }
}
