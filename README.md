# Gravity Simulation v7.7 - With Sound 🌌

A highly interactive and visually stunning N-body gravity simulation built with Vanilla JavaScript and HTML5 Canvas. Create your own solar systems, observe the dance of celestial bodies, and experiment with the laws of physics.

![Gravity Simulation Preview](https://via.placeholder.com/800x450?text=Gravity+Simulation+v7.7+Preview) <!-- Replace with real screenshot if possible -->

## ✨ Features

-   **Realistic Physics**: Accurate N-body gravity simulation with adjustable constants.
-   **Creation Modes**:
    -   🌑 **Planets**: Launch planets with custom velocity.
    -   ☀️ **Stars**: Place massive stars that act as gravitational anchors (colored by mass: small red dwarfs, medium yellow stars, large blue giants).
    -   🛰️ **Generators**: Automatically spawn planets at intervals (supports stable orbits).
    -   🕳️ **Black Holes**: Massive absorbers that teleport objects to White Holes.
    -   ⚪ **White Holes**: Ejection points for objects captured by Black Holes.
    -   ❌ **Delete**: Remove individual stars, generators, planets, or black/white holes by clicking on them.
-   **Collision Dynamics**:
    -   💥 **Explosion**: Objects shatter into debris upon impact.
    -   🤝 **Merging**: Massive objects consume smaller ones, growing in size.
-   **Advanced Visualization**:
    -   Orbit & Future Path predictions.
    -   Force vectors & Interaction ranges.
    -   Collision warnings.
    -   Dynamic grid & World boundaries.
-   **Immersive Audio**:
    -   Procedural SFX for launches, collisions, and celestial events.
    -   Ambient "Proximity Hiss" near massive bodies.
    -   Cinematic background soundtrack.
-   **Premium UI**:
    -   Sleek glassmorphism sidebar.
    -   Object tracking HUD with real-time telemetry.
    -   Smooth camera controls (zoom, pan, follow).

## 🚀 Getting Started

No installation required! Just open `index.html` in any modern web browser.

### Controls:
-   **Left Click + Drag**: Launch a planet (drag length = velocity).
-   **Right Click / Middle Click**: Pan the view.
-   **Mouse Wheel**: Zoom in/out.
-   **Click on Planet**: Track/Follow the object.
-   **W/A/S/D**: Move the camera manually.

## 🛠️ Tech Stack

-   **Core**: HTML5, Vanilla JavaScript.
-   **Rendering**: HTML5 Canvas (2D Context).
-   **Audio**: Web Audio API.
-   **Styling**: Vanilla CSS (Custom properties, Flexbox, Glassmorphism).

## 📂 Project Structure

-   `index.html`: Main entry point and UI structure.
-   `styles.css`: Modern UI styling and animations.
-   `script.js`: UI logic, input handling, and rendering bridge.
-   `simulation.js`: Core physics engine and simulation logic.
-   `audio.js`: Modular audio synthesis and music management.
-   `textures/`: Assets for planetary surfaces.

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---
Developed with ❤️ by **WowkDigital**
