// 3D name renderer — vanilla three.js engine
// Exposes window.NameRenderer; signals readiness via 'renderer-ready' event.

import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const FONT_URLS = {
  helvetiker:        'https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json',
  helvetiker_bold:   'https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json',
  gentilis:          'https://unpkg.com/three@0.160.0/examples/fonts/gentilis_regular.typeface.json',
  gentilis_bold:     'https://unpkg.com/three@0.160.0/examples/fonts/gentilis_bold.typeface.json',
  optimer:           'https://unpkg.com/three@0.160.0/examples/fonts/optimer_regular.typeface.json',
  optimer_bold:      'https://unpkg.com/three@0.160.0/examples/fonts/optimer_bold.typeface.json',
  droid_sans:        'https://unpkg.com/three@0.160.0/examples/fonts/droid/droid_sans_regular.typeface.json',
  droid_serif:       'https://unpkg.com/three@0.160.0/examples/fonts/droid/droid_serif_regular.typeface.json',
};
window.FONT_OPTIONS = Object.keys(FONT_URLS);

const fontLoader = new FontLoader();
const fontCache = {};
function loadFont(name) {
  if (fontCache[name]) return Promise.resolve(fontCache[name]);
  return new Promise((resolve, reject) => {
    fontLoader.load(FONT_URLS[name] || FONT_URLS.helvetiker_bold,
      f => { fontCache[name] = f; resolve(f); }, undefined, reject);
  });
}

class NameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();

    const w = canvas.clientWidth || 800;
    const h = canvas.clientHeight || 600;

    this.camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 200);
    this.camera.position.set(0, 0.6, 10);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Reflective environment so metal/glass have something to reflect
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 30;

    this.lights = [];
    this.textMesh = null;
    this.settings = null;
    this.running = true;

    this.animate = this.animate.bind(this);
    this.animate();

    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this._ro = new ResizeObserver(() => this.resize());
    this._ro.observe(canvas);
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    if (!this.running) return;
    requestAnimationFrame(this.animate);
    if (this.settings?.autoRotate && this.textMesh) {
      this.textMesh.rotation.y += 0.0055 * (this.settings.rotateSpeed ?? 1);
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  setLighting(preset) {
    this.lights.forEach(l => this.scene.remove(l));
    this.lights = [];
    const add = (l) => { this.scene.add(l); this.lights.push(l); };

    if (preset === 'studio') {
      add(new THREE.AmbientLight(0xffffff, 0.5));
      const k = new THREE.DirectionalLight(0xffffff, 2.0); k.position.set(3, 5, 4); add(k);
      const f = new THREE.DirectionalLight(0xffffff, 0.7); f.position.set(-4, 2, 3); add(f);
      const r = new THREE.DirectionalLight(0xffffff, 0.9); r.position.set(0, 3, -5); add(r);
    } else if (preset === 'sunset') {
      add(new THREE.AmbientLight(0xffd0a0, 0.45));
      const k = new THREE.DirectionalLight(0xff7a3d, 2.2); k.position.set(4, 3, 4); add(k);
      const r = new THREE.DirectionalLight(0x4f7cff, 1.4); r.position.set(-3, 1, -3); add(r);
    } else if (preset === 'neon') {
      add(new THREE.AmbientLight(0x101030, 0.4));
      const pink = new THREE.PointLight(0xff4fb0, 8, 25); pink.position.set(-4, 2, 3); add(pink);
      const cyan = new THREE.PointLight(0x4ffff0, 8, 25); cyan.position.set(4, -1, 3); add(cyan);
      const b = new THREE.DirectionalLight(0xffffff, 0.3); b.position.set(0, 5, -5); add(b);
    } else if (preset === 'drama') {
      add(new THREE.AmbientLight(0xffffff, 0.12));
      const k = new THREE.DirectionalLight(0xffffff, 3.5); k.position.set(2, 6, 3); add(k);
      const r = new THREE.DirectionalLight(0x8090ff, 0.55); r.position.set(0, 1, -4); add(r);
    } else if (preset === 'soft') {
      add(new THREE.AmbientLight(0xffffff, 1.2));
      const k = new THREE.DirectionalLight(0xffffff, 0.7); k.position.set(2, 4, 4); add(k);
    } else {
      add(new THREE.AmbientLight(0xffffff, 0.8));
      const k = new THREE.DirectionalLight(0xffffff, 1.2); k.position.set(3, 4, 5); add(k);
    }
  }

  buildMaterial(m) {
    const color = new THREE.Color(m.color || '#C8FF3D');
    switch (m.preset) {
      case 'matte':
        return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0 });
      case 'metal':
        return new THREE.MeshStandardMaterial({ color, roughness: 0.22, metalness: 1 });
      case 'chrome':
        return new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.02, metalness: 1 });
      case 'plastic':
        return new THREE.MeshPhysicalMaterial({ color, roughness: 0.45, metalness: 0.05, clearcoat: 0.7, clearcoatRoughness: 0.2 });
      case 'glass':
        return new THREE.MeshPhysicalMaterial({ color, roughness: 0.05, transmission: 1, ior: 1.45, thickness: 0.5, metalness: 0 });
      case 'neon':
        return new THREE.MeshStandardMaterial({ color: 0x080808, emissive: color, emissiveIntensity: 1.6, roughness: 0.4 });
      case 'toon':
        return new THREE.MeshToonMaterial({ color });
      case 'wireframe':
        return new THREE.MeshBasicMaterial({ color, wireframe: true });
      case 'gold':
        return new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 1 });
      default:
        return new THREE.MeshStandardMaterial({ color });
    }
  }

  async update(settings) {
    this.settings = settings;
    const font = await loadFont(settings.font);
    if (this.settings !== settings) return; // a newer update queued

    // Tear down old mesh
    if (this.textMesh) {
      this.scene.remove(this.textMesh);
      this.textMesh.geometry?.dispose();
      this.textMesh.material?.dispose();
      this.textMesh = null;
    }

    const text = (settings.text && settings.text.length) ? settings.text : ' ';
    let geom;
    try {
      geom = new TextGeometry(text, {
        font,
        size: settings.size,
        height: settings.depth,
        curveSegments: 10,
        bevelEnabled: !!(settings.bevel?.enabled),
        bevelSize: settings.bevel?.size ?? 0.02,
        bevelThickness: settings.bevel?.thickness ?? 0.03,
        bevelSegments: 4,
      });
      geom.center();
    } catch (e) {
      console.warn('geometry error', e);
      return;
    }

    const mat = this.buildMaterial(settings.material || { preset: 'matte', color: '#C8FF3D' });
    this.textMesh = new THREE.Mesh(geom, mat);
    this.scene.add(this.textMesh);

    this.setLighting(settings.lighting || 'studio');

    const bg = settings.background || { type: 'solid', color: '#0E0E10' };
    if (bg.type === 'transparent') {
      this.scene.background = null;
      this.renderer.setClearColor(0x000000, 0);
    } else if (bg.type === 'gradient') {
      const tex = this.gradientTexture(bg.color || '#FF4FB0', bg.color2 || '#4F7CFF');
      this.scene.background = tex;
      this.renderer.setClearColor(0x000000, 1);
    } else {
      this.scene.background = new THREE.Color(bg.color || '#0E0E10');
      this.renderer.setClearColor(this.scene.background, 1);
    }
  }

  gradientTexture(c1, c2) {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  resetCamera() {
    this.camera.position.set(0, 0.6, 10);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  fitToText() {
    if (!this.textMesh) return;
    const bb = new THREE.Box3().setFromObject(this.textMesh);
    const size = new THREE.Vector3();
    bb.getSize(size);
    const maxDim = Math.max(size.x, size.y);
    const dist = Math.max(6, (maxDim / 2) / Math.tan((this.camera.fov * Math.PI / 180) / 2) * 1.35);
    this.camera.position.set(0, 0.6, dist);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  exportPNG({ width, height, transparent }) {
    // Save state
    const w0 = this.canvas.clientWidth;
    const h0 = this.canvas.clientHeight;
    const bg0 = this.scene.background;
    const alpha0 = this.renderer.getClearAlpha();
    const color0 = new THREE.Color();
    this.renderer.getClearColor(color0);
    const ratio0 = this.renderer.getPixelRatio();

    // Apply target
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    if (transparent) {
      this.scene.background = null;
      this.renderer.setClearColor(0x000000, 0);
    }

    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');

    // Restore
    this.renderer.setPixelRatio(ratio0);
    this.renderer.setSize(w0, h0, false);
    this.camera.aspect = w0 / h0;
    this.camera.updateProjectionMatrix();
    this.scene.background = bg0;
    this.renderer.setClearColor(color0, alpha0);
    this.renderer.render(this.scene, this.camera);

    return dataUrl;
  }

  dispose() {
    this.running = false;
    window.removeEventListener('resize', this.resize);
    this._ro?.disconnect();
    this.renderer.dispose();
  }
}

window.NameRenderer = NameRenderer;
window.dispatchEvent(new Event('renderer-ready'));
