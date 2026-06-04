const SIMULATION_CONFIG = {
    DEFAULT_G: 2000,
    DT: 0.016,
    MAX_TRAIL_LENGTH: 80,
    PLANET_INTERACTION_RANGE: 700,
    DEBRIS: {
        COUNT: 50,
        MASS: 100,
        RADIUS: 1.5,
        LIFETIME: 60,
        MAX_EXPLOSION_SPEED: 1
    },
    TARGET: {
        RADIUS: 15,
        MIN_DISTANCE: 300,
        MAX_DISTANCE: 1500
    },
    PLANET: {
        RADIUS_EXPONENT: 0.4,
        RADIUS_MULTIPLIER: 1.6 // Derived from 0.8 * 2
    },
    GENERATOR: {
        LAUNCH_SPEED_MIN: 100,
        LAUNCH_SPEED_VAR: 300
    },
    MAX_DISTANCE_FROM_CENTER: 12000,
    STAR: {
        BASE_MASS: 400000,
        BASE_COLOR: 'hsl(60, 90%, 60%)'
    },
    CONTAINMENT: {
        ENABLED: true,
        RADIUS: 8000,
        STRENGTH: 30
    },
    WHITE_HOLE: {
        MAX_EXIT_VELOCITY: 300
    },
    COLLISION: {
        MODE: 'explode', // 'explode' or 'merge'
        MERGE_MAX_MASS: 100000,
        MERGE_MASS_DECAY: 5,// mass units per second
        MERGE_EFFICIENCY: 0.8 // 80% of mass is kept, 20% lost during merge
    }

};

class Planet {
    constructor(id, x, y, vx, vy, mass, radius, color, isDebris = false, lifetime = Infinity) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.mass = mass;
        this.radius = radius;
        this.color = color || 'lightblue';
        this.trail = [];
        this.maxTrailLength = SIMULATION_CONFIG.MAX_TRAIL_LENGTH;
        this.isDebris = isDebris;
        this.lifetime = lifetime;
        this.ax = 0;
        this.ay = 0;
        this.isBound = null;
        this.ongoingPredictionPath = [];
        this.textureIndex = -1; // -1 means no texture or random assignment needed by renderer
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }

    update(dt, ax, ay) {
        this.ax = ax;
        this.ay = ay;
        if (this.isDebris) {
            this.lifetime -= dt;
            if (this.lifetime <= 0) return false;
        }
        this.vx += ax * dt;
        this.vy += ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed;

        if (!this.isDebris) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.maxTrailLength) this.trail.shift();
        }
        return true;
    }

    calculateStarGravityForce(stars, G) {
        let tFX = 0, tFY = 0;
        for (const star of stars) {
            const dx = star.x - this.x;
            const dy = star.y - this.y;
            const dSq = (dx * dx) + (dy * dy);
            if (dSq === 0) continue;
            const dVal = Math.sqrt(dSq);
            const fM = (G * star.mass * this.mass) / dSq;
            tFX += (fM * dx) / dVal;
            tFY += (fM * dy) / dVal;
        }
        return { fx: tFX, fy: tFY };
    }
}

class Generator {
    constructor(x, y, angle, interval, color, mode = 'normal', limit = 0, launchSpeed = 300) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.interval = interval;
        this.lastSpawnTime = 0;
        this.color = color;
        this.mode = mode; // 'normal' or 'stable'
        this.limit = limit; // 0 means infinite
        this.spawnedCount = 0;
        this.launchSpeed = launchSpeed;
    }
}

class GravitySimulation {
    constructor() {
        this.stars = [];
        this.planets = [];
        this.generators = [];
        this.G = SIMULATION_CONFIG.DEFAULT_G;
        this.dt = SIMULATION_CONFIG.DT;
        this.planetIdCounter = 0;
        this.target = { x: 0, y: 0, radius: SIMULATION_CONFIG.TARGET.RADIUS, color: 'hsl(0, 100%, 60%)', isActive: false };
        this.score = 0;
        this.planetInteractionRange = SIMULATION_CONFIG.PLANET_INTERACTION_RANGE;
        this.debrisCount = SIMULATION_CONFIG.DEBRIS.COUNT;
        this.callbacks = {
            onCollision: null,
            onTargetHit: null,
            onStarCollision: null,
            onPlanetSpawn: null
        };
        this.maxTrailLength = SIMULATION_CONFIG.MAX_TRAIL_LENGTH;
        this.containmentEnabled = SIMULATION_CONFIG.CONTAINMENT.ENABLED;
        this.containmentRadius = SIMULATION_CONFIG.CONTAINMENT.RADIUS;
        this.containmentEnabled = SIMULATION_CONFIG.CONTAINMENT.ENABLED;
        this.containmentRadius = SIMULATION_CONFIG.CONTAINMENT.RADIUS;
        this.containmentStrength = SIMULATION_CONFIG.CONTAINMENT.STRENGTH;
        this.collisionMode = SIMULATION_CONFIG.COLLISION.MODE;
        this.mergeMaxMass = SIMULATION_CONFIG.COLLISION.MERGE_MAX_MASS;
        this.mergeMassDecay = SIMULATION_CONFIG.COLLISION.MERGE_MASS_DECAY;
        this.noPlanetMergeMassLimit = false;
        this.disableMassDecay = false;
        this.disableWorldBoundary = false;
    }

    init() {
        this.stars = [];
        this.planets = [];
        this.generators = [];
        this.blackHoles = []; // Added
        this.whiteHoles = []; // Added
        this.score = 0;
        this.spawnTarget();
    }

    setGravityConstant(newG) {
        this.G = newG;
    }

    setDt(newDt) {
        this.dt = newDt;
    }

    setMaxTrailLength(length) {
        this.maxTrailLength = length;
        this.planets.forEach(p => p.maxTrailLength = length);
    }

    addStar(x, y, mass, radius, color, isStatic = true, isInitialSun = false) {
        const s = {
            x: x, y: y, mass: mass, radius: radius, color: color,
            isStatic: isStatic, isInitialSun: isInitialSun
        };
        this.stars.push(s);
        return s;
    }

    addBlackHole(x, y, mass, radius) {
        const bh = { x, y, mass, radius, type: 'black-hole' };
        this.blackHoles.push(bh);
        return bh;
    }

    addWhiteHole(x, y, radius) {
        const wh = { x, y, radius, type: 'white-hole' };
        this.whiteHoles.push(wh);
        return wh;
    }

    addPlanet(x, y, vx, vy, mass, radius, color, isDebris = false, lifetime = Infinity) {
        const p = new Planet(this.planetIdCounter++, x, y, vx, vy, mass, radius, color, isDebris, lifetime);
        p.maxTrailLength = this.maxTrailLength;
        // Assign texture index signal (randomly 0-9 for non-debris)
        if (!isDebris) {
            p.textureIndex = Math.floor(Math.random() * 10);
        }
        this.planets.push(p);
        return p;
    }

    addGenerator(x, y, angle, interval, color, mode = 'normal', limit = 0, launchSpeed = 300) {
        const gen = new Generator(x, y, angle, interval, color, mode, limit, launchSpeed);
        this.generators.push(gen);
        return gen;
    }

    clearGenerators() {
        this.generators = [];
    }

    clearStars() {
        this.stars = [];
    }

    clearPlanets() {
        this.planets = [];
    }

    removeElementAt(x, y, maxDistance) {
        let closestElement = null;
        let closestDist = Infinity;
        let elementType = null; // 'star', 'planet', 'generator', 'black-hole', 'white-hole'
        let elementIndex = -1;

        // Check generators
        for (let i = 0; i < this.generators.length; i++) {
            const gen = this.generators[i];
            const dx = gen.x - x;
            const dy = gen.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const clickRadius = Math.max(25, maxDistance);
            if (dist < clickRadius && dist < closestDist) {
                closestDist = dist;
                closestElement = gen;
                elementType = 'generator';
                elementIndex = i;
            }
        }

        // Check stars
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            const dx = star.x - x;
            const dy = star.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const clickRadius = Math.max(star.radius, maxDistance);
            if (dist < clickRadius && dist < closestDist) {
                closestDist = dist;
                closestElement = star;
                elementType = 'star';
                elementIndex = i;
            }
        }

        // Check black holes
        for (let i = 0; i < this.blackHoles.length; i++) {
            const bh = this.blackHoles[i];
            const dx = bh.x - x;
            const dy = bh.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const clickRadius = Math.max(bh.radius, maxDistance);
            if (dist < clickRadius && dist < closestDist) {
                closestDist = dist;
                closestElement = bh;
                elementType = 'black-hole';
                elementIndex = i;
            }
        }

        // Check white holes
        for (let i = 0; i < this.whiteHoles.length; i++) {
            const wh = this.whiteHoles[i];
            const dx = wh.x - x;
            const dy = wh.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const clickRadius = Math.max(wh.radius, maxDistance);
            if (dist < clickRadius && dist < closestDist) {
                closestDist = dist;
                closestElement = wh;
                elementType = 'white-hole';
                elementIndex = i;
            }
        }

        // Check planets (excluding debris)
        for (let i = 0; i < this.planets.length; i++) {
            const p = this.planets[i];
            if (p.isDebris) continue;
            const dx = p.x - x;
            const dy = p.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const clickRadius = Math.max(p.radius, maxDistance);
            if (dist < clickRadius && dist < closestDist) {
                closestDist = dist;
                closestElement = p;
                elementType = 'planet';
                elementIndex = i;
            }
        }

        if (closestElement !== null) {
            if (elementType === 'generator') {
                this.generators.splice(elementIndex, 1);
            } else if (elementType === 'star') {
                this.stars.splice(elementIndex, 1);
            } else if (elementType === 'black-hole') {
                this.blackHoles.splice(elementIndex, 1);
            } else if (elementType === 'white-hole') {
                this.whiteHoles.splice(elementIndex, 1);
            } else if (elementType === 'planet') {
                this.planets.splice(elementIndex, 1);
            }
            return true;
        }

        return false;
    }

    spawnTarget() {
        this.target.isActive = true;
        const minDistance = SIMULATION_CONFIG.TARGET.MIN_DISTANCE;
        const maxDistance = SIMULATION_CONFIG.TARGET.MAX_DISTANCE;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random()) * (maxDistance - minDistance) + minDistance;
        this.target.x = Math.cos(angle) * dist;
        this.target.y = Math.sin(angle) * dist;
        this.target.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
    }

    calculateTotalEnergy(p) {
        const speedSq = p.vx ** 2 + p.vy ** 2;
        const kineticEnergy = 0.5 * p.mass * speedSq;
        let potentialEnergy = 0;
        // Stars and Black Holes attract
        const attractors = [...this.stars, ...this.blackHoles];
        for (const star of attractors) {
            const dx = p.x - star.x;
            const dy = p.y - star.y;
            const r = Math.sqrt(dx * dx + dy * dy);
            if (r > 0) {
                potentialEnergy += -this.G * star.mass * p.mass / r;
            } else { return -Infinity; }
        }
        return kineticEnergy + potentialEnergy;
    }

    calculateOngoingTrajectory(planet, durationSeconds) {
        if (planet.isDebris) { planet.ongoingPredictionPath = []; return; }
        let path = [];
        let ghost = {
            x: planet.x, y: planet.y, vx: planet.vx, vy: planet.vy,
            mass: planet.mass, radius: planet.radius
        };
        path.push({ x: ghost.x, y: ghost.y, isMarker: false });

        const steps = Math.max(1, Math.round(durationSeconds / this.dt));
        const stepsPerSecond = Math.round(1.0 / this.dt);
        const attractors = [...this.stars, ...this.blackHoles];

        for (let i = 0; i < steps; i++) {
            let tFX = 0, tFY = 0;
            let hitAbsorber = false;
            for (const att of attractors) {
                const dx = att.x - ghost.x;
                const dy = att.y - ghost.y;
                const dSq = dx * dx + dy * dy;
                if (dSq < (att.radius + ghost.radius) ** 2) {
                    hitAbsorber = true;
                    break;
                }
                const dVal = Math.sqrt(dSq);
                const fM = (this.G * att.mass * ghost.mass) / dSq;
                tFX += (fM * dx) / dVal;
                tFY += (fM * dy) / dVal;
            }
            if (hitAbsorber) break;

            const ax = tFX / ghost.mass;
            const ay = tFY / ghost.mass;
            ghost.vx += ax * this.dt;
            ghost.vy += ay * this.dt;
            ghost.x += ghost.vx * this.dt;
            ghost.y += ghost.vy * this.dt;

            const isMarker = ((i + 1) % stepsPerSecond === 0);
            path.push({ x: ghost.x, y: ghost.y, isMarker: isMarker });
        }
        planet.ongoingPredictionPath = path;
    }

    update(currentTime) {
        let planetsToRemoveIndices = new Set();
        let deadPlanetIds = new Set();

        // Generators Logic
        let activeGenerators = [];
        for (const gen of this.generators) {
            if (gen.limit > 0 && gen.spawnedCount >= gen.limit) {
                continue;
            }

            if (currentTime - gen.lastSpawnTime > gen.interval) {
                gen.lastSpawnTime = currentTime;

                let pVx, pVy;

                if (gen.mode === 'stable' && this.stars.length > 0) {
                    let nearestStar = null;
                    let minDistSq = Infinity;
                    for (const star of this.stars) {
                        const dx = star.x - gen.x;
                        const dy = star.y - gen.y;
                        const dSq = dx * dx + dy * dy;
                        if (dSq < minDistSq) {
                            minDistSq = dSq;
                            nearestStar = star;
                        }
                    }

                    const dist = Math.sqrt(minDistSq);
                    if (dist > 0) {
                        const speed = Math.sqrt((this.G * nearestStar.mass) / dist);
                        const dx = gen.x - nearestStar.x;
                        const dy = gen.y - nearestStar.y;
                        const deviationAngle = (Math.random() - 0.5) * 0.1;
                        const speedMult = 0.95 + Math.random() * 0.1;

                        const cosA = Math.cos(deviationAngle);
                        const sinA = Math.sin(deviationAngle);

                        let tx = -dy / dist;
                        let ty = dx / dist;

                        pVx = tx * speed * speedMult;
                        pVy = ty * speed * speedMult;

                        const finalVx = pVx * cosA - pVy * sinA;
                        const finalVy = pVx * sinA + pVy * cosA;
                        pVx = finalVx;
                        pVy = finalVy;
                    } else {
                        pVx = 0; pVy = 0;
                    }
                } else {
                    const coneHalfAngle = (Math.PI / 32); // Narrower launch cone for custom launcher
                    const randomAngleOffset = (Math.random() * 2 - 1) * coneHalfAngle;
                    const finalAngle = gen.angle + randomAngleOffset;

                    const launchSpeed = gen.launchSpeed || (Math.random() * SIMULATION_CONFIG.GENERATOR.LAUNCH_SPEED_VAR + SIMULATION_CONFIG.GENERATOR.LAUNCH_SPEED_MIN);

                    pVx = Math.cos(finalAngle) * launchSpeed;
                    pVy = Math.sin(finalAngle) * launchSpeed;
                }

                const randomMass = Math.random() * (200 - 50) + 50;
                const radius = Math.pow(randomMass, SIMULATION_CONFIG.PLANET.RADIUS_EXPONENT) * SIMULATION_CONFIG.PLANET.RADIUS_MULTIPLIER;

                this.addPlanet(gen.x, gen.y, pVx, pVy, randomMass, radius, `hsl(${Math.random() * 360}, 70%, 70%)`);
                if (this.callbacks.onPlanetSpawn) this.callbacks.onPlanetSpawn();

                gen.spawnedCount++;
            }

            if (gen.limit === 0 || gen.spawnedCount < gen.limit) {
                activeGenerators.push(gen);
            }
        }
        this.generators = activeGenerators;

        const cellSize = this.planetInteractionRange;
        const grid = new Map();

        for (const p of this.planets) {
            p.tempAx = 0;
            p.tempAy = 0;
            p.isDead = false;

            const cellKey = `${Math.floor(p.x / cellSize)},${Math.floor(p.y / cellSize)}`;
            if (!grid.has(cellKey)) grid.set(cellKey, []);
            grid.get(cellKey).push(p);
        }

        for (let i = 0; i < this.planets.length; i++) {
            const p1 = this.planets[i];

            // 1. Star Collisions
            for (const star of this.stars) {
                const dx = p1.x - star.x;
                const dy = p1.y - star.y;
                const dSqToStar = dx * dx + dy * dy;
                if (dSqToStar < (p1.radius + star.radius) ** 2) {
                    planetsToRemoveIndices.add(i);
                    deadPlanetIds.add(p1.id);
                    p1.isDead = true;
                    if (this.callbacks.onStarCollision && !p1.isDebris) this.callbacks.onStarCollision(p1, star);
                    break;
                }
            }
            if (p1.isDead) continue;

            // 1a. Black Hole Teleportation
            let teleported = false;
            for (const bh of this.blackHoles) {
                const dx = p1.x - bh.x;
                const dy = p1.y - bh.y;
                const dSq = dx * dx + dy * dy;
                if (dSq < (p1.radius + bh.radius) ** 2) {
                    if (this.whiteHoles.length > 0) {
                        const wh = this.whiteHoles[Math.floor(Math.random() * this.whiteHoles.length)];
                        const angle = Math.random() * Math.PI * 2;
                        const dist = wh.radius + p1.radius + 10;
                        p1.x = wh.x + Math.cos(angle) * dist;
                        p1.y = wh.y + Math.sin(angle) * dist;
                        teleported = true;

                        // Velocity clamping with direction preservation
                        const speed = Math.sqrt(p1.vx * p1.vx + p1.vy * p1.vy);
                        const maxSpeed = SIMULATION_CONFIG.WHITE_HOLE.MAX_EXIT_VELOCITY;
                        if (speed > maxSpeed && speed > 0) {
                            const factor = maxSpeed / speed;
                            p1.vx *= factor;
                            p1.vy *= factor;
                        }
                        break;
                    } else {
                        // Absorbed if no white hole
                        planetsToRemoveIndices.add(i);
                        deadPlanetIds.add(p1.id);
                        p1.isDead = true;
                        break;
                    }
                }
            }
            if (p1.isDead) continue;
            if (teleported) continue;

            // 2. Star & Black Hole Gravity
            const attractors = [...this.stars, ...this.blackHoles];
            const attractorForce = p1.calculateStarGravityForce(attractors, this.G);
            p1.tempAx += attractorForce.fx / p1.mass;
            p1.tempAy += attractorForce.fy / p1.mass;

            // 3. Planet Interaction
            const gx = Math.floor(p1.x / cellSize);
            const gy = Math.floor(p1.y / cellSize);
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const key = `${gx + dx},${gy + dy}`;
                    const neighbors = grid.get(key);
                    if (!neighbors) continue;
                    for (const p2 of neighbors) {
                        if (p1.id >= p2.id) continue;
                        if (p2.isDead) continue;
                        const distX = p2.x - p1.x;
                        const distY = p2.y - p1.y;
                        const dSq = distX * distX + distY * distY;
                        if (dSq > 0 && dSq < this.planetInteractionRange * this.planetInteractionRange) {
                            if (dSq <= (p1.radius + p2.radius) ** 2) continue;
                            const dVal = Math.sqrt(dSq);
                            const fM = (this.G * p1.mass * p2.mass) / dSq;
                            const fx = (fM * distX) / dVal;
                            const fy = (fM * distY) / dVal;
                            p1.tempAx += fx / p1.mass;
                            p1.tempAy += fy / p1.mass;
                            p2.tempAx -= fx / p2.mass;
                            p2.tempAy -= fy / p2.mass;
                        }
                    }
                }
            }

            // 4. Containment
            if (this.containmentEnabled) {
                const distSq = p1.x * p1.x + p1.y * p1.y;
                if (distSq > this.containmentRadius * this.containmentRadius) {
                    const dist = Math.sqrt(distSq);
                    const unitX = p1.x / dist;
                    const unitY = p1.y / dist;
                    p1.tempAx -= unitX * this.containmentStrength;
                    p1.tempAy -= unitY * this.containmentStrength;
                }
            }
        }

        let nextFramePlanets = [];
        for (let i = 0; i < this.planets.length; i++) {
            const p = this.planets[i];
            if (p.isDead) continue;

            // Mass Decay for Merged/Huge Planets
            // Only if merge mode is active, or user requested it generally. 
            // "mass should slowly decay over time"
            if (!this.disableMassDecay && this.collisionMode === 'merge' && !p.isDebris && p.mass > 100) {
                p.mass -= this.mergeMassDecay * this.dt;
                if (p.mass < 50) p.mass = 50; // clamp min mass
                // Update radius
                p.radius = Math.pow(p.mass, SIMULATION_CONFIG.PLANET.RADIUS_EXPONENT) * SIMULATION_CONFIG.PLANET.RADIUS_MULTIPLIER;
            }

            if (p.update(this.dt, p.tempAx, p.tempAy)) {
                if (this.disableWorldBoundary || (p.x * p.x + p.y * p.y < SIMULATION_CONFIG.MAX_DISTANCE_FROM_CENTER ** 2)) {
                    if (!p.isDebris) p.isBound = (this.calculateTotalEnergy(p) < 0);
                    nextFramePlanets.push(p);
                }
            }
        }
        this.planets = nextFramePlanets;

        // Collisions
        const collisionGrid = new Map();
        for (const p of this.planets) {
            const key = `${Math.floor(p.x / cellSize)},${Math.floor(p.y / cellSize)}`;
            if (!collisionGrid.has(key)) collisionGrid.set(key, []);
            collisionGrid.get(key).push(p);
        }

        // Create a fast lookup map for planet indices
        const planetIndexMap = new Map();
        for (let i = 0; i < this.planets.length; i++) {
            planetIndexMap.set(this.planets[i], i);
        }

        let finalPlanets = [];
        let collidedIndices = new Set();
        for (let i = 0; i < this.planets.length; i++) {
            if (collidedIndices.has(i)) continue;
            const p1 = this.planets[i];
            if (p1.isDebris) { finalPlanets.push(p1); continue; }
            const gx = Math.floor(p1.x / cellSize), gy = Math.floor(p1.y / cellSize);
            let collided = false;
            for (let dx = -1; dx <= 1 && !collided; dx++) {
                for (let dy = -1; dy <= 1 && !collided; dy++) {
                    const neighbors = collisionGrid.get(`${gx + dx},${gy + dy}`);
                    if (!neighbors) continue;
                    for (const p2 of neighbors) {
                        if (p1 === p2 || p1.id >= p2.id || p2.isDebris) continue;
                        const p2Idx = planetIndexMap.get(p2);
                        if (p2Idx === undefined || collidedIndices.has(p2Idx)) continue;
                        const distSq = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
                        if (distSq < (p1.radius + p2.radius) ** 2) {
                            collidedIndices.add(i); collidedIndices.add(p2Idx);
                            collided = true;
                            if (this.callbacks.onCollision) this.callbacks.onCollision(p1, p2);

                            const cX = (p1.x * p1.mass + p2.x * p2.mass) / (p1.mass + p2.mass);
                            const cY = (p1.y * p1.mass + p2.y * p2.mass) / (p1.mass + p2.mass);
                            const avgVx = (p1.vx * p1.mass + p2.vx * p2.mass) / (p1.mass + p2.mass);
                            const avgVy = (p1.vy * p1.mass + p2.vy * p2.mass) / (p1.mass + p2.mass);

                            if (this.collisionMode === 'explode') {
                                for (let k = 0; k < this.debrisCount; k++) {
                                    const ang = Math.random() * Math.PI * 2, spd = Math.random() * SIMULATION_CONFIG.DEBRIS.MAX_EXPLOSION_SPEED;
                                    finalPlanets.push(new Planet(this.planetIdCounter++, cX, cY, avgVx + Math.cos(ang) * spd, avgVy + Math.sin(ang) * spd,
                                        SIMULATION_CONFIG.DEBRIS.MASS, SIMULATION_CONFIG.DEBRIS.RADIUS, 'grey', true, SIMULATION_CONFIG.DEBRIS.LIFETIME));
                                }
                            } else if (this.collisionMode === 'merge') {
                                // Merge logic with efficiency factor
                                let newMass = (p1.mass + p2.mass) * (SIMULATION_CONFIG.COLLISION.MERGE_EFFICIENCY || 1.0);
                                if (!this.noPlanetMergeMassLimit && newMass > this.mergeMaxMass) {
                                    newMass = this.mergeMaxMass;
                                }
                                const newRadius = Math.pow(newMass, SIMULATION_CONFIG.PLANET.RADIUS_EXPONENT) * SIMULATION_CONFIG.PLANET.RADIUS_MULTIPLIER;
                                // Inherit visual properties from the dominant (more massive) planet
                                const dominant = (p1.mass > p2.mass) ? p1 : p2;
                                const pNew = new Planet(this.planetIdCounter++, cX, cY, avgVx, avgVy, newMass, newRadius, dominant.color);
                                pNew.textureIndex = dominant.textureIndex;
                                pNew.rotation = dominant.rotation;
                                pNew.rotationSpeed = dominant.rotationSpeed;
                                finalPlanets.push(pNew);
                            }
                        }
                    }
                }
            }
            if (!collided) finalPlanets.push(p1);
        }
        this.planets = finalPlanets;

        // Target
        let nonHit = [];
        for (const p of this.planets) {
            if (this.target.isActive && !p.isDebris && (p.x - this.target.x) ** 2 + (p.y - this.target.y) ** 2 < (p.radius + this.target.radius) ** 2) {
                this.score++; this.target.isActive = false; this.spawnTarget();
                if (this.callbacks.onTargetHit) this.callbacks.onTargetHit();
            } else nonHit.push(p);
        }
        this.planets = nonHit;
    }

    predictSystemCollisions(duration) {
        const steps = Math.floor(duration / this.dt);
        let ghosts = this.planets.filter(p => !p.isDebris).map(p => ({ id: p.id, x: p.x, y: p.y, vx: p.vx, vy: p.vy, mass: p.mass, radius: p.radius, crashed: false }));
        let crashedIds = new Set();
        const attractors = [...this.stars, ...this.blackHoles];
        for (let s = 0; s < steps && ghosts.length > 0; s++) {
            const accs = new Float32Array(ghosts.length * 2);
            for (let i = 0; i < ghosts.length; i++) {
                const p1 = ghosts[i]; if (p1.crashed) continue;
                for (const att of attractors) {
                    const dx = att.x - p1.x, dy = att.y - p1.y, dSq = dx * dx + dy * dy;
                    if (dSq < (att.radius + p1.radius) ** 2) { crashedIds.add(p1.id); p1.crashed = true; break; }
                    const dVal = Math.sqrt(dSq), fM = (this.G * att.mass) / dSq;
                    accs[i * 2] += (fM * dx) / dVal; accs[i * 2 + 1] += (fM * dy) / dVal;
                }
                if (p1.crashed) continue;
                for (let j = i + 1; j < ghosts.length; j++) {
                    const p2 = ghosts[j]; if (p2.crashed) continue;
                    const dx = p2.x - p1.x, dy = p2.y - p1.y, dSq = dx * dx + dy * dy;
                    if (dSq < (p1.radius + p2.radius) ** 2) { crashedIds.add(p1.id); crashedIds.add(p2.id); p1.crashed = true; p2.crashed = true; continue; }
                    const dVal = Math.sqrt(dSq);
                    if (dVal < this.planetInteractionRange) {
                        const f = (this.G * p1.mass * p2.mass) / dSq, fx = (f * dx) / dVal, fy = (f * dy) / dVal;
                        accs[i * 2] += fx / p1.mass; accs[i * 2 + 1] += fy / p1.mass;
                        accs[j * 2] -= fx / p2.mass; accs[j * 2 + 1] -= fy / p2.mass;
                    }
                }
            }
            let active = 0;
            for (let i = 0; i < ghosts.length; i++) {
                if (!ghosts[i].crashed) { ghosts[i].vx += accs[i * 2] * this.dt; ghosts[i].vy += accs[i * 2 + 1] * this.dt; ghosts[i].x += ghosts[i].vx * this.dt; ghosts[i].y += ghosts[i].vy * this.dt; active++; }
            }
            if (active === 0) break;
        }
        return crashedIds;
    }
}
