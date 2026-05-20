<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import TopBar from '$lib/components/TopBar.svelte';
	import { nickName } from '$lib/stores/nick';
	import type * as THREE_T from 'three';

	// =============================================================================
	// STATE
	// =============================================================================
	let canvasEl: HTMLCanvasElement;
	let mobilePanelOpen = $state(false);
	let ready = $state(false);

	// Shared name from the DockedBar store — falls back to 'fancy' if empty so
	// the 3D scene always renders something.
	let text = $state('fancy');
	const unsubText = nickName.subscribe((v) => {
		text = v || 'fancy';
	});
	$effect(() => {
		// Only push real edits back to the store, never the 'fancy' fallback.
		if (text && text !== 'fancy') nickName.set(text);
	});
	onDestroy(() => unsubText());
	let fontKey = $state<keyof typeof FONTS>('helvetiker_bold');

	// Geometry
	let size = $state(60);
	let depth = $state(28);
	let bevelEnabled = $state(true);
	let bevelSize = $state(2);
	let bevelThickness = $state(3);

	// Material
	let materialKey = $state<keyof typeof MATERIALS>('chrome');
	let materialColor = $state('#C8FF3D');

	// Lighting
	let lightingKey = $state<keyof typeof LIGHTING_PRESETS>('studio');

	// Scene background
	let bgType = $state<'solid' | 'gradient' | 'transparent'>('solid');
	let bgColor = $state('#0E0E10');
	let bgColor2 = $state('#4F7CFF');

	// Effects (shader-side; layered ON TOP of material)
	let effectKey = $state<keyof typeof EFFECTS>('none');
	let effectStrength = $state(0.5);
	let effectSpeed = $state(1);

	// Export
	let exportTransparent = $state(false);
	let customExportW = $state(1080);
	let customExportH = $state(1080);

	// =============================================================================
	// CONSTANTS
	// =============================================================================
	const FONTS = {
		helvetiker: { label: 'Helvetiker', url: '/fonts/three/helvetiker_regular.typeface.json' },
		helvetiker_bold: { label: 'Helvetiker Bold', url: '/fonts/three/helvetiker_bold.typeface.json' },
		optimer: { label: 'Optimer', url: '/fonts/three/optimer_regular.typeface.json' },
		optimer_bold: { label: 'Optimer Bold', url: '/fonts/three/optimer_bold.typeface.json' },
		gentilis: { label: 'Gentilis', url: '/fonts/three/gentilis_regular.typeface.json' },
		gentilis_bold: { label: 'Gentilis Bold', url: '/fonts/three/gentilis_bold.typeface.json' },
		droid_sans: { label: 'Droid Sans', url: '/fonts/three/droid_sans_regular.typeface.json' },
		droid_sans_bold: { label: 'Droid Sans Bold', url: '/fonts/three/droid_sans_bold.typeface.json' },
		droid_sans_mono: { label: 'Droid Mono', url: '/fonts/three/droid_sans_mono_regular.typeface.json' },
		droid_serif: { label: 'Droid Serif', url: '/fonts/three/droid_serif_regular.typeface.json' },
		droid_serif_bold: { label: 'Droid Serif Bold', url: '/fonts/three/droid_serif_bold.typeface.json' },
		mplus_rounded: { label: 'MPlus Rounded', url: '/fonts/three/MPLUSRounded1c-Regular.typeface.json' }
	};

	const MATERIALS = {
		matte: { label: 'Matte' },
		plastic: { label: 'Plastic' },
		metal: { label: 'Metal' },
		chrome: { label: 'Chrome' },
		gold: { label: 'Gold' },
		glass: { label: 'Glass' },
		neon: { label: 'Neon' },
		toon: { label: 'Toon' },
		wireframe: { label: 'Wire' }
	};

	const LIGHTING_PRESETS = {
		studio: { label: 'Studio' },
		sunset: { label: 'Sunset' },
		neon: { label: 'Neon' },
		drama: { label: 'Drama' },
		soft: { label: 'Soft' }
	};

	const EFFECTS = {
		none: { label: 'None' },
		displaced: { label: 'Noise' },
		wobble: { label: 'Wobble' },
		twist: { label: 'Twist' },
		bloom: { label: 'Bloom' }
	};

	const EXPORT_PRESETS = [
		{ id: 'sq1080', label: 'Square', w: 1080, h: 1080, hint: '1:1 · Instagram' },
		{ id: 'story', label: 'Story', w: 1080, h: 1920, hint: '9:16 · Story / Reel' },
		{ id: 'land', label: 'Landscape', w: 1920, h: 1080, hint: '16:9 · YouTube' },
		{ id: 'port', label: 'Portrait', w: 1080, h: 1350, hint: '4:5 · IG portrait' },
		{ id: 'sq4k', label: 'Square 4K', w: 2160, h: 2160, hint: '1:1 · Print-ready' },
		{ id: 'banner', label: 'Banner', w: 1500, h: 500, hint: '3:1 · Header' },
		{ id: 'avatar', label: 'Avatar', w: 512, h: 512, hint: '1:1 · Profile pic' },
		{ id: 'hd', label: 'HD', w: 1280, h: 720, hint: '16:9 · Standard' }
	] as const;

	const COLOR_SWATCHES = [
		'#C8FF3D', '#FF4FB0', '#4F7CFF', '#FF7A3D',
		'#FFFFFF', '#0E0E10', '#FFD93D', '#A855F7',
		'#22D3EE', '#34D399', '#F43F5E', '#94A3B8'
	];

	// =============================================================================
	// RUNTIME (filled in onMount, called from $effect)
	// =============================================================================
	let cleanup: (() => void) | null = null;
	let rebuildAll: (() => Promise<void>) | null = null;
	let applyLighting: (() => void) | null = null;
	let applyBackground: (() => void) | null = null;
	let resetCamera: (() => void) | null = null;
	let fitToText: (() => void) | null = null;
	let exportAt: (w: number, h: number, transparent: boolean) => Promise<void> = async () => {};

	function parseHex(s: string): number | null {
		const m = s.match(/^#?([0-9a-f]{6})$/i);
		return m ? parseInt(m[1], 16) : null;
	}

	function safeName(s: string): string {
		return s.replace(/[^a-z0-9_-]+/gi, '_').slice(0, 32) || 'nickname';
	}

	// Rebuild geometry when text/font/size/depth/bevel/material/effect changes
	$effect(() => {
		void text;
		void fontKey;
		void size;
		void depth;
		void bevelEnabled;
		void bevelSize;
		void bevelThickness;
		void materialKey;
		void materialColor;
		void effectKey;
		void effectStrength;
		void effectSpeed;
		rebuildAll?.();
	});

	// Lighting preset → swap lights in scene
	$effect(() => {
		void lightingKey;
		applyLighting?.();
	});

	// Background: solid / gradient / transparent
	$effect(() => {
		void bgType;
		void bgColor;
		void bgColor2;
		applyBackground?.();
	});

	// =============================================================================
	// onMount — three.js scene setup
	// =============================================================================
	onMount(async () => {
		const THREE = await import('three');
		const { FontLoader } = await import('three/examples/jsm/loaders/FontLoader.js');
		const { TextGeometry } = await import('three/examples/jsm/geometries/TextGeometry.js');
		const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
		const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
		const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
		const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
		const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
		const { OutputPass } = await import('three/examples/jsm/postprocessing/OutputPass.js');

		// preserveDrawingBuffer is REQUIRED for toDataURL/toBlob to capture frames.
		const renderer = new THREE.WebGLRenderer({
			canvas: canvasEl,
			antialias: true,
			alpha: true,
			preserveDrawingBuffer: true
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		// 1.15 gives the neon and metal materials more headroom against ACES's
		// desaturation; the studio lighting preset stays well under clip.
		renderer.toneMappingExposure = 1.15;
		renderer.outputColorSpace = THREE.SRGBColorSpace;

		const scene = new THREE.Scene();
		const pmrem = new THREE.PMREMGenerator(renderer);
		scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

		const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 5000);
		const DEFAULT_CAM = new THREE.Vector3(0, 60, 320);
		camera.position.copy(DEFAULT_CAM);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.08;
		controls.minDistance = 80;
		controls.maxDistance = 1200;

		// Post-processing pipeline (only enabled for bloom effect)
		const composer = new EffectComposer(renderer);
		composer.addPass(new RenderPass(scene, camera));
		const bloomPass = new UnrealBloomPass(
			new THREE.Vector2(window.innerWidth, window.innerHeight),
			0,
			0.4,
			0.85
		);
		composer.addPass(bloomPass);
		composer.addPass(new OutputPass());

		const fontLoader = new FontLoader();
		const fontCache = new Map<string, unknown>();
		const clock = new THREE.Clock();

		let object: THREE_T.Object3D | null = null;
		let baseGeometry: THREE_T.BufferGeometry | null = null;
		const shaderRefs: { uniforms: Record<string, { value: number }> }[] = [];
		const lights: THREE_T.Light[] = [];

		// ---------------------------------------------------------------------------
		// LIGHTING
		// ---------------------------------------------------------------------------
		function clearLights() {
			for (const l of lights) scene.remove(l);
			lights.length = 0;
		}
		function addLight<L extends THREE_T.Light>(l: L): L {
			scene.add(l);
			lights.push(l);
			return l;
		}

		applyLighting = () => {
			clearLights();
			switch (lightingKey) {
				case 'studio': {
					addLight(new THREE.AmbientLight(0xffffff, 0.5));
					const key = new THREE.DirectionalLight(0xffffff, 2.0);
					key.position.set(120, 200, 120);
					addLight(key);
					const fill = new THREE.DirectionalLight(0xffffff, 0.7);
					fill.position.set(-150, 80, 60);
					addLight(fill);
					const rim = new THREE.DirectionalLight(0xffffff, 0.9);
					rim.position.set(0, 60, -180);
					addLight(rim);
					break;
				}
				case 'sunset': {
					addLight(new THREE.AmbientLight(0xffd1a8, 0.45));
					const warm = new THREE.DirectionalLight(0xff9a4a, 2.2);
					warm.position.set(180, 60, 100);
					addLight(warm);
					const coolRim = new THREE.DirectionalLight(0x6088ff, 1.4);
					coolRim.position.set(-120, 80, -160);
					addLight(coolRim);
					break;
				}
				case 'neon': {
					addLight(new THREE.AmbientLight(0x1a1a4a, 0.4));
					const magenta = new THREE.PointLight(0xff2fb0, 8, 0, 1.4);
					magenta.position.set(140, 60, 120);
					addLight(magenta);
					const cyan = new THREE.PointLight(0x2fcfff, 8, 0, 1.4);
					cyan.position.set(-160, 60, 120);
					addLight(cyan);
					const back = new THREE.DirectionalLight(0xffffff, 0.3);
					back.position.set(0, 50, -150);
					addLight(back);
					break;
				}
				case 'drama': {
					addLight(new THREE.AmbientLight(0xffffff, 0.12));
					const top = new THREE.DirectionalLight(0xffffff, 3.5);
					top.position.set(120, 300, 60);
					addLight(top);
					const rim = new THREE.DirectionalLight(0xa0c0ff, 0.55);
					rim.position.set(-80, 40, -200);
					addLight(rim);
					break;
				}
				case 'soft': {
					addLight(new THREE.AmbientLight(0xffffff, 1.2));
					const soft = new THREE.DirectionalLight(0xffffff, 0.7);
					soft.position.set(100, 200, 100);
					addLight(soft);
					break;
				}
			}
		};

		// ---------------------------------------------------------------------------
		// BACKGROUND
		// ---------------------------------------------------------------------------
		function makeGradientTexture(top: string, bottom: string): THREE_T.CanvasTexture {
			const c = document.createElement('canvas');
			c.width = 64;
			c.height = 256;
			const ctx = c.getContext('2d')!;
			const g = ctx.createLinearGradient(0, 0, 0, 256);
			g.addColorStop(0, top);
			g.addColorStop(1, bottom);
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, 64, 256);
			const tex = new THREE.CanvasTexture(c);
			tex.colorSpace = THREE.SRGBColorSpace;
			return tex;
		}

		applyBackground = () => {
			if (bgType === 'transparent') {
				scene.background = null;
				renderer.setClearColor(0x000000, 0);
				return;
			}
			if (bgType === 'gradient') {
				scene.background = makeGradientTexture(bgColor, bgColor2);
				renderer.setClearAlpha(1);
				return;
			}
			const hex = parseHex(bgColor) ?? 0xf5f2ea;
			scene.background = new THREE.Color(hex);
			renderer.setClearColor(hex, 1);
		};

		// ---------------------------------------------------------------------------
		// MATERIAL
		// ---------------------------------------------------------------------------
		function makeMaterialFor(preset: keyof typeof MATERIALS, hex: string): THREE_T.Material {
			const c = parseHex(hex) ?? 0xffffff;
			switch (preset) {
				case 'matte':
					return new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0 });
				case 'plastic':
					return new THREE.MeshPhysicalMaterial({
						color: c,
						roughness: 0.45,
						metalness: 0.05,
						clearcoat: 0.7,
						clearcoatRoughness: 0.1
					});
				case 'metal':
					return new THREE.MeshStandardMaterial({ color: c, roughness: 0.22, metalness: 1 });
				case 'chrome':
					return new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.02, metalness: 1 });
				case 'gold':
					return new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 1 });
				case 'glass':
					return new THREE.MeshPhysicalMaterial({
						color: c,
						roughness: 0.05,
						metalness: 0,
						transmission: 1,
						ior: 1.45,
						thickness: 0.5,
						clearcoat: 1
					});
				case 'neon':
					// True neon needs: pure black base (no diffuse pickup), zero
					// envmap intensity (don't reflect the studio environment), and
					// rough surface (kill specular). What's left is pure emissive
					// at the saturated picked color — reads unmistakably as neon
					// instead of "lit metal that happens to be lime".
					return new THREE.MeshStandardMaterial({
						color: 0x000000,
						emissive: c,
						emissiveIntensity: 1.2,
						roughness: 1.0,
						metalness: 0,
						envMapIntensity: 0
					});
				case 'toon':
					return new THREE.MeshToonMaterial({ color: c });
				case 'wireframe':
					return new THREE.MeshBasicMaterial({ color: c, wireframe: true });
			}
		}

		// Attach noise/wobble vertex shader to a standard/physical material via
		// onBeforeCompile. Toon/wireframe/basic skip this — too risky.
		function injectShader(mat: THREE_T.Material, mode: 'displaced' | 'wobble') {
			if (
				!(mat instanceof THREE.MeshStandardMaterial) &&
				!(mat instanceof THREE.MeshPhysicalMaterial)
			)
				return;
			mat.onBeforeCompile = (shader) => {
				shader.uniforms.uTime = { value: 0 };
				shader.uniforms.uAmount = { value: effectStrength };
				shader.uniforms.uSpeed = { value: effectSpeed };
				shader.vertexShader = shader.vertexShader.replace(
					'#include <common>',
					`#include <common>
					uniform float uTime;
					uniform float uAmount;
					uniform float uSpeed;`
				);
				const displaceSrc =
					mode === 'displaced'
						? `vec3 p = position * 0.025;
						   float t = uTime * uSpeed;
						   float n = sin(p.x * 3.0 + t) * 0.5
						           + sin(p.y * 4.0 + t * 1.3) * 0.5
						           + sin(p.z * 5.0 - t * 0.7) * 0.5;
						   transformed += normal * n * uAmount * 18.0;`
						: `float t = uTime * uSpeed;
						   transformed.x += sin(position.y * 0.08 + t * 2.0) * uAmount * 12.0;
						   transformed.z += cos(position.y * 0.08 + t * 1.7) * uAmount * 10.0;`;
				shader.vertexShader = shader.vertexShader.replace(
					'#include <begin_vertex>',
					`#include <begin_vertex>\n${displaceSrc}`
				);
				shaderRefs.push({ uniforms: shader.uniforms as Record<string, { value: number }> });
			};
		}

		function applyTwist(geo: THREE_T.BufferGeometry, amount: number) {
			geo.computeBoundingBox();
			const bb = geo.boundingBox!;
			const minX = bb.min.x;
			const range = bb.max.x - minX || 1;
			const positions = geo.attributes.position.array as Float32Array;
			for (let i = 0; i < positions.length; i += 3) {
				const x = positions[i];
				const t = (x - minX) / range;
				const angle = (t - 0.5) * amount * Math.PI * 2;
				const y = positions[i + 1];
				const z = positions[i + 2];
				positions[i + 1] = y * Math.cos(angle) - z * Math.sin(angle);
				positions[i + 2] = y * Math.sin(angle) + z * Math.cos(angle);
			}
			geo.attributes.position.needsUpdate = true;
			geo.computeVertexNormals();
		}

		// ---------------------------------------------------------------------------
		// REBUILD
		// ---------------------------------------------------------------------------
		async function loadFont(url: string) {
			if (fontCache.has(url)) return fontCache.get(url);
			const f = await fontLoader.loadAsync(url);
			fontCache.set(url, f);
			return f;
		}

		rebuildAll = async () => {
			const font = await loadFont(FONTS[fontKey].url);
			// Empty text crashes TextGeometry — substitute a single space.
			const trimmed = (text || ' ').slice(0, 24);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const geo = new TextGeometry(trimmed, {
				font: font as any,
				size,
				depth,
				curveSegments: 8,
				bevelEnabled,
				bevelThickness,
				bevelSize,
				bevelSegments: 4
			});
			geo.computeBoundingBox();
			geo.center();

			if (effectKey === 'twist') applyTwist(geo, effectStrength);

			if (object) {
				scene.remove(object);
				if (baseGeometry) baseGeometry.dispose();
				const m = (object as THREE_T.Mesh).material as THREE_T.Material | undefined;
				if (m && typeof m.dispose === 'function') m.dispose();
			}
			shaderRefs.length = 0;
			baseGeometry = geo;

			const mat = makeMaterialFor(materialKey, materialColor);
			if (effectKey === 'displaced' || effectKey === 'wobble') {
				injectShader(mat, effectKey);
			}
			object = new THREE.Mesh(geo, mat);
			scene.add(object);

			bloomPass.strength = effectKey === 'bloom' ? effectStrength * 1.2 : 0;
			bloomPass.enabled = effectKey === 'bloom';
		};

		// ---------------------------------------------------------------------------
		// CAMERA HELPERS
		// ---------------------------------------------------------------------------
		resetCamera = () => {
			camera.position.copy(DEFAULT_CAM);
			controls.target.set(0, 0, 0);
			controls.update();
		};

		fitToText = () => {
			if (!baseGeometry) return;
			baseGeometry.computeBoundingBox();
			const bb = baseGeometry.boundingBox!;
			const sx = bb.max.x - bb.min.x;
			const sy = bb.max.y - bb.min.y;
			const sz = bb.max.z - bb.min.z;
			const maxDim = Math.max(sx, sy, sz);
			// Frame so the largest dimension fits in ~70% of the FOV vertical
			const fovRad = (camera.fov * Math.PI) / 180;
			const dist = (maxDim * 0.5) / Math.tan(fovRad / 2) * 1.35;
			controls.target.set(0, 0, 0);
			camera.position.set(0, sy * 0.3, dist);
			controls.update();
		};

		// ---------------------------------------------------------------------------
		// EXPORT
		// ---------------------------------------------------------------------------
		exportAt = async (w: number, h: number, transparent: boolean) => {
			const prevW = renderer.domElement.width;
			const prevH = renderer.domElement.height;
			const prevAspect = camera.aspect;
			const prevPixelRatio = renderer.getPixelRatio();
			const prevSceneBg = scene.background;
			const prevClearColor = new THREE.Color();
			renderer.getClearColor(prevClearColor);
			const prevClearAlpha = renderer.getClearAlpha();

			try {
				renderer.setPixelRatio(1);
				renderer.setSize(w, h, false);
				camera.aspect = w / h;
				camera.updateProjectionMatrix();
				if (transparent) {
					scene.background = null;
					renderer.setClearColor(0x000000, 0);
				}
				if (effectKey === 'bloom') {
					composer.setSize(w, h);
					composer.render();
				} else {
					renderer.render(scene, camera);
				}
				await new Promise<void>((res) => {
					renderer.domElement.toBlob((blob) => {
						if (!blob) return res();
						const url = URL.createObjectURL(blob);
						const a = document.createElement('a');
						a.href = url;
						a.download = `${safeName(text)}_${w}x${h}${transparent ? '_transparent' : ''}.png`;
						document.body.appendChild(a);
						a.click();
						a.remove();
						URL.revokeObjectURL(url);
						res();
					}, 'image/png');
				});
			} finally {
				renderer.setPixelRatio(prevPixelRatio);
				renderer.setSize(prevW / prevPixelRatio, prevH / prevPixelRatio, false);
				camera.aspect = prevAspect;
				camera.updateProjectionMatrix();
				scene.background = prevSceneBg;
				renderer.setClearColor(prevClearColor, prevClearAlpha);
			}
		};

		// ---------------------------------------------------------------------------
		// LOOP
		// ---------------------------------------------------------------------------
		function resize() {
			const w = canvasEl.clientWidth;
			const h = canvasEl.clientHeight;
			if (renderer.domElement.width !== w * renderer.getPixelRatio()) {
				renderer.setSize(w, h, false);
				composer.setSize(w, h);
				camera.aspect = w / h;
				camera.updateProjectionMatrix();
			}
		}

		applyLighting();
		applyBackground();
		await rebuildAll();
		ready = true;

		let raf = 0;
		function tick() {
			resize();
			const t = clock.getElapsedTime();
			controls.update();
			for (const ref of shaderRefs) {
				if (ref.uniforms.uTime) ref.uniforms.uTime.value = t;
				if (ref.uniforms.uAmount) ref.uniforms.uAmount.value = effectStrength;
				if (ref.uniforms.uSpeed) ref.uniforms.uSpeed.value = effectSpeed;
			}
			if (effectKey === 'bloom') composer.render();
			else renderer.render(scene, camera);
			raf = requestAnimationFrame(tick);
		}
		tick();

		cleanup = () => {
			cancelAnimationFrame(raf);
			controls.dispose();
			renderer.dispose();
			pmrem.dispose();
			composer.dispose();
			if (object) {
				if (baseGeometry) baseGeometry.dispose();
				const m = (object as THREE_T.Mesh).material as THREE_T.Material | undefined;
				if (m && typeof m.dispose === 'function') m.dispose();
			}
		};
	});

	onDestroy(() => cleanup?.());

	async function downloadPreset(p: (typeof EXPORT_PRESETS)[number]) {
		try {
			await exportAt(p.w, p.h, exportTransparent);
			toast(`exported ${p.w} × ${p.h}`);
		} catch {
			toast('export failed');
		}
	}
	async function downloadCustom() {
		const w = Math.max(64, Math.min(8192, customExportW));
		const h = Math.max(64, Math.min(8192, customExportH));
		try {
			await exportAt(w, h, exportTransparent);
			toast(`exported ${w} × ${h}`);
		} catch {
			toast('export failed');
		}
	}
	function copySettingsJSON() {
		const json = JSON.stringify(
			{
				text,
				font: fontKey,
				size,
				depth,
				bevel: { enabled: bevelEnabled, size: bevelSize, thickness: bevelThickness },
				material: { preset: materialKey, color: materialColor },
				lighting: lightingKey,
				background: { type: bgType, color: bgColor, color2: bgColor2 },
				effect: { type: effectKey, strength: effectStrength, speed: effectSpeed }
			},
			null,
			2
		);
		navigator.clipboard.writeText(json).then(
			() => toast('settings copied'),
			() => toast('copy failed')
		);
	}
	function resetAll() {
		text = 'fancy';
		fontKey = 'helvetiker_bold';
		size = 60;
		depth = 28;
		bevelEnabled = true;
		bevelSize = 2;
		bevelThickness = 3;
		materialKey = 'chrome';
		materialColor = '#C8FF3D';
		lightingKey = 'studio';
		bgType = 'solid';
		bgColor = '#0E0E10';
		bgColor2 = '#4F7CFF';
		effectKey = 'none';
		effectStrength = 0.5;
		effectSpeed = 1;
		toast('reset to defaults');
	}
</script>

<svelte:head>
	<title>3D text generator — fancynickna.me</title>
	<meta
		name="description"
		content="Render your nickname as 3D extruded text with chrome, gold, neon or glass materials. Orbit the camera and export at PFP, Instagram or 4K wallpaper resolutions — with bg or transparent."
	/>
	<link rel="canonical" href="https://fancynickna.me/3d" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://fancynickna.me/3d" />
	<meta property="og:title" content="3D text generator — fancynickna.me" />
	<meta property="og:description" content="3D nickname renderer with chrome, gold, neon and glass materials. Export PFPs and wallpapers up to 4K." />
	<meta property="og:image" content="https://fancynickna.me/og.png?title=3D+text&subtitle=Chrome%2C+gold%2C+neon%2C+glass.+Export+PFPs+and+wallpapers." />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="3D text generator — fancynickna.me" />
	<meta name="twitter:description" content="3D nickname renderer. Export PFPs and wallpapers up to 4K." />
	<meta name="twitter:image" content="https://fancynickna.me/og.png?title=3D+text" />
</svelte:head>

<TopBar />

<main class="render-main">
	<div class="canvas-wrap" class:is-transparent={bgType === 'transparent'}>
		<canvas bind:this={canvasEl} class="render-canvas"></canvas>
		{#if !ready}
			<div class="loading-overlay">loading renderer…</div>
		{/if}
		<div class="canvas-hud">
			<button type="button" class="hud-btn" onclick={() => resetCamera?.()} title="reset camera">
				<span>⟲</span> reset
			</button>
			<button type="button" class="hud-btn" onclick={() => fitToText?.()} title="fit to text">
				<span>⛶</span> fit
			</button>
			<div class="hud-spacer"></div>
			<div class="hud-hint">drag · scroll · pinch</div>
		</div>
		<button
			class="mobile-panel-toggle"
			type="button"
			onclick={() => (mobilePanelOpen = !mobilePanelOpen)}
		>
			{mobilePanelOpen ? 'close ✕' : 'settings ⚙'}
		</button>
	</div>

	<aside class="controls" class:mobile-open={mobilePanelOpen}>
		<div class="controls-inner">
			<!-- YOUR NAME -->
			<div class="section">
				<div class="section-title">your name</div>
				<div class="section-body">
					<input
						class="ctrl-input"
						bind:value={text}
						maxlength="24"
						placeholder="type your name…"
						autocomplete="off"
						spellcheck="false"
					/>
					<div class="field">
						<div class="field-label">font</div>
						<select class="ctrl-select" bind:value={fontKey}>
							{#each Object.entries(FONTS) as [k, v] (k)}
								<option value={k}>{v.label}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>

			<!-- GEOMETRY -->
			<div class="section">
				<div class="section-title">geometry</div>
				<div class="section-body">
					<div class="slider">
						<div class="slider-head"><span>size</span><span class="slider-value">{size}</span></div>
						<input type="range" min="20" max="200" step="1" bind:value={size} />
					</div>
					<div class="slider">
						<div class="slider-head"><span>depth</span><span class="slider-value">{depth}</span></div>
						<input type="range" min="0" max="120" step="1" bind:value={depth} />
					</div>
					<button
						type="button"
						class="toggle"
						class:on={bevelEnabled}
						onclick={() => (bevelEnabled = !bevelEnabled)}
					>
						<span>bevel</span>
						<span class="toggle-switch"><span class="toggle-knob"></span></span>
					</button>
					{#if bevelEnabled}
						<div class="slider">
							<div class="slider-head"><span>bevel size</span><span class="slider-value">{bevelSize}</span></div>
							<input type="range" min="0" max="8" step="0.25" bind:value={bevelSize} />
						</div>
						<div class="slider">
							<div class="slider-head"><span>bevel thickness</span><span class="slider-value">{bevelThickness}</span></div>
							<input type="range" min="0" max="10" step="0.25" bind:value={bevelThickness} />
						</div>
					{/if}
				</div>
			</div>

			<!-- MATERIAL -->
			<div class="section">
				<div class="section-title">material</div>
				<div class="section-body">
					<div class="preset-grid" style="--cols: 3;">
						{#each Object.entries(MATERIALS) as [k, v] (k)}
							<button
								type="button"
								class="preset-btn"
								class:active={materialKey === k}
								onclick={() => (materialKey = k as keyof typeof MATERIALS)}
							>{v.label}</button>
						{/each}
					</div>
					<div class="field">
						<div class="field-label">color</div>
						<div class="color-row">
							{#each COLOR_SWATCHES as c (c)}
								<button
									type="button"
									class="swatch"
									class:active={materialColor.toLowerCase() === c.toLowerCase()}
									style="background: {c};"
									onclick={() => (materialColor = c)}
									aria-label={c}
								></button>
							{/each}
							<label class="swatch-custom" title="custom color">
								<input type="color" bind:value={materialColor} />
								<span>+</span>
							</label>
						</div>
					</div>
				</div>
			</div>

			<!-- LIGHTING -->
			<div class="section">
				<div class="section-title">lighting</div>
				<div class="section-body">
					<div class="preset-grid" style="--cols: 5;">
						{#each Object.entries(LIGHTING_PRESETS) as [k, v] (k)}
							<button
								type="button"
								class="preset-btn"
								class:active={lightingKey === k}
								onclick={() => (lightingKey = k as keyof typeof LIGHTING_PRESETS)}
							>{v.label}</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- SCENE -->
			<div class="section">
				<div class="section-title">scene</div>
				<div class="section-body">
					<div class="field">
						<div class="field-label">background</div>
						<div class="seg">
							<button
								type="button"
								class="seg-btn"
								class:active={bgType === 'solid'}
								onclick={() => (bgType = 'solid')}
							>solid</button>
							<button
								type="button"
								class="seg-btn"
								class:active={bgType === 'gradient'}
								onclick={() => (bgType = 'gradient')}
							>gradient</button>
							<button
								type="button"
								class="seg-btn"
								class:active={bgType === 'transparent'}
								onclick={() => (bgType = 'transparent')}
							>none</button>
						</div>
					</div>
					{#if bgType === 'solid'}
						<div class="field">
							<div class="field-label">bg color</div>
							<div class="color-row">
								{#each COLOR_SWATCHES as c (c)}
									<button
										type="button"
										class="swatch"
										class:active={bgColor.toLowerCase() === c.toLowerCase()}
										style="background: {c};"
										onclick={() => (bgColor = c)}
										aria-label={c}
									></button>
								{/each}
								<label class="swatch-custom"><input type="color" bind:value={bgColor} /><span>+</span></label>
							</div>
						</div>
					{:else if bgType === 'gradient'}
						<div class="field">
							<div class="field-label">top color</div>
							<div class="color-row">
								{#each COLOR_SWATCHES as c (c)}
									<button
										type="button"
										class="swatch"
										class:active={bgColor.toLowerCase() === c.toLowerCase()}
										style="background: {c};"
										onclick={() => (bgColor = c)}
										aria-label={c}
									></button>
								{/each}
								<label class="swatch-custom"><input type="color" bind:value={bgColor} /><span>+</span></label>
							</div>
						</div>
						<div class="field">
							<div class="field-label">bottom color</div>
							<div class="color-row">
								{#each COLOR_SWATCHES as c (c)}
									<button
										type="button"
										class="swatch"
										class:active={bgColor2.toLowerCase() === c.toLowerCase()}
										style="background: {c};"
										onclick={() => (bgColor2 = c)}
										aria-label={c}
									></button>
								{/each}
								<label class="swatch-custom"><input type="color" bind:value={bgColor2} /><span>+</span></label>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- EFFECTS (not in the original handoff but kept; auto-rotation deliberately omitted) -->
			<div class="section">
				<div class="section-title">effect</div>
				<div class="section-body">
					<div class="preset-grid" style="--cols: 3;">
						{#each Object.entries(EFFECTS) as [k, v] (k)}
							<button
								type="button"
								class="preset-btn"
								class:active={effectKey === k}
								onclick={() => (effectKey = k as keyof typeof EFFECTS)}
							>{v.label}</button>
						{/each}
					</div>
					{#if effectKey !== 'none'}
						<div class="slider">
							<div class="slider-head"><span>strength</span><span class="slider-value">{effectStrength.toFixed(2)}</span></div>
							<input type="range" min="0" max={effectKey === 'twist' ? 1.5 : 1} step="0.05" bind:value={effectStrength} />
						</div>
						{#if effectKey === 'displaced' || effectKey === 'wobble'}
							<div class="slider">
								<div class="slider-head"><span>speed</span><span class="slider-value">{effectSpeed.toFixed(2)}</span></div>
								<input type="range" min="0" max="3" step="0.1" bind:value={effectSpeed} />
							</div>
						{/if}
					{/if}
				</div>
			</div>

			<!-- EXPORT -->
			<div class="section">
				<div class="section-title">export</div>
				<div class="section-body">
					<button
						type="button"
						class="toggle"
						class:on={exportTransparent}
						onclick={() => (exportTransparent = !exportTransparent)}
					>
						<span>transparent bg</span>
						<span class="toggle-switch"><span class="toggle-knob"></span></span>
					</button>
					<div class="export-grid">
						{#each EXPORT_PRESETS as p (p.id)}
							<button type="button" class="export-card" onclick={() => downloadPreset(p)}>
								<div class="export-card-label">{p.label}</div>
								<div class="export-card-size">{p.w} × {p.h}</div>
								<div class="export-card-hint">{p.hint}</div>
							</button>
						{/each}
					</div>
					<div class="custom-export">
						<div class="custom-export-label">custom size</div>
						<div class="custom-export-row">
							<input type="number" min="64" max="8192" bind:value={customExportW} />
							<span>×</span>
							<input type="number" min="64" max="8192" bind:value={customExportH} />
							<button type="button" class="custom-export-btn" onclick={downloadCustom}>export</button>
						</div>
					</div>
				</div>
			</div>

			<div class="footer-actions">
				<button type="button" class="footer-act" onclick={copySettingsJSON}>copy settings JSON</button>
				<button type="button" class="footer-act danger" onclick={resetAll}>reset all</button>
			</div>
		</div>
	</aside>
</main>

<!-- Long-form crawlable content below the fold for SEO -->
<section style="padding: 40px clamp(20px, 4vw, 56px) 24px; max-width: 980px;">
	<h2 style="font-family: var(--font-display); font-size: clamp(28px, 4vw, 48px); line-height: 1; letter-spacing: -0.02em; margin: 0 0 16px;">
		3d nickname text in your browser
	</h2>
	<p style="font-family: var(--font-sans); font-size: 17px; line-height: 1.6; color: var(--fg); max-width: 720px;">
		This page renders your nickname as <strong>real 3D geometry</strong> in WebGL — extruded
		letters, beveled edges, physical materials with proper reflections and a studio-lit HDR
		environment. Nine material presets (matte, plastic, metal, chrome, gold, glass, neon, toon,
		wireframe), five lighting setups (studio, sunset, neon, drama, soft), gradient or solid or
		transparent backgrounds, and a click-to-export PNG at any size. Use it to make a
		<strong>profile picture</strong>, a desktop or phone <strong>wallpaper</strong>, a Twitter
		banner, a Discord server icon, a YouTube thumbnail, an Instagram story.
	</p>
</section>

<style>
	:root {
		--line-strong: rgba(14, 14, 16, 0.28);
	}
	:global(html[data-theme='ink']) {
		--line-strong: rgba(245, 242, 234, 0.28);
	}

	/* MAIN LAYOUT */
	.render-main {
		display: grid;
		grid-template-columns: 1fr 380px;
		height: calc(100vh - 100px);
		min-height: 540px;
	}
	@media (max-width: 920px) {
		.render-main {
			grid-template-columns: 1fr;
			height: calc(100vh - 80px);
		}
	}

	/* CANVAS */
	.canvas-wrap {
		position: relative;
		background:
			linear-gradient(45deg, color-mix(in oklab, var(--fg) 4%, var(--bg)) 25%, transparent 25%),
			linear-gradient(-45deg, color-mix(in oklab, var(--fg) 4%, var(--bg)) 25%, transparent 25%),
			linear-gradient(45deg, transparent 75%, color-mix(in oklab, var(--fg) 4%, var(--bg)) 75%),
			linear-gradient(-45deg, transparent 75%, color-mix(in oklab, var(--fg) 4%, var(--bg)) 75%);
		background-size: 24px 24px;
		background-position: 0 0, 0 12px, 12px -12px, -12px 0;
		border-right: 2px solid var(--fg);
	}
	@media (max-width: 920px) {
		.canvas-wrap {
			border-right: none;
			border-bottom: 2px solid var(--fg);
		}
	}
	.render-canvas {
		display: block;
		width: 100%;
		height: 100%;
		touch-action: none;
	}
	.loading-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-mono);
		font-size: 13px;
		color: var(--fg-soft);
		background: color-mix(in oklab, var(--bg) 90%, transparent);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		pointer-events: none;
	}

	.canvas-hud {
		position: absolute;
		bottom: 18px;
		left: 18px;
		right: 18px;
		display: flex;
		gap: 8px;
		align-items: center;
		pointer-events: none;
	}
	.hud-btn {
		pointer-events: auto;
		background: var(--card);
		border: 1.5px solid var(--fg);
		border-radius: 10px;
		padding: 8px 14px;
		font-family: var(--font-mono);
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--fg);
		display: inline-flex;
		gap: 8px;
		align-items: center;
		box-shadow: 3px 3px 0 var(--fg);
		cursor: pointer;
		transition: transform 0.1s, box-shadow 0.1s;
	}
	.hud-btn:hover {
		transform: translate(-1px, -1px);
		box-shadow: 4px 4px 0 var(--accent), 4px 4px 0 1.5px var(--fg);
	}
	.hud-btn:active {
		transform: translate(2px, 2px);
		box-shadow: none;
	}
	.hud-btn span {
		font-size: 14px;
		font-family: var(--font-sans);
	}
	.hud-spacer {
		flex: 1;
	}
	.hud-hint {
		pointer-events: none;
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--fg-soft);
		background: color-mix(in oklab, var(--bg) 85%, transparent);
		padding: 6px 10px;
		border-radius: 8px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.mobile-panel-toggle {
		display: none;
		position: absolute;
		top: 14px;
		right: 14px;
		background: var(--fg);
		color: var(--bg);
		border: none;
		border-radius: 999px;
		padding: 10px 16px;
		font-family: var(--font-mono);
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		cursor: pointer;
	}
	@media (max-width: 920px) {
		.mobile-panel-toggle {
			display: block;
			z-index: 30;
		}
		/* DockedBar sits at bottom: ~14px; lift the HUD above it on mobile so
		   reset / fit / drag-hint aren't hidden under the global nickname pill. */
		.canvas-hud {
			bottom: 80px;
		}
	}

	/* CONTROLS PANEL */
	.controls {
		background: var(--bg);
		overflow-y: auto;
		overflow-x: hidden;
	}
	@media (max-width: 920px) {
		.controls {
			position: fixed;
			top: 0;
			right: 0;
			bottom: 0;
			width: min(380px, 100vw);
			z-index: 25;
			transform: translateX(100%);
			transition: transform 0.25s ease;
			border-left: 2px solid var(--fg);
		}
		.controls.mobile-open {
			transform: translateX(0);
		}
	}
	.controls-inner {
		padding: 20px 22px 60px;
	}

	/* SECTIONS */
	.section {
		padding-bottom: 22px;
		margin-bottom: 22px;
		border-bottom: 1px dashed var(--line-strong);
	}
	.section:last-of-type {
		border-bottom: none;
	}
	.section-title {
		font-family: var(--font-display);
		font-size: 18px;
		letter-spacing: -0.005em;
		margin-bottom: 14px;
		text-transform: lowercase;
	}
	.section-body {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.field-label {
		font-family: var(--font-mono);
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--fg-soft);
	}

	/* Inputs */
	.ctrl-input {
		width: 100%;
		background: var(--card);
		border: 1.5px solid var(--fg);
		border-radius: 10px;
		padding: 10px 14px;
		font-family: var(--font-mono);
		font-size: 16px;
		color: var(--fg);
		outline: none;
		transition: box-shadow 0.12s;
	}
	.ctrl-input:focus {
		box-shadow: 3px 3px 0 var(--accent), 3px 3px 0 1.5px var(--fg);
	}
	.ctrl-select {
		width: 100%;
		background: var(--card);
		border: 1.5px solid var(--fg);
		border-radius: 10px;
		padding: 9px 12px;
		font-family: var(--font-mono);
		font-size: 13px;
		color: var(--fg);
		cursor: pointer;
		outline: none;
	}

	/* Slider */
	.slider {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.slider-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-family: var(--font-mono);
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-soft);
	}
	.slider-value {
		color: var(--fg);
		font-weight: 600;
	}
	.slider input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		background: transparent;
		cursor: pointer;
		height: 22px;
	}
	.slider input[type='range']::-webkit-slider-runnable-track {
		height: 4px;
		background: var(--fg);
		border-radius: 999px;
	}
	.slider input[type='range']::-moz-range-track {
		height: 4px;
		background: var(--fg);
		border-radius: 999px;
	}
	.slider input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 18px;
		height: 18px;
		background: var(--accent);
		border: 2px solid var(--fg);
		border-radius: 50%;
		margin-top: -7px;
		cursor: grab;
	}
	.slider input[type='range']::-moz-range-thumb {
		width: 18px;
		height: 18px;
		background: var(--accent);
		border: 2px solid var(--fg);
		border-radius: 50%;
		cursor: grab;
	}

	/* Toggle */
	.toggle {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: transparent;
		border: 1px solid var(--line-strong);
		border-radius: 10px;
		padding: 10px 14px;
		font-family: var(--font-mono);
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--fg);
		cursor: pointer;
		transition: all 0.12s;
	}
	.toggle:hover {
		border-color: var(--fg);
	}
	.toggle.on {
		border-color: var(--fg);
		background: var(--fg);
		color: var(--bg);
	}
	.toggle-switch {
		width: 36px;
		height: 20px;
		background: var(--line-strong);
		border-radius: 999px;
		position: relative;
		transition: background 0.15s;
	}
	.toggle.on .toggle-switch {
		background: var(--accent);
	}
	.toggle-knob {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px;
		height: 16px;
		background: #fff;
		border-radius: 50%;
		transition: transform 0.15s;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}
	.toggle.on .toggle-knob {
		transform: translateX(16px);
	}

	/* Segmented radio */
	.seg {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
		background: var(--card);
		border: 1.5px solid var(--fg);
		border-radius: 10px;
		padding: 3px;
	}
	.seg-btn {
		background: transparent;
		border: none;
		padding: 8px 10px;
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--fg-soft);
		text-transform: lowercase;
		border-radius: 7px;
		cursor: pointer;
		transition: all 0.12s;
	}
	.seg-btn:hover {
		color: var(--fg);
	}
	.seg-btn.active {
		background: var(--fg);
		color: var(--bg);
	}

	/* Preset grid */
	.preset-grid {
		display: grid;
		grid-template-columns: repeat(var(--cols, 3), 1fr);
		gap: 6px;
	}
	.preset-btn {
		background: var(--card);
		border: 1.5px solid var(--line-strong);
		border-radius: 10px;
		padding: 10px 8px;
		font-family: var(--font-mono);
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--fg);
		cursor: pointer;
		transition: all 0.12s;
	}
	.preset-btn:hover {
		border-color: var(--fg);
	}
	.preset-btn.active {
		background: var(--fg);
		color: var(--bg);
		border-color: var(--fg);
		transform: translate(-1px, -1px);
		box-shadow: 2px 2px 0 var(--accent), 2px 2px 0 1.5px var(--fg);
	}

	/* Colors */
	.color-row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-items: center;
	}
	.swatch {
		width: 28px;
		height: 28px;
		border-radius: 8px;
		border: 1.5px solid var(--line-strong);
		cursor: pointer;
		padding: 0;
		transition: all 0.12s;
	}
	.swatch:hover {
		transform: scale(1.08);
		border-color: var(--fg);
	}
	.swatch.active {
		border-color: var(--fg);
		box-shadow: 0 0 0 2px var(--accent), 0 0 0 4px var(--fg);
	}
	.swatch-custom {
		width: 28px;
		height: 28px;
		border-radius: 8px;
		border: 1.5px dashed var(--line-strong);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		position: relative;
		font-family: var(--font-mono);
		font-size: 16px;
		color: var(--fg-soft);
		background: var(--card);
	}
	.swatch-custom:hover {
		border-color: var(--fg);
		color: var(--fg);
	}
	.swatch-custom input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}

	/* EXPORT */
	.export-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 6px;
		margin-top: 4px;
	}
	.export-card {
		text-align: left;
		background: var(--card);
		border: 1.5px solid var(--fg);
		border-radius: 12px;
		padding: 12px 14px;
		color: var(--fg);
		display: flex;
		flex-direction: column;
		gap: 3px;
		cursor: pointer;
		transition: all 0.12s;
	}
	.export-card:hover {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0 var(--accent), 3px 3px 0 1.5px var(--fg);
	}
	.export-card-label {
		font-family: var(--font-display);
		font-size: 14px;
		letter-spacing: -0.005em;
	}
	.export-card-size {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--fg);
		font-weight: 600;
	}
	.export-card-hint {
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--fg-soft);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.custom-export {
		margin-top: 10px;
		padding-top: 12px;
		border-top: 1px solid var(--line);
	}
	.custom-export-label {
		font-family: var(--font-mono);
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--fg-soft);
		margin-bottom: 6px;
	}
	.custom-export-row {
		display: flex;
		gap: 6px;
		align-items: center;
	}
	.custom-export-row input {
		width: 70px;
		background: var(--card);
		border: 1.5px solid var(--fg);
		border-radius: 8px;
		padding: 8px 10px;
		font-family: var(--font-mono);
		font-size: 13px;
		color: var(--fg);
		outline: none;
	}
	.custom-export-row span {
		color: var(--fg-soft);
		font-family: var(--font-mono);
		font-size: 14px;
	}
	.custom-export-btn {
		flex: 1;
		background: var(--fg);
		color: var(--bg);
		border: 1.5px solid var(--fg);
		border-radius: 8px;
		padding: 8px;
		font-family: var(--font-mono);
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.12s;
	}
	.custom-export-btn:hover {
		background: var(--accent);
		color: var(--fg);
	}

	/* Footer actions */
	.footer-actions {
		display: flex;
		gap: 6px;
		padding-top: 12px;
	}
	.footer-act {
		flex: 1;
		background: transparent;
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 8px;
		font-family: var(--font-mono);
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg);
		cursor: pointer;
		transition: all 0.12s;
	}
	.footer-act:hover {
		border-color: var(--fg);
	}
	.footer-act.danger:hover {
		background: var(--fg);
		color: var(--bg);
	}
</style>
