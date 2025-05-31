# 🚀🚀  Three.js Space Game Template

A modern and powerful template for creating space games and interactive 3D applications based on Three.js. Features a complete solar system with realistic planets, advanced camera controls, and modular architecture.

![Space Scene Preview](https://via.placeholder.com/800x400/1a1a2e/00ffff?text=Interactive+Solar+System)

## ✨ Key Features

### 🌌 Space Scene
- **Interactive solar system** with 9 planets and the Sun
- **Realistic AI-generated textures** for Sun, Earth, Mars, and Jupiter
- **Procedural textures** for other planets
- **Orbital movement** of planets with different speeds
- **Planet rings** (Saturn) with animation
- **Star field** with twinkling effect
- **Dynamic lighting** with multiple light sources

### 🎮 Controls and Interactivity
- **WASD camera movement** with fast movement support (Shift)
- **Orbital mouse controls** for rotation and scaling
- **Vertical movement** (Space/Ctrl for up/down)
- **Camera preset system** (1-4 for quick planet transitions)
- **Camera mode switching** (C - orbital/free)
- **Planet clicking** for detailed information
- **Hotkeys** for all main functions

### 🖥️ User Interface
- **Real-time statistics panel** (FPS, objects, triangles)
- **Information panels** about selected planets
- **Control panel** with hotkey hints
- **Mode change notifications**
- **Responsive design** with different resolution support

### 🏗️ Architecture and Technologies
- **Modular structure** with clear separation of concerns
- **Managers** for input (InputManager) and UI (UIManager)
- **Controllers** for camera management (CameraController)
- **Object-oriented classes** for planets and space objects
- **Game loop** with deltaTime for smooth animation
- **Event system** and callbacks

## 🛠️ Tech Stack

- **Three.js** - 3D graphics library
- **Vite** - fast build and hot-reload development
- **ES6+ JavaScript** - modern JavaScript
- **WebGL** - hardware acceleration
- **HTML5 Canvas** - procedural texture generation

## 🚀 Quick Start

### Installation
```bash
# Clone repository
git clone https://github.com/your-username/three-js-space-template.git
cd three-js-space-template

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

### Project Structure
```
src/
├── controllers/        # Controllers (camera)
├── core/              # Core (game loop)
├── managers/          # Managers (input, UI)
├── objects/           # 3D objects (planets, stars)
├── scene/             # Scenes
└── main.js            # Entry point

public/
└── textures/          # Planet textures
```

## 🎯 Controls

| Key/Action | Description |
|------------|-------------|
| **WASD** | Camera movement |
| **Space/Ctrl** | Move up/down |
| **Shift** | Fast movement |
| **C** | Toggle camera mode |
| **V** | Enable/disable WASD |
| **1-4** | Camera presets |
| **Mouse** | Orbital rotation |
| **Mouse wheel** | Zoom |
| **Click** | Select planet |

## 📊 Performance

- **60 FPS** on modern devices
- **Optimized geometry** with LOD
- **Efficient memory management**
- **Adaptive quality** shadows and effects

## 🎨 Customization

### Adding New Planets
```javascript
// In SpaceScene.js
const newPlanet = new Planet({
    name: 'New Planet',
    radius: 3,
    position: [200, 0, 0],
    color: 0xff00ff,
    rotation: { x: 0, y: 0.01, z: 0 },
    orbit: { radius: 200, speed: 0.002 },
    textureUrl: '/textures/my_planet.png'
});
```

### Camera Configuration
```javascript
// In CameraController.js
cameraController.setMoveSpeed(100); // Increase speed
cameraController.addPreset('myView', [100, 50, 100], [0, 0, 0]);
```

### Adding New Effects
```javascript
// In Planet.js - adding atmosphere
createAtmosphere() {
    const atmosphereGeometry = new THREE.SphereGeometry(this.radius * 1.05, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    this.mesh.add(atmosphereMesh);
}
```

## 📱 Use Cases

### 🎮 Game Development
- **Space simulators** - exploring galaxies and planets
- **Strategy games** - managing space empires
- **Arcade games** - fast-paced space battles
- **VR/AR applications** - immersive space travel

### 📚 Education and Science
- **Astronomical simulations** - studying planetary motion
- **Interactive textbooks** - visualizing space phenomena
- **Scientific presentations** - demonstrating space missions
- **Planetariums** - creating virtual planetariums

### 💼 Business and Presentations
- **Interactive presentations** - impressive demonstrations
- **Data visualization** - presenting information in 3D
- **Websites** - stunning landings and portfolios
- **Exhibitions** - interactive stands and installations

### 🔬 Research and Development
- **Prototyping** - rapid 3D concept creation
- **Algorithm visualization** - demonstrating complex calculations
- **Physics simulations** - modeling space processes
- **UI/UX testing** - researching user experience

## 🔧 Advanced Features

### Adding Spaceship
```javascript
// Already prepared in SpaceShip.js
const spaceShip = new SpaceShip();
spaceShip.setPosition(0, 10, 50);
scene.add(spaceShip.getMesh());
```

### Particle System for Comets
```javascript
// Creating comet tail
const particleSystem = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0x00ffff })
);
```

### Skybox for Space Background
```javascript
// Adding cubic skybox
const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
const skyboxMaterial = new THREE.MeshBasicMaterial({
    map: skyboxTexture,
    side: THREE.BackSide
});
```

## 📈 Development Roadmap

- [ ] **Physics engine** - realistic collisions
- [ ] **Sound system** - space sounds and music
- [ ] **Network multiplayer** - collaborative exploration
- [ ] **Procedural generation** - infinite galaxies
- [ ] **VR support** - full immersion
- [ ] **Level editor** - visual scene creation

## 🤝 Contributing

We welcome community contributions! You can:

1. **Report bugs** through Issues
2. **Suggest new features** through Feature Requests
3. **Create Pull Requests** with improvements
4. **Share your projects** based on this template

## 📝 License

MIT License - use freely in personal and commercial projects.

## 🙏 Acknowledgments

- **Three.js Team** - for the amazing 3D library
- **Vite Team** - for fast builds
- **OpenAI** - for generating realistic planet textures
- **Developer community** - for inspiration and support

---

**Created with ❤️ for the developer community**

*Turn your space ideas into reality with Three.js Space Game Template!* 