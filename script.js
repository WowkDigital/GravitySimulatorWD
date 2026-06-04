const VIEW_CONFIG = {
    VELOCITY_SCALE: 1,
    ZOOM: {
        MIN: 0.1,
        MAX: 10.0,
        SENSITIVITY: 1.1
    },
    STARFIELD: {
        COUNT: 400,
        DEPTH_FACTOR: 0.05
    },
    VISUALS: {
        VECTOR_SCALE: 0.05,
        ARROW_SIZE: 5,
        PREDICTION_DASH: [2, 3],
        INTERACTION_DASH: [5, 5]
    },
    AUDIO: {
        DEFAULT_MUSIC_VOL: 0.1,
        DEFAULT_SFX_VOL: 0.7,
        ZOOM_ATTENUATION: 0.5
    },
    KEYBOARD_SPEED: 12
};

document.addEventListener('DOMContentLoaded', () => {

    // --- Element References ---
    const canvas = document.getElementById('simulationCanvas');
    if (!canvas) {
        console.error("FATAL: Canvas not found!");
        alert("Critical error: Canvas!");
        return;
    }
    const ctx = canvas.getContext('2d');
    const controlsDiv = document.getElementById('controls');
    const toggleControlsBtn = document.getElementById('toggleControls');
    const speedLabel = document.getElementById('speedLabel');
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    const starOptionsDiv = document.getElementById('starOptions');
    const starMassRange = document.getElementById('starMassRange');
    const starMassValueSpan = document.getElementById('starMassValue');
    // Generator UI Refs
    const generatorOptionsDiv = document.getElementById('generatorOptions');
    const spawnIntervalRange = document.getElementById('spawnIntervalRange');
    const spawnIntervalValueSpan = document.getElementById('spawnIntervalValue');
    const stableOrbitCheckbox = document.getElementById('stableOrbitCheckbox');
    const clearGeneratorsButton = document.getElementById('clearGeneratorsButton');
    const generatorLaunchSpeedRange = document.getElementById('generatorLaunchSpeedRange');
    const generatorLaunchSpeedValueSpan = document.getElementById('generatorLaunchSpeedValue');
    const generatorLaunchAngleRange = document.getElementById('generatorLaunchAngleRange');
    const generatorLaunchAngleValueSpan = document.getElementById('generatorLaunchAngleValue');
    const generatorLimitInput = document.getElementById('generatorLimitInput');
    const generatorLimitDecrementBtn = document.getElementById('generatorLimitDecrement');
    const generatorLimitIncrementBtn = document.getElementById('generatorLimitIncrement');
    const generatorPhysicsOptionsDiv = document.getElementById('generatorPhysicsOptions');

    const scoreElement = document.getElementById('score');
    const gConstantRange = document.getElementById('gConstantRange');
    const gConstantValueSpan = document.getElementById('gConstantValue');
    const interactionRangeRange = document.getElementById('interactionRangeRange');
    const interactionRangeValueSpan = document.getElementById('interactionRangeValue');
    const trailLengthRange = document.getElementById('trailLengthRange');
    const trailLengthValueSpan = document.getElementById('trailLengthValue');
    const debrisCountInput = document.getElementById('debrisCountInput');
    const debrisDecrementBtn = document.getElementById('debrisDecrement');
    const debrisIncrementBtn = document.getElementById('debrisIncrement');
    const resetButton = document.getElementById('resetButton');
    const pauseButton = document.getElementById('pauseButton');
    const clearPlanetsButton = document.getElementById('clearPlanetsButton');
    const clearStarsButton = document.getElementById('clearStarsButton');
    const infoElement = document.getElementById('info');
    const showForceVectorsCheckbox = document.getElementById('showForceVectors');
    const showEnergyPredictionCheckbox = document.getElementById('showEnergyPrediction');
    const showPredictionCheckbox = document.getElementById('showPrediction');
    const predictionTimeRange = document.getElementById('predictionTimeRange');
    const predictionTimeValueSpan = document.getElementById('predictionTimeValue');
    const showOngoingPredictionCheckbox = document.getElementById('showOngoingPrediction');
    const showCollisionWarningCheckbox = document.getElementById('showCollisionWarning');
    const showInteractionRangeCheckbox = document.getElementById('showInteractionRange');
    const showPlanetParticlesCheckbox = document.getElementById('showPlanetParticles');
    const showBoundaryCheckbox = document.getElementById('showBoundary');
    const showGridCheckbox = document.getElementById('showGrid');
    const toggleContainmentCheckbox = document.getElementById('toggleContainment');
    const jp2ModeCheckbox = document.getElementById('jp2Mode');
    const activeCounterElement = document.getElementById('activeCounter');
    const trackingModeCheckbox = document.getElementById('trackingModeCheckbox');
    const trackedPlanetSelect = document.getElementById('trackedPlanetSelect');
    const trackingInfoDiv = document.getElementById('trackingInfo');
    const trackIdSpan = document.getElementById('track-id');
    const trackSpeedSpan = document.getElementById('track-speed');
    const trackMassSpan = document.getElementById('track-mass');
    const trackVxSpan = document.getElementById('track-vx');
    const trackVySpan = document.getElementById('track-vy');

    const toggleMusicCheckbox = document.getElementById('toggleMusic');
    const toggleSfxCheckbox = document.getElementById('toggleSfx');
    const musicVolumeSlider = document.getElementById('musicVolume');
    const sfxVolumeSlider = document.getElementById('sfxVolume');
    const zoomAttenuationSlider = document.getElementById('zoomAttenuation');
    const zoomAttenuationValueSpan = document.getElementById('zoomAttenuationValue');
    const toggleProximityHissCheckbox = document.getElementById('toggleProximityHiss');
    const collisionModeRadios = document.querySelectorAll('input[name="collisionMode"]');
    const mergeOptionsDiv = document.getElementById('mergeOptions');
    const disableWorldBoundaryCheckbox = document.getElementById('disableWorldBoundary');
    const noPlanetMergeMassLimitCheckbox = document.getElementById('noPlanetMergeMassLimit');
    const disableMassDecayCheckbox = document.getElementById('disableMassDecay');
    const disablePlanetCollisionsCheckbox = document.getElementById('disablePlanetCollisions');
    const dynamicStarsCheckbox = document.getElementById('dynamicStars');

    // --- Simulation Instance ---
    const sim = new GravitySimulation();

    // Sync initial states from HTML to Simulation instance
    if (disableWorldBoundaryCheckbox) {
        sim.disableWorldBoundary = disableWorldBoundaryCheckbox.checked;
    }
    if (noPlanetMergeMassLimitCheckbox) {
        sim.noPlanetMergeMassLimit = noPlanetMergeMassLimitCheckbox.checked;
    }
    if (disableMassDecayCheckbox) {
        sim.disableMassDecay = disableMassDecayCheckbox.checked;
    }
    if (disablePlanetCollisionsCheckbox) {
        sim.disablePlanetCollisions = disablePlanetCollisionsCheckbox.checked;
    }
    if (dynamicStarsCheckbox) {
        sim.dynamicStars = dynamicStarsCheckbox.checked;
    }
    if (jp2ModeCheckbox) {
        sim.jp2Mode = jp2ModeCheckbox.checked;
    }
    if (interactionRangeRange) {
        sim.planetInteractionRange = parseInt(interactionRangeRange.value);
    }
    const checkedCollisionMode = document.querySelector('input[name="collisionMode"]:checked');
    if (checkedCollisionMode) {
        sim.collisionMode = checkedCollisionMode.value;
        if (mergeOptionsDiv) {
            mergeOptionsDiv.classList.toggle('hidden', sim.collisionMode !== 'merge');
        }
    }

    // --- Audio Setup (External Class) ---
    let audioManager = null;
    if (typeof GravityAudio !== 'undefined') {
        audioManager = new GravityAudio(VIEW_CONFIG.AUDIO);
    } else {
        console.warn("Audio system (audio.js) not found. Simulation will run silently.");
    }

    function initAudio() {
        if (!audioManager || audioManager.isInitialized) return;
        audioManager.initialize(
            toggleSfxCheckbox.checked,
            parseFloat(sfxVolumeSlider.value),
            toggleMusicCheckbox.checked,
            parseFloat(musicVolumeSlider.value)
        );
        if (toggleProximityHissCheckbox) {
            audioManager.setProximityHissEnabled(toggleProximityHissCheckbox.checked);
        }
    }

    function updateAmbientSounds() {
        if (!audioManager || !audioManager.isAmbientRunning) return;

        // Viewport bounds in world coordinates for culling sound
        const viewTopLeft = screenToWorld(0, 0);
        const viewBottomRight = screenToWorld(canvas.width, canvas.height);
        const viewport = {
            top: viewTopLeft.y,
            left: viewTopLeft.x,
            bottom: viewBottomRight.y,
            right: viewBottomRight.x
        };

        const attenuation = zoomAttenuationSlider ? parseFloat(zoomAttenuationSlider.value) : 0.5;
        audioManager.updateAmbient(sim, viewport, scale, attenuation);
    }

    function getZoomVolFactor() {
        if (!zoomAttenuationSlider) return 1.0;
        const attenuation = parseFloat(zoomAttenuationSlider.value);
        return Math.min(1.0, Math.pow(scale, attenuation));
    }

    function playLaunchSynth() {
        if (audioManager) audioManager.playLaunch(getZoomVolFactor());
    }

    function playCollisionSynth() {
        if (audioManager) audioManager.playCollision(getZoomVolFactor());
    }

    function playTargetHitSynth() {
        if (audioManager) audioManager.playTargetHit(getZoomVolFactor());
    }

    function startDroneMusic() {
        if (audioManager) {
            const musicVol = musicVolumeSlider ? parseFloat(musicVolumeSlider.value) : 0.2;
            audioManager.startMusic(musicVol);
        }
    }

    function playStarBurnSynth() {
        if (audioManager) audioManager.playStarBurn(getZoomVolFactor());
    }

    function playErasureSynth() {
        if (audioManager) audioManager.playErasure(getZoomVolFactor());
    }

    function stopDroneMusic() {
        if (audioManager) audioManager.stopMusic();
    }

    function handleFirstInteraction() {
        if (!audioManager) return;
        if (!audioManager.isInitialized) {
            initAudio();
        } else {
            audioManager.resume();
        }
    }

    function playBackgroundMusic() { startDroneMusic(); }
    function pauseBackgroundMusic() { stopDroneMusic(); }

    // --- Audio Callbacks from Simulation ---
    sim.callbacks.onCollision = () => { if (toggleSfxCheckbox.checked) playCollisionSynth(); };
    sim.callbacks.onTargetHit = () => {
        if (toggleSfxCheckbox.checked) playTargetHitSynth();
        scoreElement.textContent = `Score: ${sim.score}`;
    };
    sim.callbacks.onPlanetSpawn = () => { if (toggleSfxCheckbox.checked) playLaunchSynth(); };
    sim.callbacks.onStarCollision = () => { if (toggleSfxCheckbox.checked) playStarBurnSynth(); };
    sim.callbacks.onErasure = () => { if (toggleSfxCheckbox.checked) playErasureSynth(); };

    if (toggleProximityHissCheckbox) {
        toggleProximityHissCheckbox.addEventListener('change', (e) => {
            if (audioManager) audioManager.setProximityHissEnabled(e.target.checked);
        });
    }

    if (showGridCheckbox) {
        showGridCheckbox.addEventListener('change', (e) => {
            showGrid = e.target.checked;
        });
    }

    // --- Texture Management ---
    const planetsSpritesheet = new Image();
    planetsSpritesheet.src = 'textures/planets_spritesheet.png';
    planetsSpritesheet.onload = () => { planetsSpritesheet.isLoaded = true; };

    const kremowkaTexture = new Image();
    kremowkaTexture.src = 'textures/kremowka.png';
    kremowkaTexture.onload = () => { kremowkaTexture.isLoaded = true; };

    const jp2FaceTexture = new Image();
    jp2FaceTexture.src = 'textures/jp2_face.png';
    jp2FaceTexture.onload = () => { jp2FaceTexture.isLoaded = true; };

    // --- Global View State ---
    let creationMode = 'planet';
    let nextStarMass = parseInt(starMassRange.value);
    let spawnInterval = parseFloat(spawnIntervalRange.value);
    let generatorLaunchSpeed = generatorLaunchSpeedRange ? parseInt(generatorLaunchSpeedRange.value) : 300;
    let generatorLaunchAngle = generatorLaunchAngleRange ? parseInt(generatorLaunchAngleRange.value) : 0;
    let generatorLimit = generatorLimitInput ? parseInt(generatorLimitInput.value) : 0;
    let draggedElement = null;
    let initialPredictedPath = [];
    let lastPredictionTime = 0;

    // UI selections
    let currentPlanetMass = 100;
    let currentPlanetRadius = 6;
    // We should reuse the config from SIMULATION_CONFIG implicitly for logic consistency
    const calculateRadiusFromMass = mass => Math.pow(mass, SIMULATION_CONFIG.PLANET.RADIUS_EXPONENT) * SIMULATION_CONFIG.PLANET.RADIUS_MULTIPLIER;

    let isPaused = false;
    let animationFrameId = null;
    let pulseTime = 0;
    let showForceVectors = showForceVectorsCheckbox.checked;
    let showEnergyPrediction = showEnergyPredictionCheckbox.checked;
    let showPrediction = showPredictionCheckbox.checked;
    let showOngoingPrediction = showOngoingPredictionCheckbox.checked;
    let showCollisionWarning = showCollisionWarningCheckbox ? showCollisionWarningCheckbox.checked : false;
    let predictionTime = parseFloat(predictionTimeRange.value);
    let showInteractionRange = showInteractionRangeCheckbox.checked;
    let showPlanetParticles = showPlanetParticlesCheckbox ? showPlanetParticlesCheckbox.checked : true;
    let planetParticles = [];
    let predictedCollisionIds = new Set();
    let collisionFrameCounter = 0;
    let showBoundary = showBoundaryCheckbox ? showBoundaryCheckbox.checked : true;
    let showGrid = showGridCheckbox ? showGridCheckbox.checked : true;

    // Viewport
    let scale = 1.0;
    let offsetX = 0;
    let offsetY = 0;
    let isTracking = false;
    let trackedPlanetId = null;
    let lastPlanetCount = 0;
    let currentFps = 60;

    // Input State
    const keysPressed = {};
    let isPointerDown = false;
    let isDragging = false;
    let isPanning = false;
    let isPinching = false;
    let lastPanPos = { x: 0, y: 0 };
    let startDragPos = { x: 0, y: 0 };
    let currentPointerPos = { x: 0, y: 0 };
    let didPointerMove = false;
    let initialPinchInfo = { distance: 0, scale: 1.0, worldMidpoint: { x: 0, y: 0 } };
    let touchPoints = new Map();

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function screenToWorld(screenX, screenY) { return { x: (screenX - offsetX) / scale, y: (screenY - offsetY) / scale }; }
    function worldToScreen(worldX, worldY) { return { x: worldX * scale + offsetX, y: worldY * scale + offsetY }; }

    // --- Starfield (Visual Only) ---
    // Moving this visual logic from simulation to script because it's purely aesthetic background
    let backgroundStars = [];
    function initStarfield() {
        backgroundStars = [];
        const numStars = VIEW_CONFIG.STARFIELD.COUNT;
        for (let i = 0; i < numStars; i++) {
            backgroundStars.push({
                x: (Math.random() - 0.5) * canvas.width * 1,
                y: (Math.random() - 0.5) * canvas.height * 1,
                z: Math.random() * 2 + 0.5,
                size: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.2 + 0.2,
                twinkleSpeed: Math.random() * 0.05
            });
        }
    }
    function drawStarfield(ctx) {
        ctx.fillStyle = '#050508';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const depthFactor = VIEW_CONFIG.STARFIELD.DEPTH_FACTOR;
        backgroundStars.forEach(star => {
            const parallaxX = (offsetX - centerX) * (depthFactor / star.z);
            const parallaxY = (offsetY - centerY) * (depthFactor / star.z);
            let x = (star.x + parallaxX) % (canvas.width * 2);
            let y = (star.y + parallaxY) % (canvas.height * 2);
            if (x < -canvas.width / 2) x += canvas.width * 2;
            if (y < -canvas.height / 2) y += canvas.height * 2;
            if (x > canvas.width * 1.5) x -= canvas.width * 2;
            if (y > canvas.height * 1.5) y -= canvas.height * 2;
            const twinkle = Math.sin(Date.now() * 0.001 + star.twinkleSpeed * 1000);
            const currentAlpha = star.alpha * (0.7 + 0.3 * twinkle);
            ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
            ctx.beginPath();
            ctx.arc(x + centerX, y + centerY, star.size / star.z, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // --- Planet Particles Drawer ---
    function updateAndDrawPlanetParticles(ctx) {
        if (!showPlanetParticles) return;
        
        const dt = sim.dt;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        const activeParticles = [];
        for (const pt of planetParticles) {
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            pt.life -= dt;
            
            if (pt.life > 0) {
                activeParticles.push(pt);
                const progress = pt.life / pt.maxLife;
                const currentAlpha = pt.alpha * progress;
                const currentSize = pt.size * (0.3 + 0.7 * progress);
                
                try {
                    ctx.fillStyle = pt.color.replace('hsl', 'hsla').replace(')', `, ${currentAlpha})`);
                } catch (e) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
                }
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, currentSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        planetParticles = activeParticles;
        ctx.restore();
    }

    // --- Planet Drawer ---
    function drawPlanet(ctx, p) {
        // Draw Trail
        if (p.trail.length >= 2 && p.maxTrailLength > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.beginPath();
            const startPoint = p.trail[0];
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineWidth = (p.mass > 500 ? 3 : 1.5) / scale;
            const gradient = ctx.createLinearGradient(startPoint.x, startPoint.y, p.x, p.y);
            try {
                const baseColor = p.color;
                gradient.addColorStop(0, 'rgba(0,0,0,0)');
                gradient.addColorStop(0.2, baseColor.replace('hsl', 'hsla').replace(')', ', 0.2)'));
                gradient.addColorStop(1, baseColor.replace('hsl', 'hsla').replace(')', ', 0.8)'));
                ctx.strokeStyle = gradient;
            } catch (e) { ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)'; }
            for (let i = 1; i < p.trail.length; i++) { ctx.lineTo(p.trail[i].x, p.trail[i].y); }
            ctx.stroke();
            ctx.restore();
        }

        if (p.isDebris) {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Glow
            if (p.mass > 500) {
                const glowRadius = p.radius * 4;
                const gradient = ctx.createRadialGradient(p.x, p.y, p.radius, p.x, p.y, glowRadius);
                gradient.addColorStop(0, p.color.replace('hsl', 'hsla').replace(')', ', 0.4)'));
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
                ctx.fill();
            }
            // Body Gradient
            const gradient = ctx.createRadialGradient(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.1, p.x, p.y, p.radius);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, p.color);
            gradient.addColorStop(1, p.color.replace('hsl', 'hsla').replace(')', ', 0.8)'));

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.beginPath();
            ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Texture (sliced from 3x3 planets spritesheet or JP2 face)
            if (sim.jp2Mode && jp2FaceTexture.isLoaded) {
                ctx.clip();
                ctx.drawImage(jp2FaceTexture, -p.radius, -p.radius, p.radius * 2, p.radius * 2);
            } else if (p.textureIndex >= 0 && planetsSpritesheet.isLoaded) {
                ctx.clip();
                const cellW = planetsSpritesheet.width / 3;
                const cellH = planetsSpritesheet.height / 3;
                const col = p.textureIndex % 3;
                const row = Math.floor(p.textureIndex / 3);
                const sx = col * cellW;
                const sy = row * cellH;
                
                ctx.drawImage(planetsSpritesheet, sx, sy, cellW, cellH, -p.radius, -p.radius, p.radius * 2, p.radius * 2);
                const overlayGradient = ctx.createRadialGradient(-p.radius * 0.3, -p.radius * 0.3, p.radius * 0.1, 0, 0, p.radius);
                overlayGradient.addColorStop(0, 'rgba(255,255,255,0.2)');
                overlayGradient.addColorStop(0.5, 'rgba(0,0,0,0)');
                overlayGradient.addColorStop(1, 'rgba(0,0,0,0.4)');
                ctx.fillStyle = overlayGradient;
                ctx.fill();
            }
            ctx.restore();
        }

        if (showForceVectors && !p.isDebris && (p.ax !== 0 || p.ay !== 0)) {
            const forceX = p.ax * p.mass;
            const forceY = p.ay * p.mass;
            const vectorScale = VIEW_CONFIG.VISUALS.VECTOR_SCALE;
            const endX = p.x + forceX * vectorScale;
            const endY = p.y + forceY * vectorScale;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = 'rgba(255, 50, 50, 0.8)';
            ctx.lineWidth = 1.5 / scale;
            ctx.stroke();
            const angle = Math.atan2(endY - p.y, endX - p.x);
            const arrowSize = VIEW_CONFIG.VISUALS.ARROW_SIZE / scale;
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - arrowSize * Math.cos(angle - Math.PI / 6), endY - arrowSize * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - arrowSize * Math.cos(angle + Math.PI / 6), endY - arrowSize * Math.sin(angle + Math.PI / 6));
            ctx.stroke();
        }

        if (showEnergyPrediction && !p.isDebris && p.isBound !== null) {
            const borderColor = p.isBound ? 'rgba(100, 255, 100, 0.6)' : 'rgba(255, 100, 100, 0.6)';
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2 / scale;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius + (ctx.lineWidth / 2) + 2, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (showInteractionRange && !p.isDebris) {
            ctx.strokeStyle = 'rgba(0, 150, 255, 0.15)';
            ctx.lineWidth = 1 / scale;
            ctx.setLineDash([5 / scale, 5 / scale].map(x => x / (scale / 5))); // Heuristic fix for dash scaling
            ctx.beginPath();
            ctx.arc(p.x, p.y, sim.getPlanetInteractionRange(p), 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        if (predictedCollisionIds.has(p.id)) {
            // Draw Warning Triangle
            const triangleHeight = 14 / scale;
            const triangleHalfWidth = 8 / scale;
            const offset = p.radius + (8 / scale); // Height above planet

            ctx.save();
            ctx.translate(p.x, p.y - offset);
            ctx.fillStyle = '#ffcc00'; // Warning Yellow
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 4;

            ctx.beginPath();
            ctx.moveTo(0, 0); // Bottom point
            ctx.lineTo(-triangleHalfWidth, -triangleHeight);
            ctx.lineTo(triangleHalfWidth, -triangleHeight);
            ctx.closePath();
            ctx.fill();

            // Exclamation mark
            ctx.fillStyle = 'black';
            ctx.font = `bold ${10 / scale}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 0;
            ctx.fillText('!', 0, -triangleHeight * 0.6);
            ctx.restore();
        }
    }

    function calculateInitialPrediction() {
        initialPredictedPath = [];
        if (creationMode !== 'planet' || !isDragging || !didPointerMove || !showPrediction) return;
        const worldStartPos = screenToWorld(startDragPos.x, startDragPos.y);
        const screenDx = (startDragPos.x - currentPointerPos.x);
        const screenDy = (startDragPos.y - currentPointerPos.y);
        const vx = screenDx * VIEW_CONFIG.VELOCITY_SCALE;
        const vy = screenDy * VIEW_CONFIG.VELOCITY_SCALE;

        // Use simulation to predict path (Manual ghost simulation matching logic in sim)
        // Note: Duplicating minimal logic here as per architectural design to keep prediction transient
        let ghost = { x: worldStartPos.x, y: worldStartPos.y, vx, vy, mass: currentPlanetMass, radius: currentPlanetRadius };
        initialPredictedPath.push({ x: ghost.x, y: ghost.y });
        for (let i = 0; i < 300; i++) {
            // We can use the helper from Simulation!
            // Actually, `calculateStarGravityForce` is on the Planet class in my previous design, but I can't access it easily unless I static-ize it.
            // But wait, `sim.stars` is available.
            // I'll implement a simple stepper here using Sim's G.
            let tFX = 0, tFY = 0;
            let hitStar = false;
            for (const star of sim.stars) {
                const dx = star.x - ghost.x;
                const dy = star.y - ghost.y;
                const dSq = dx * dx + dy * dy;
                if (dSq < (star.radius + ghost.radius) ** 2) { hitStar = true; break; }
                const dVal = Math.sqrt(dSq);
                const fM = (sim.G * star.mass * ghost.mass) / dSq;
                tFX += (fM * dx) / dVal;
                tFY += (fM * dy) / dVal;
            }
            if (hitStar) break;
            const ax = tFX / ghost.mass;
            const ay = tFY / ghost.mass;
            ghost.vx += ax * sim.dt;
            ghost.vy += ay * sim.dt;
            ghost.x += ghost.vx * sim.dt;
            ghost.y += ghost.vy * sim.dt;
            initialPredictedPath.push({ x: ghost.x, y: ghost.y });
        }
    }

    function drawInitialPrediction(ctx) {
        if (!showPrediction || initialPredictedPath.length < 1) return;
        if (initialPredictedPath.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(initialPredictedPath[0].x, initialPredictedPath[0].y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1 / scale;
            ctx.setLineDash(VIEW_CONFIG.VISUALS.PREDICTION_DASH.map(x => x / scale));
            for (let i = 1; i < initialPredictedPath.length; i++) {
                ctx.lineTo(initialPredictedPath[i].x, initialPredictedPath[i].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }
        if (showEnergyPrediction && initialPredictedPath.length > 0) {
            const worldStartPos = initialPredictedPath[0];
            const screenDx = (startDragPos.x - currentPointerPos.x);
            const screenDy = (startDragPos.y - currentPointerPos.y);
            const vx = screenDx * VIEW_CONFIG.VELOCITY_SCALE;
            const vy = screenDy * VIEW_CONFIG.VELOCITY_SCALE;
            const ghost = { x: worldStartPos.x, y: worldStartPos.y, vx, vy, mass: currentPlanetMass, radius: currentPlanetRadius };
            // Total energy check
            // Reuse Sim's calculateTotalEnergy?
            // Sim's method expects a planet object. Ghost fits the duck typing.
            const ghostEnergy = sim.calculateTotalEnergy(ghost);

            const isGhostBound = (ghostEnergy < 0);
            const borderColor = isGhostBound ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2 / scale;
            ctx.beginPath();
            ctx.arc(worldStartPos.x, worldStartPos.y, currentPlanetRadius + (ctx.lineWidth / 2), 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    function drawOngoingTrajectory(ctx, planet) {
        if (!showOngoingPrediction || planet.isDebris || !planet.ongoingPredictionPath || planet.ongoingPredictionPath.length < 2) return;
        const pathStyle = 'rgba(150, 150, 255, 0.5)';
        const pathWidth = 1 / scale;
        ctx.beginPath();
        ctx.moveTo(planet.ongoingPredictionPath[0].x, planet.ongoingPredictionPath[0].y);
        ctx.strokeStyle = pathStyle;
        ctx.lineWidth = pathWidth;
        ctx.setLineDash([4 / scale, 4 / scale]);
        for (let i = 1; i < planet.ongoingPredictionPath.length; i++) {
            ctx.lineTo(planet.ongoingPredictionPath[i].x, planet.ongoingPredictionPath[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function initializeSimulation() {
        handleFirstInteraction();
        sim.init();
        scoreElement.textContent = `Score: ${sim.score}`;

        // Central Star
        const centralStarMass = SIMULATION_CONFIG.STAR.BASE_MASS;
        sim.addStar(0, 0, centralStarMass, calculateRadiusFromMass(centralStarMass), getColorFromMass(centralStarMass), true, true);

        scale = 1.0;
        offsetX = canvas.width / 2;
        offsetY = canvas.height / 2;
        initStarfield();

        if (isPaused) {
            pauseBackgroundMusic();
        } else {
            startAnimation();
            if (toggleMusicCheckbox.checked) playBackgroundMusic();
        }
        drawStaticElements();
    }

    function drawStaticElements() {
        drawStarfield(ctx);
        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        // Draw Grid
        // (Simplified logic for grid - previously separate func)
        function drawGridLocal() {
            const minorSpacing = 300;
            const majorSpacing = 3000;
            const minorColor = "rgba(255, 255, 255, 0.08)";
            const majorColor = "rgba(255, 255, 255, 0.15)";
            const axisColor = "rgba(100, 100, 255, 0.3)";
            const topLeft = screenToWorld(0, 0);
            const bottomRight = screenToWorld(canvas.width, canvas.height);
            const worldLeft = topLeft.x;
            const worldRight = bottomRight.x;
            const worldTop = topLeft.y;
            const worldBottom = bottomRight.y;

            ctx.beginPath();
            const startX = Math.floor(worldLeft / minorSpacing) * minorSpacing;
            const endX = Math.ceil(worldRight / minorSpacing) * minorSpacing;
            for (let x = startX; x <= endX; x += minorSpacing) {
                const isMajor = Math.abs(x % majorSpacing) < 0.01;
                const isAxis = Math.abs(x) < 0.01;
                ctx.moveTo(x, worldTop);
                ctx.lineTo(x, worldBottom);
                ctx.strokeStyle = isAxis ? axisColor : (isMajor ? majorColor : minorColor);
                ctx.lineWidth = (isAxis || isMajor ? 1.5 : 1) / scale;
                ctx.stroke();
                ctx.beginPath();
            }
            const startY = Math.floor(worldTop / minorSpacing) * minorSpacing;
            const endY = Math.ceil(worldBottom / minorSpacing) * minorSpacing;
            for (let y = startY; y <= endY; y += minorSpacing) {
                const isMajor = Math.abs(y % majorSpacing) < 0.01;
                const isAxis = Math.abs(y) < 0.01;
                ctx.moveTo(worldLeft, y);
                ctx.lineTo(worldRight, y);
                ctx.strokeStyle = isAxis ? axisColor : (isMajor ? majorColor : minorColor);
                ctx.lineWidth = (isAxis || isMajor ? 1.5 : 1) / scale;
                ctx.stroke();
                ctx.beginPath();
            }

            // Sector Numeration
            const majorStartX = Math.floor(worldLeft / majorSpacing) * majorSpacing;
            const majorEndX = Math.ceil(worldRight / majorSpacing) * majorSpacing;
            const majorStartY = Math.floor(worldTop / majorSpacing) * majorSpacing;
            const majorEndY = Math.ceil(worldBottom / majorSpacing) * majorSpacing;

            ctx.font = `${12 / scale}px 'Inter', sans-serif`;
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";

            for (let mx = majorStartX; mx <= majorEndX; mx += majorSpacing) {
                for (let my = majorStartY; my <= majorEndY; my += majorSpacing) {
                    const sx = Math.round(mx / majorSpacing);
                    const sy = Math.round(my / majorSpacing);
                    ctx.fillText(`(${sx},${sy})`, mx + 15 / scale, my + 15 / scale);
                }
            }
        }
        if (showGrid) drawGridLocal();

        // World Boundary
        if (showBoundary) {
            ctx.beginPath();
            ctx.arc(0, 0, SIMULATION_CONFIG.MAX_DISTANCE_FROM_CENTER, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 50, 50, 0.4)';
            ctx.lineWidth = 4 / scale;
            ctx.setLineDash([20 / scale, 10 / scale]);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.shadowBlur = 20;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Containment Zone (Inner Boundary)
            if (sim.containmentEnabled) {
                ctx.beginPath();
                ctx.arc(0, 0, sim.containmentRadius, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(100, 200, 255, 0.4)';
                ctx.lineWidth = 2 / scale;
                ctx.setLineDash([10 / scale, 10 / scale]);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Draw Black Holes
        if (sim.blackHoles) {
            for (const bh of sim.blackHoles) {
                // Accretion Disk / Event Horizon Glow
                const glowRadius = bh.radius * 2.5;
                const gradient = ctx.createRadialGradient(bh.x, bh.y, bh.radius, bh.x, bh.y, glowRadius);
                gradient.addColorStop(0, 'rgba(100, 0, 150, 0.8)'); // Deep violet
                gradient.addColorStop(0.5, 'rgba(100, 0, 200, 0.2)');
                gradient.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.beginPath();
                ctx.arc(bh.x, bh.y, glowRadius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Core (Black)
                ctx.beginPath();
                ctx.arc(bh.x, bh.y, bh.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#000000';
                ctx.fill();
                ctx.strokeStyle = 'rgba(100, 0, 100, 0.9)'; // Thin ring
                ctx.lineWidth = 2 / scale;
                ctx.stroke();
            }
        }

        // Draw White Holes
        if (sim.whiteHoles) {
            for (const wh of sim.whiteHoles) {
                // Radiance
                const glowRadius = wh.radius * 3.0;
                const gradient = ctx.createRadialGradient(wh.x, wh.y, wh.radius * 0.5, wh.x, wh.y, glowRadius);
                gradient.addColorStop(0, 'rgba(200, 255, 255, 1)'); // Bright cyan center
                gradient.addColorStop(0.4, 'rgba(100, 255, 255, 0.3)');
                gradient.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.beginPath();
                ctx.arc(wh.x, wh.y, glowRadius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Core
                ctx.beginPath();
                // Pulsate slightly
                const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.05;
                ctx.arc(wh.x, wh.y, wh.radius * pulse, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.shadowBlur = 20;
                ctx.shadowColor = 'rgba(0, 255, 255, 1)';
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        // Stars
        for (const star of sim.stars) {
            // Pulsing factor
            const pulseSpeed = star.isInitialSun ? 1 : 1;
            const glowFactor = 0.15 * Math.sin(pulseTime * pulseSpeed);
            const baseGlowSize = star.isInitialSun ? 5 : 3;
            const glowRadius = star.radius * baseGlowSize * (1 + glowFactor);

            // 1. Exterior Glow (Radial Gradient)
            const gradient = ctx.createRadialGradient(star.x, star.y, star.radius, star.x, star.y, glowRadius);
            try {
                const baseColor = star.color;
                const glowColorStart = baseColor.replace('hsl', 'hsla').replace(')', ', 0.4)');
                const glowColorMid = baseColor.replace('hsl', 'hsla').replace(')', ', 0.1)');
                gradient.addColorStop(0, glowColorStart);
                gradient.addColorStop(0.5, glowColorMid);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
            } catch (e) {
                gradient.addColorStop(0, 'rgba(255,255,255,0.3)');
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
            }

            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // 2. Main Star Body
            if (sim.jp2Mode && kremowkaTexture.isLoaded) {
                ctx.save();
                ctx.translate(star.x, star.y);
                // Rotate the kremówka cake slowly over time
                const rot = (Date.now() / 1500) % (Math.PI * 2);
                ctx.rotate(rot);
                ctx.drawImage(kremowkaTexture, -star.radius, -star.radius, star.radius * 2, star.radius * 2);
                ctx.restore();
            } else {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = star.color;
                ctx.fill();
            }
        }
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Target
        if (sim.target.isActive) {
            ctx.fillStyle = sim.target.color;
            ctx.beginPath();
            ctx.arc(sim.target.x, sim.target.y, sim.target.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 1 / scale;
            ctx.stroke();
        }

        if (showPrediction && isDragging) drawInitialPrediction(ctx);
        updateAndDrawPlanetParticles(ctx);
        for (const planet of sim.planets) {
            drawPlanet(ctx, planet);
            if (showOngoingPrediction) drawOngoingTrajectory(ctx, planet);
        }
        if (showPrediction && isDragging) drawPreviewVectorLines(ctx);

        // Generators
        for (const gen of sim.generators) {
            ctx.save();
            ctx.translate(gen.x, gen.y);
            ctx.rotate(gen.angle);

            // Draw a subtle line showing direction & force/speed if not in stable orbit mode
            if (gen.mode !== 'stable') {
                const arrowLength = (gen.launchSpeed || 300) * 0.15;
                ctx.beginPath();
                ctx.moveTo(20, 0);
                ctx.lineTo(arrowLength, 0);
                ctx.strokeStyle = 'rgba(255, 0, 255, 0.4)';
                ctx.lineWidth = 2 / scale;
                ctx.setLineDash([4 / scale, 4 / scale]);
                ctx.stroke();
                ctx.setLineDash([]);
                
                // Draw arrow head at the end
                ctx.beginPath();
                ctx.moveTo(arrowLength, 0);
                ctx.lineTo(arrowLength - 8 / scale, -4 / scale);
                ctx.moveTo(arrowLength, 0);
                ctx.lineTo(arrowLength - 8 / scale, 4 / scale);
                ctx.strokeStyle = 'rgba(255, 0, 255, 0.6)';
                ctx.stroke();
            }

            ctx.fillStyle = 'rgba(255, 0, 255, 0.1)';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, 50, -Math.PI / 8, Math.PI / 8);
            ctx.fill();
            ctx.fillStyle = gen.color;
            ctx.fillRect(-20, -20, 40, 40);
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(20, 0);
            ctx.strokeStyle = gen.color;
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.restore();

            // Draw counter above the generator (upright)
            if (gen.limit > 0) {
                ctx.save();
                ctx.translate(gen.x, gen.y - 30);
                ctx.font = `bold ${10 / scale}px 'Inter', sans-serif`;
                
                const text = `${gen.spawnedCount}/${gen.limit}`;
                const textWidth = ctx.measureText(text).width;
                const paddingX = 6 / scale;
                const paddingY = 4 / scale;
                
                // Rounded rect background
                const bgWidth = textWidth + paddingX * 2;
                const bgHeight = 14 / scale;
                const rx = -bgWidth / 2;
                const ry = -bgHeight;
                
                ctx.fillStyle = 'rgba(10, 10, 15, 0.85)';
                ctx.strokeStyle = gen.color;
                ctx.lineWidth = 1 / scale;
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(rx, ry, bgWidth, bgHeight, 4 / scale);
                } else {
                    ctx.rect(rx, ry, bgWidth, bgHeight);
                }
                ctx.fill();
                ctx.stroke();
                
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, 0, ry + bgHeight / 2);
                ctx.restore();
            }
        }
        ctx.restore();
    }

    function animate() {
        if (isPaused) {
            drawStaticElements();
            animationFrameId = requestAnimationFrame(animate);
            return;
        }

        const moveSpeed = VIEW_CONFIG.KEYBOARD_SPEED;
        if (keysPressed['w']) offsetY += moveSpeed;
        if (keysPressed['s']) offsetY -= moveSpeed;
        if (keysPressed['a']) offsetX += moveSpeed;
        if (keysPressed['d']) offsetX -= moveSpeed;

        animationFrameId = requestAnimationFrame(animate);
        pulseTime += sim.dt * 2;
        const now = Date.now() / 1000;

        // Optimization
        if (currentFps < 45 && sim.planets.length > 30) {
            const removeCount = currentFps < 25 ? 5 : 1;
            for (let r = 0; r < removeCount && sim.planets.length > 20; r++) { sim.planets.shift(); }
        }

        sim.update(now);
        
        // Spawn planet particles
        if (showPlanetParticles && !isPaused) {
            for (const p of sim.planets) {
                if (p.isDebris) continue;
                if (planetParticles.length >= 1000) break;
                
                if (Math.random() < 0.25) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = p.radius * (1.0 + Math.random() * 0.25);
                    const px = p.x + Math.cos(angle) * dist;
                    const py = p.y + Math.sin(angle) * dist;
                    
                    const tangentX = -Math.sin(angle);
                    const tangentY = Math.cos(angle);
                    const orbitSpeed = (15 + Math.random() * 30);
                    const driftSpeed = (5 + Math.random() * 10);
                    
                    const pvx = p.vx + tangentX * orbitSpeed + Math.cos(angle) * driftSpeed;
                    const pvy = p.vy + tangentY * orbitSpeed + Math.sin(angle) * driftSpeed;
                    
                    // Golden yellow halo particles in JP2 Mode, otherwise matched planet colors
                    const baseColor = sim.jp2Mode ? 'hsl(45, 100%, 65%)' : (p.color || 'hsl(180, 50%, 50%)');
                    const life = 0.8 + Math.random() * 1.2;
                    
                    planetParticles.push({
                        x: px,
                        y: py,
                        vx: pvx,
                        vy: pvy,
                        color: baseColor,
                        alpha: 0.7 + Math.random() * 0.3,
                        size: 1.0 + Math.random() * 1.5,
                        life: life,
                        maxLife: life
                    });
                }
            }
        }

        updateAmbientSounds();

        const activeObjectsCount = sim.planets.length + sim.stars.length;
        if (activeCounterElement) activeCounterElement.textContent = `Objects: ${activeObjectsCount}`;

        // Ongoing Prediction (Visual heavy, so optional)
        if (showOngoingPrediction) {
            sim.planets.forEach(p => sim.calculateOngoingTrajectory(p, predictionTime));
        }

        // Collision Warning Logic
        showCollisionWarning = showCollisionWarningCheckbox.checked;
        if (showCollisionWarning) {
            collisionFrameCounter++;
            if (collisionFrameCounter % 15 === 0) {
                // Predict 3 seconds or based on predictionTimeRange (clamped?)
                // User said "mode", let's use a fixed reasonable lookahead, e.g. 3s
                predictedCollisionIds = sim.predictSystemCollisions(3.0);
            }
        } else {
            if (predictedCollisionIds.size > 0) predictedCollisionIds.clear();
        }

        if (isTracking && sim.planets.length !== lastPlanetCount) {
            updateTrackedPlanetSelect();
        }
        lastPlanetCount = sim.planets.length;

        if (isTracking) {
            let tracked = (trackedPlanetId !== null) ? sim.planets.find(p => p.id === trackedPlanetId) : null;

            if (!tracked) {
                // No planet tracked or tracked planet lost - find nearest planet to last known view center
                const lastPos = screenToWorld(canvas.width / 2, canvas.height / 2);

                let bestD2 = Infinity;
                let candidate = null;
                for (const p of sim.planets) {
                    if (p.isDebris) continue;
                    const d2 = (p.x - lastPos.x) ** 2 + (p.y - lastPos.y) ** 2;
                    if (d2 < bestD2) {
                        bestD2 = d2;
                        candidate = p;
                    }
                }

                if (candidate) {
                    trackedPlanetId = candidate.id;
                    tracked = candidate;
                    updateTrackedPlanetSelect();
                    trackedPlanetSelect.value = candidate.id;
                } else {
                    trackedPlanetId = null;
                    if (trackedPlanetSelect.value !== "none") {
                        updateTrackedPlanetSelect();
                        trackedPlanetSelect.value = "none";
                    }
                }
            }

            if (tracked) {
                offsetX = canvas.width / 2 - tracked.x * scale;
                offsetY = canvas.height / 2 - tracked.y * scale;

                // Update HUD
                trackingInfoDiv.classList.remove('hidden');
                trackIdSpan.textContent = tracked.id;
                const speed = Math.sqrt(tracked.vx * tracked.vx + tracked.vy * tracked.vy);
                trackSpeedSpan.textContent = speed.toFixed(2);
                trackMassSpan.textContent = tracked.mass.toFixed(1);
                trackVxSpan.textContent = tracked.vx.toFixed(2);
                trackVySpan.textContent = tracked.vy.toFixed(2);
            } else {
                trackingInfoDiv.classList.add('hidden');
            }
        } else {
            trackingInfoDiv.classList.add('hidden');
        }
        drawStaticElements();
    }

    // --- Input Handling ---
    function handlePointerDown(e) {
        handleFirstInteraction();
        const targetIsControl = controlsDiv.contains(e.target);
        if (targetIsControl) return;
        e.preventDefault();
        isPointerDown = true;
        const pos = { x: e.clientX, y: e.clientY };
        
        if (e.pointerType === 'touch') {
            touchPoints.set(e.pointerId, { x: e.clientX, y: e.clientY });
            if (touchPoints.size === 1) {
                isPanning = isPinching = false;
                startDragPos = { ...pos };
                currentPointerPos = { ...pos };
                didPointerMove = false;
                
                if (creationMode === 'move') {
                    const worldPos = screenToWorld(startDragPos.x, startDragPos.y);
                    const clickRadius = 40 / scale;
                    draggedElement = sim.findElementAt(worldPos.x, worldPos.y, clickRadius);
                    if (draggedElement) {
                        isDragging = true;
                        draggedElement.isDragged = true;
                        if (draggedElement.vx !== undefined) { draggedElement.vx = 0; draggedElement.vy = 0; }
                        canvas.style.cursor = 'grabbing';
                    }
                } else {
                    isDragging = creationMode === 'planet';
                    if (isDragging) {
                        currentPlanetMass = Math.random() * (200 - 50) + 50;
                        currentPlanetRadius = calculateRadiusFromMass(currentPlanetMass);
                        speedLabel.style.display = 'block';
                        updateSpeedLabel();
                        initialPredictedPath = [];
                        lastPredictionTime = Date.now();
                        if (showPrediction) calculateInitialPrediction();
                    }
                    canvas.style.cursor = 'crosshair';
                }
            } else if (touchPoints.size === 2) {
                isDragging = false;
                if (draggedElement) draggedElement.isDragged = false;
                draggedElement = null;
                speedLabel.style.display = 'none';
                initialPredictedPath = [];
                isPanning = true;
                isPinching = true;
                const touches = Array.from(touchPoints.values());
                const midpoint = { x: (touches[0].x + touches[1].x) / 2, y: (touches[0].y + touches[1].y) / 2 };
                const dist = Math.sqrt((touches[0].x - touches[1].x) ** 2 + (touches[0].y - touches[1].y) ** 2);
                initialPinchInfo = { distance: dist, scale: scale, worldMidpoint: screenToWorld(midpoint.x, midpoint.y) };
                lastPanPos = midpoint;
                canvas.style.cursor = 'move';
            }
        } else {
            startDragPos = { ...pos };
            currentPointerPos = { ...pos };
            didPointerMove = false;
            if (e.button === 0) {
                isPanning = isPinching = false;
                
                if (creationMode === 'move') {
                    const worldPos = screenToWorld(startDragPos.x, startDragPos.y);
                    const clickRadius = 40 / scale;
                    draggedElement = sim.findElementAt(worldPos.x, worldPos.y, clickRadius);
                    if (draggedElement) {
                        isDragging = true;
                        draggedElement.isDragged = true;
                        if (draggedElement.vx !== undefined) { draggedElement.vx = 0; draggedElement.vy = 0; }
                        canvas.style.cursor = 'grabbing';
                    }
                } else {
                    isDragging = creationMode === 'planet';
                    if (isDragging) {
                        currentPlanetMass = Math.random() * (200 - 50) + 50;
                        currentPlanetRadius = calculateRadiusFromMass(currentPlanetMass);
                        speedLabel.style.display = 'block';
                        updateSpeedLabel();
                        initialPredictedPath = [];
                        lastPredictionTime = Date.now();
                        if (showPrediction) calculateInitialPrediction();
                    }
                    canvas.style.cursor = 'crosshair';
                }
            } else if (e.button === 1 || e.button === 2) {
                isPanning = true; isDragging = false; isPinching = false;
                if (draggedElement) draggedElement.isDragged = false;
                draggedElement = null;
                if (isTracking) { isTracking = false; trackingModeCheckbox.checked = false; trackedPlanetSelect.classList.add('hidden'); }
                lastPanPos = { ...pos };
                canvas.style.cursor = 'move';
            }
        }
    }

    // ... handlePointerMove and Up ...
    function handlePointerMove(e) {
        if (!isPointerDown) return;
        const targetIsControl = controlsDiv.contains(e.target);
        if (!isDragging && !isPanning && !isPinching && targetIsControl) return;
        if (isDragging || isPanning || isPinching) e.preventDefault(); else return;
        if (!didPointerMove) {
            if (((startDragPos.x - e.clientX) ** 2 + (startDragPos.y - e.clientY) ** 2) > 10) didPointerMove = true;
        }
        
        if (creationMode === 'move' && draggedElement) {
            const worldPos = screenToWorld(e.clientX, e.clientY);
            draggedElement.x = worldPos.x;
            draggedElement.y = worldPos.y;
            if (draggedElement.trail) draggedElement.trail = [];
            if (draggedElement.vx !== undefined) { draggedElement.vx = 0; draggedElement.vy = 0; }
            return;
        }
        
        if (e.pointerType === 'touch') {
            if (touchPoints.has(e.pointerId)) { touchPoints.set(e.pointerId, { x: e.clientX, y: e.clientY }); }
            if (isPinching && touchPoints.size === 2) {
                const touches = Array.from(touchPoints.values());
                const currentMidpoint = { x: (touches[0].x + touches[1].x) / 2, y: (touches[0].y + touches[1].y) / 2 };
                const currentPinchDistance = Math.sqrt((touches[0].x - touches[1].x) ** 2 + (touches[0].y - touches[1].y) ** 2);
                let newScale = scale;
                if (initialPinchInfo.distance > 1) {
                    const scaleFactor = currentPinchDistance / initialPinchInfo.distance;
                    newScale = Math.max(VIEW_CONFIG.ZOOM.MIN, Math.min(VIEW_CONFIG.ZOOM.MAX, initialPinchInfo.scale * scaleFactor));
                }
                const targetOffsetX = currentMidpoint.x - initialPinchInfo.worldMidpoint.x * newScale;
                const targetOffsetY = currentMidpoint.y - initialPinchInfo.worldMidpoint.y * newScale;
                offsetX = targetOffsetX + (currentMidpoint.x - lastPanPos.x);
                offsetY = targetOffsetY + (currentMidpoint.y - lastPanPos.y);
                scale = newScale;
                lastPanPos = currentMidpoint;
            } else if (isDragging && touchPoints.size === 1 && didPointerMove) {
                currentPointerPos = { x: e.clientX, y: e.clientY };
                updateSpeedLabel();
                const now = Date.now();
                if (showPrediction && now - lastPredictionTime > 10) { calculateInitialPrediction(); lastPredictionTime = now; }
            }
        } else {
            const pos = { x: e.clientX, y: e.clientY };
            if (isPanning) {
                offsetX += pos.x - lastPanPos.x;
                offsetY += pos.y - lastPanPos.y;
                lastPanPos = { ...pos };
            } else if (isDragging && didPointerMove) {
                currentPointerPos = { ...pos };
                updateSpeedLabel();
                const now = Date.now();
                if (showPrediction && now - lastPredictionTime > 10) { calculateInitialPrediction(); lastPredictionTime = now; }
            }
        }
    }

    function handlePointerUp(e) {
        if (!isPointerDown) return;
        e.preventDefault();
        if (draggedElement) {
            draggedElement.isDragged = false;
            draggedElement = null;
        }
        if (touchPoints.has(e.pointerId)) {
            touchPoints.delete(e.pointerId);
            if (touchPoints.size < 2) { isPinching = isPanning = false; initialPinchInfo.distance = 0; if (touchPoints.size === 1) canvas.style.cursor = creationMode === 'move' ? 'move' : 'crosshair'; }
            if (touchPoints.size === 0) { isPointerDown = false; finalizePlanetCreation({ x: e.clientX, y: e.clientY }); }
        } else {
            isPointerDown = false;
            if (isPanning) { isPanning = false; canvas.style.cursor = creationMode === 'move' ? 'move' : 'crosshair'; }
            else { finalizePlanetCreation({ x: e.clientX, y: e.clientY }); }
        }
        if (!isPointerDown) {
            isDragging = isPanning = isPinching = false;
            speedLabel.style.display = 'none';
            initialPredictedPath = [];
            touchPoints.clear();
            canvas.style.cursor = creationMode === 'move' ? 'move' : 'crosshair';
            initialPinchInfo.distance = 0;
            didPointerMove = false;
        }
    }

    function finalizePlanetCreation(endScreenPos) {
        speedLabel.style.display = 'none';
        initialPredictedPath = [];

        if (creationMode === 'planet') {
            // Handle click-to-track if no drag
            if (!didPointerMove) {
                const worldClickPos = screenToWorld(endScreenPos.x, endScreenPos.y);
                let planetToTrack = null;
                for (let i = sim.planets.length - 1; i >= 0; i--) {
                    const p = sim.planets[i];
                    if (p.isDebris) continue;
                    const dSq = (worldClickPos.x - p.x) ** 2 + (worldClickPos.y - p.y) ** 2;
                    if (dSq < (p.radius + 15 / scale) ** 2) { planetToTrack = p; break; }
                }
                if (planetToTrack) {
                    isTracking = true;
                    trackedPlanetId = planetToTrack.id;
                    trackingModeCheckbox.checked = true;
                    trackedPlanetSelect.classList.remove('hidden');
                    updateTrackedPlanetSelect();
                    trackedPlanetSelect.value = planetToTrack.id;
                    return;
                }
            }

            // Creation
            const screenDx = (startDragPos.x - endScreenPos.x);
            const screenDy = (startDragPos.y - endScreenPos.y);
            const vx = screenDx * VIEW_CONFIG.VELOCITY_SCALE;
            const vy = screenDy * VIEW_CONFIG.VELOCITY_SCALE;
            if (didPointerMove || Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) {
                const worldStartPos = screenToWorld(startDragPos.x, startDragPos.y);
                sim.addPlanet(worldStartPos.x, worldStartPos.y, vx, vy, currentPlanetMass, currentPlanetRadius, `hsl(${Math.random() * 360}, 70%, 70%)`);
                if (toggleSfxCheckbox.checked) playLaunchSynth();
            }
        } else if (creationMode === 'generator') {
            const worldStartPos = screenToWorld(startDragPos.x, startDragPos.y);
            let angle = Math.atan2(endScreenPos.y - startDragPos.y, endScreenPos.x - startDragPos.x);
            if (!didPointerMove) {
                angle = generatorLaunchAngle * Math.PI / 180;
            } else {
                let dragDegrees = Math.round(angle * 180 / Math.PI);
                if (dragDegrees < 0) dragDegrees += 360;
                generatorLaunchAngle = dragDegrees;
                if (generatorLaunchAngleRange) {
                    generatorLaunchAngleRange.value = dragDegrees;
                }
                if (generatorLaunchAngleValueSpan) {
                    generatorLaunchAngleValueSpan.textContent = `${dragDegrees}°`;
                }
            }
            const isStable = stableOrbitCheckbox && stableOrbitCheckbox.checked;
            const mode = isStable ? 'stable' : 'normal';
            const color = isStable ? 'hsl(180, 100%, 70%)' : 'hsl(300, 100%, 70%)';
            sim.addGenerator(worldStartPos.x, worldStartPos.y, angle, spawnInterval, color, mode, generatorLimit, generatorLaunchSpeed);
            if (toggleSfxCheckbox.checked) playLaunchSynth();
        } else if (creationMode === 'black-hole' && !didPointerMove) {
            const worldTapPos = screenToWorld(startDragPos.x, startDragPos.y);
            // Mass: 30000 (1.5x star), Radius: 30
            sim.addBlackHole(worldTapPos.x, worldTapPos.y, 30000, 30);
        } else if (creationMode === 'white-hole' && !didPointerMove) {
            const worldTapPos = screenToWorld(startDragPos.x, startDragPos.y);
            // Radius: 20
            sim.addWhiteHole(worldTapPos.x, worldTapPos.y, 20);
        } else if (creationMode === 'star' && !didPointerMove) {
            const worldTapPos = screenToWorld(startDragPos.x, startDragPos.y);
            sim.addStar(worldTapPos.x, worldTapPos.y, nextStarMass, calculateRadiusFromMass(nextStarMass), getColorFromMass(nextStarMass), true, false);
        } else if (creationMode === 'eraser' && !didPointerMove) {
            const worldTapPos = screenToWorld(startDragPos.x, startDragPos.y);
            const deleted = sim.removeElementAt(worldTapPos.x, worldTapPos.y, 25 / scale);
            if (deleted && sim.callbacks.onErasure) {
                sim.callbacks.onErasure();
            }
        }
        isDragging = false;
        didPointerMove = false;
    }

    function drawPreviewVectorLines(ctx) {
        if (!isDragging || creationMode !== 'planet' || !didPointerMove) return;
        const worldStart = screenToWorld(startDragPos.x, startDragPos.y);
        const worldCurrent = screenToWorld(currentPointerPos.x, currentPointerPos.y);
        const worldVelX = (startDragPos.x - currentPointerPos.x) * VIEW_CONFIG.VELOCITY_SCALE;
        const worldVelY = (startDragPos.y - currentPointerPos.y) * VIEW_CONFIG.VELOCITY_SCALE;
        ctx.beginPath();
        ctx.moveTo(worldStart.x, worldStart.y);
        ctx.lineTo(worldCurrent.x, worldCurrent.y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1 / scale;
        ctx.setLineDash([2 / scale, 3 / scale]);
        ctx.stroke();
        const visualVelScale = VIEW_CONFIG.VISUALS.VECTOR_SCALE;
        ctx.beginPath();
        ctx.moveTo(worldStart.x, worldStart.y);
        ctx.lineTo(worldStart.x + worldVelX * visualVelScale, worldStart.y + worldVelY * visualVelScale);
        ctx.strokeStyle = 'rgba(100, 255, 100, 0.7)';
        ctx.lineWidth = 2 / scale;
        ctx.setLineDash([]);
        ctx.stroke();
        ctx.lineWidth = 1 / scale;
    }

    // --- Helpers ---
    function updateSpeedLabel() {
        if (!isDragging || creationMode !== 'planet') return;
        const dx = startDragPos.x - currentPointerPos.x;
        const dy = startDragPos.y - currentPointerPos.y;
        const speed = Math.sqrt(dx * dx + dy * dy) * VIEW_CONFIG.VELOCITY_SCALE;
        speedLabel.textContent = `Speed: ${speed.toFixed(1)}`;
        let labelX = currentPointerPos.x + 15, labelY = currentPointerPos.y - 25;
        if (labelX + speedLabel.offsetWidth > canvas.width - 10) labelX = currentPointerPos.x - speedLabel.offsetWidth - 15;
        if (labelY < 10) labelY = currentPointerPos.y + 10;
        speedLabel.style.left = `${labelX}px`;
        speedLabel.style.top = `${labelY}px`;
    }
    function getColorFromMass(mass) {
        if (mass <= 30000) {
            // Interpolate between Red (0) and Orange (35)
            const minM = 2000;
            const maxM = 30000;
            const ratio = Math.max(0, Math.min(1, (mass - minM) / (maxM - minM)));
            const hue = ratio * 35; // 0 to 35
            return `hsl(${hue}, 100%, 55%)`;
        } else if (mass <= 100000) {
            // Interpolate between Orange/Yellow (35) and Yellow/Greenish (60)
            const minM = 30000;
            const maxM = 100000;
            const ratio = Math.max(0, Math.min(1, (mass - minM) / (maxM - minM)));
            const hue = 35 + ratio * 25; // 35 to 60
            return `hsl(${hue}, 100%, 60%)`;
        } else {
            // Interpolate between Yellow/Greenish (60) and Blue (210)
            const minM = 100000;
            const maxM = 400000;
            const ratio = Math.max(0, Math.min(1, (mass - minM) / (maxM - minM)));
            const hue = 60 + ratio * 150; // 60 to 210
            const saturation = 90;
            const lightness = 60 + ratio * 15; // 60% to 75%
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        }
    }

    function updateTrackedPlanetSelect() {
        const previousValue = trackedPlanetSelect.value;
        trackedPlanetSelect.innerHTML = '<option value="none">Select planet...</option>';
        sim.planets.forEach(p => {
            if (p.isDebris) return;
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `Planet ${p.id} (${Math.round(p.mass)})`;
            trackedPlanetSelect.appendChild(option);
        });
        if (previousValue !== "none") {
            const stillExists = sim.planets.some(p => p.id == previousValue);
            if (stillExists) {
                trackedPlanetSelect.value = previousValue;
            } else {
                trackedPlanetSelect.value = "none";
                // We DON'T nullify trackedPlanetId here anymore, 
                // because we want the main loop to detect the loss and find the nearest planet.
            }
        }
    }

    // --- Event Listeners ---
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const mousePos = { x: e.clientX, y: e.clientY };
        const worldPosBefore = screenToWorld(mousePos.x, mousePos.y);
        const zoomFactor = e.deltaY < 0 ? VIEW_CONFIG.ZOOM.SENSITIVITY : 1 / VIEW_CONFIG.ZOOM.SENSITIVITY;
        const newScale = Math.max(VIEW_CONFIG.ZOOM.MIN, Math.min(VIEW_CONFIG.ZOOM.MAX, scale * zoomFactor));
        offsetX = mousePos.x - worldPosBefore.x * newScale;
        offsetY = mousePos.y - worldPosBefore.y * newScale;
        scale = newScale;
        if (isDragging && creationMode === 'planet' && showPrediction) calculateInitialPrediction();
    }, { passive: false });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    // UI Change Handlers
    modeRadios.forEach(radio => radio.addEventListener('change', (e) => {
        creationMode = e.target.value;
        initialPredictedPath = [];
        starOptionsDiv.classList.toggle('hidden', creationMode !== 'star');
        generatorOptionsDiv.classList.toggle('hidden', creationMode !== 'generator');
        isDragging = isPanning = isPinching = false;
        speedLabel.style.display = 'none';
        canvas.style.cursor = creationMode === 'move' ? 'move' : 'crosshair';
    }));
    collisionModeRadios.forEach(radio => radio.addEventListener('change', (e) => {
        sim.collisionMode = e.target.value;
        if (mergeOptionsDiv) {
            mergeOptionsDiv.classList.toggle('hidden', sim.collisionMode !== 'merge');
        }
    }));
    if (disableWorldBoundaryCheckbox) {
        disableWorldBoundaryCheckbox.addEventListener('change', (e) => {
            sim.disableWorldBoundary = e.target.checked;
        });
    }
    if (noPlanetMergeMassLimitCheckbox) {
        noPlanetMergeMassLimitCheckbox.addEventListener('change', (e) => {
            sim.noPlanetMergeMassLimit = e.target.checked;
        });
    }
    if (disableMassDecayCheckbox) {
        disableMassDecayCheckbox.addEventListener('change', (e) => {
            sim.disableMassDecay = e.target.checked;
        });
    }
    if (disablePlanetCollisionsCheckbox) {
        disablePlanetCollisionsCheckbox.addEventListener('change', (e) => {
            sim.disablePlanetCollisions = e.target.checked;
        });
    }
    if (dynamicStarsCheckbox) {
        dynamicStarsCheckbox.addEventListener('change', (e) => {
            sim.dynamicStars = e.target.checked;
        });
    }
    if (showPlanetParticlesCheckbox) {
        showPlanetParticlesCheckbox.addEventListener('change', (e) => {
            showPlanetParticles = e.target.checked;
            if (!showPlanetParticles) {
                planetParticles = [];
            }
        });
    }
    if (jp2ModeCheckbox) {
        jp2ModeCheckbox.addEventListener('change', (e) => {
            sim.jp2Mode = e.target.checked;
        });
    }
    starMassRange.addEventListener('input', (e) => { nextStarMass = parseInt(e.target.value); starMassValueSpan.textContent = nextStarMass; });
    gConstantRange.addEventListener('input', (e) => {
        sim.setGravityConstant(parseInt(e.target.value));
        gConstantValueSpan.textContent = sim.G;
        if (isDragging && creationMode === 'planet' && showPrediction) calculateInitialPrediction();
    });
    interactionRangeRange.addEventListener('input', (e) => {
        sim.planetInteractionRange = parseInt(e.target.value);
        interactionRangeValueSpan.textContent = sim.planetInteractionRange;
    });
    trailLengthRange.addEventListener('input', (e) => {
        sim.setMaxTrailLength(parseInt(e.target.value));
        trailLengthValueSpan.textContent = sim.maxTrailLength;
    });
    spawnIntervalRange.addEventListener('input', (e) => { spawnInterval = parseFloat(e.target.value); spawnIntervalValueSpan.textContent = spawnInterval.toFixed(1); });
    if (generatorLaunchSpeedRange) {
        generatorLaunchSpeedRange.addEventListener('input', (e) => {
            generatorLaunchSpeed = parseInt(e.target.value);
            generatorLaunchSpeedValueSpan.textContent = generatorLaunchSpeed;
        });
    }
    if (generatorLaunchAngleRange) {
        generatorLaunchAngleRange.addEventListener('input', (e) => {
            generatorLaunchAngle = parseInt(e.target.value);
            generatorLaunchAngleValueSpan.textContent = `${generatorLaunchAngle}°`;
        });
    }
    if (generatorLimitInput) {
        generatorLimitInput.addEventListener('input', (e) => {
            generatorLimit = Math.max(0, parseInt(e.target.value) || 0);
        });
    }
    if (generatorLimitDecrementBtn) {
        generatorLimitDecrementBtn.addEventListener('click', () => {
            generatorLimit = Math.max(0, generatorLimit - 5);
            generatorLimitInput.value = generatorLimit;
        });
    }
    if (generatorLimitIncrementBtn) {
        generatorLimitIncrementBtn.addEventListener('click', () => {
            generatorLimit = Math.min(1000, generatorLimit + 5);
            generatorLimitInput.value = generatorLimit;
        });
    }
    if (stableOrbitCheckbox) {
        stableOrbitCheckbox.addEventListener('change', (e) => {
            if (generatorPhysicsOptionsDiv) {
                generatorPhysicsOptionsDiv.classList.toggle('hidden', e.target.checked);
            }
        });
    }
    clearGeneratorsButton.addEventListener('click', () => sim.clearGenerators());
    if (clearPlanetsButton) {
        clearPlanetsButton.addEventListener('click', () => {
            sim.clearPlanets();
            planetToTrack = null;
            updateTrackedPlanetSelect();
        });
    }
    if (clearStarsButton) {
        clearStarsButton.addEventListener('click', () => {
            sim.clearStars();
        });
    }
    debrisDecrementBtn.addEventListener('click', () => { sim.debrisCount = Math.max(0, sim.debrisCount - 10); debrisCountInput.value = sim.debrisCount; });
    debrisIncrementBtn.addEventListener('click', () => { sim.debrisCount = Math.min(100, sim.debrisCount + 10); debrisCountInput.value = sim.debrisCount; });
    debrisCountInput.addEventListener('input', (e) => { sim.debrisCount = Math.max(0, Math.min(100, parseInt(e.target.value) || 0)); });

    resetButton.addEventListener('click', () => { handleFirstInteraction(); initializeSimulation(); });
    pauseButton.addEventListener('click', () => {
        handleFirstInteraction();
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
        pauseButton.classList.toggle('paused', isPaused);
        infoElement.textContent = isPaused ? 'Simulation paused.' : 'Planets attract each other and collide. Hit the targets!';
        if (isPaused) { stopAnimation(); pauseBackgroundMusic(); } else { startAnimation(); if (toggleMusicCheckbox.checked) playBackgroundMusic(); }
    });
    function togglePause() { pauseButton.click(); }
    function stopAnimation() { if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; } }
    function startAnimation() { if (!animationFrameId && !isPaused) animationFrameId = requestAnimationFrame(animate); }

    showForceVectorsCheckbox.addEventListener('change', (e) => showForceVectors = e.target.checked);
    showEnergyPredictionCheckbox.addEventListener('change', (e) => { showEnergyPrediction = e.target.checked; if (isDragging && showPrediction) calculateInitialPrediction(); });
    showPredictionCheckbox.addEventListener('change', (e) => { showPrediction = e.target.checked; if (!showPrediction) initialPredictedPath = []; else if (isDragging) calculateInitialPrediction(); });
    showOngoingPredictionCheckbox.addEventListener('change', (e) => { showOngoingPrediction = e.target.checked; if (!showOngoingPrediction) sim.planets.forEach(p => p.ongoingPredictionPath = []); });
    predictionTimeRange.addEventListener('input', (e) => { predictionTime = parseFloat(e.target.value); predictionTimeValueSpan.textContent = predictionTime.toFixed(1); });
    showInteractionRangeCheckbox.addEventListener('change', (e) => { showInteractionRange = e.target.checked; });
    if (showBoundaryCheckbox) {
        showBoundaryCheckbox.addEventListener('change', (e) => { showBoundary = e.target.checked; });
    }
    if (toggleContainmentCheckbox) {
        toggleContainmentCheckbox.addEventListener('change', (e) => {
            sim.containmentEnabled = e.target.checked;
        });
    }

    toggleMusicCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) startDroneMusic(); else stopDroneMusic();
    });
    musicVolumeSlider.addEventListener('input', (e) => {
        if (audioManager) audioManager.setMusicVolume(parseFloat(e.target.value));
    });
    toggleSfxCheckbox.addEventListener('change', (e) => {
        if (audioManager) audioManager.setMasterVolume(e.target.checked ? (parseFloat(sfxVolumeSlider.value) || VIEW_CONFIG.AUDIO.DEFAULT_SFX_VOL) : 0);
    });
    sfxVolumeSlider.addEventListener('input', (e) => {
        if (audioManager && toggleSfxCheckbox.checked) audioManager.setMasterVolume(parseFloat(e.target.value));
    });
    zoomAttenuationSlider.addEventListener('input', (e) => { zoomAttenuationValueSpan.textContent = e.target.value; });

    trackingModeCheckbox.addEventListener('change', (e) => { isTracking = e.target.checked; trackedPlanetSelect.classList.toggle('hidden', !isTracking); if (!isTracking) trackedPlanetId = null; else updateTrackedPlanetSelect(); });
    trackedPlanetSelect.addEventListener('change', (e) => { trackedPlanetId = e.target.value === 'none' ? null : parseInt(e.target.value); });

    window.addEventListener('keydown', (e) => {
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
        const key = e.key.toLowerCase();
        keysPressed[key] = true;
        if (['w', 'a', 's', 'd'].includes(key)) { if (isTracking) { isTracking = false; trackingModeCheckbox.checked = false; trackedPlanetSelect.classList.add('hidden'); } }
    });
    window.addEventListener('keyup', (e) => keysPressed[e.key.toLowerCase()] = false);
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; drawStaticElements(); });

    // FPS Monitor
    function startFpsMonitor() {
        let lastFrameTime = performance.now();
        function updateFps() {
            const now = performance.now();
            const delta = now - lastFrameTime;
            lastFrameTime = now;
            const fps = 1000 / delta;
            currentFps = currentFps * 0.9 + fps * 0.1;
            const fpsCounter = document.getElementById('fpsCounter');
            if (fpsCounter) fpsCounter.textContent = `FPS: ${currentFps.toFixed(1)}`;
            requestAnimationFrame(updateFps);
        }
        updateFps();
    }

    // Init
    gConstantValueSpan.textContent = sim.G;
    trailLengthValueSpan.textContent = sim.maxTrailLength;
    debrisCountInput.value = sim.debrisCount;
    starMassValueSpan.textContent = nextStarMass;
    starOptionsDiv.classList.toggle('hidden', creationMode !== 'star');
    musicVolumeSlider.value = VIEW_CONFIG.AUDIO.DEFAULT_MUSIC_VOL;
    zoomAttenuationSlider.value = VIEW_CONFIG.AUDIO.ZOOM_ATTENUATION;
    zoomAttenuationValueSpan.textContent = zoomAttenuationSlider.value;
    // Panel Toggle
    if (toggleControlsBtn && controlsDiv) {
        toggleControlsBtn.addEventListener('click', () => {
            controlsDiv.classList.toggle('hidden-panel');
        });
    }

    initializeSimulation();
    startFpsMonitor();
    console.log("App ready.");
});