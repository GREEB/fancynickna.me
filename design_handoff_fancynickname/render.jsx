// React UI for the 3D name renderer
const { useState, useEffect, useRef, useCallback } = React;

const DEFAULTS = {
  text: 'fancy',
  font: 'helvetiker_bold',
  size: 1.4,
  depth: 0.4,
  bevel: { enabled: true, size: 0.04, thickness: 0.06 },
  material: { preset: 'metal', color: '#C8FF3D' },
  lighting: 'studio',
  background: { type: 'solid', color: '#0E0E10', color2: '#4F7CFF' },
  autoRotate: true,
  rotateSpeed: 0.6,
};

const FONT_LABELS = {
  helvetiker:      'Helvetiker',
  helvetiker_bold: 'Helvetiker Bold',
  gentilis:        'Gentilis',
  gentilis_bold:   'Gentilis Bold',
  optimer:         'Optimer',
  optimer_bold:    'Optimer Bold',
  droid_sans:      'Droid Sans',
  droid_serif:     'Droid Serif',
};

const MATERIAL_PRESETS = [
  { id: 'matte',     label: 'Matte' },
  { id: 'plastic',   label: 'Plastic' },
  { id: 'metal',     label: 'Metal' },
  { id: 'chrome',    label: 'Chrome' },
  { id: 'gold',      label: 'Gold' },
  { id: 'glass',     label: 'Glass' },
  { id: 'neon',      label: 'Neon' },
  { id: 'toon',      label: 'Toon' },
  { id: 'wireframe', label: 'Wire' },
];

const LIGHTING_PRESETS = [
  { id: 'studio', label: 'Studio' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'neon',   label: 'Neon' },
  { id: 'drama',  label: 'Drama' },
  { id: 'soft',   label: 'Soft' },
];

const COLOR_SWATCHES = [
  '#C8FF3D', '#FF4FB0', '#4F7CFF', '#FF7A3D',
  '#FFFFFF', '#0E0E10', '#FFD93D', '#A855F7',
  '#22D3EE', '#34D399', '#F43F5E', '#94A3B8',
];

const EXPORT_PRESETS = [
  { id: 'sq1080', label: 'Square',     w: 1080, h: 1080, hint: '1:1 · Instagram' },
  { id: 'story',  label: 'Story',      w: 1080, h: 1920, hint: '9:16 · Story / Reel' },
  { id: 'land',   label: 'Landscape',  w: 1920, h: 1080, hint: '16:9 · YouTube' },
  { id: 'port',   label: 'Portrait',   w: 1080, h: 1350, hint: '4:5 · IG portrait' },
  { id: 'sq4k',   label: 'Square 4K',  w: 2160, h: 2160, hint: '1:1 · Print-ready' },
  { id: 'banner', label: 'Banner',     w: 1500, h: 500,  hint: '3:1 · Header' },
  { id: 'avatar', label: 'Avatar',     w: 512,  h: 512,  hint: '1:1 · Profile pic' },
  { id: 'hd',     label: 'HD',         w: 1280, h: 720,  hint: '16:9 · Standard' },
];

// ===========================================================================

function RenderApp() {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const [ready, setReady] = useState(!!window.NameRenderer);
  const [settings, setSettings] = useState(DEFAULTS);
  const [customExport, setCustomExport] = useState({ w: 1080, h: 1080 });
  const [transparent, setTransparent] = useState(false);
  const [toast, setToast] = useState(null);
  const [showMobilePanel, setShowMobilePanel] = useState(false);

  // Wait for engine
  useEffect(() => {
    if (ready) return;
    const onReady = () => setReady(true);
    window.addEventListener('renderer-ready', onReady);
    return () => window.removeEventListener('renderer-ready', onReady);
  }, [ready]);

  // Init renderer
  useEffect(() => {
    if (!ready || !canvasRef.current || rendererRef.current) return;
    rendererRef.current = new window.NameRenderer(canvasRef.current);
    rendererRef.current.update(settings);
    return () => rendererRef.current?.dispose();
    // eslint-disable-next-line
  }, [ready]);

  // Push settings to engine
  useEffect(() => {
    if (rendererRef.current) rendererRef.current.update(settings);
  }, [settings]);

  // Helpers --------------------------------------------------------------
  const patch = (path, value) => {
    setSettings(s => {
      const next = { ...s };
      const parts = path.split('.');
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = { ...obj[parts[i]] };
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(null), 1800);
  };

  const downloadPNG = (w, h) => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.exportPNG({ width: w, height: h, transparent });
    const a = document.createElement('a');
    a.href = dataUrl;
    const safe = (settings.text || 'nickname').replace(/[^a-z0-9_-]+/gi, '_').slice(0, 32) || 'nickname';
    a.download = `${safe}_${w}x${h}${transparent ? '_transparent' : ''}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast(`exported ${w} × ${h}`);
  };

  return (
    <div className="page" data-screen-label="render">
      <Marquee />
      <TopBar />
      <main className="render-main">
        <div className="canvas-wrap">
          <canvas ref={canvasRef} className="render-canvas" />
          {!ready && <div className="loading-overlay">loading renderer…</div>}
          <div className="canvas-hud">
            <button className="hud-btn" onClick={() => rendererRef.current?.resetCamera()} title="reset camera">
              <span>⟲</span> reset
            </button>
            <button className="hud-btn" onClick={() => rendererRef.current?.fitToText()} title="fit to text">
              <span>⛶</span> fit
            </button>
            <div className="hud-spacer" />
            <div className="hud-hint">drag · scroll · pinch</div>
          </div>
          <button
            className="mobile-panel-toggle"
            onClick={() => setShowMobilePanel(v => !v)}
          >
            {showMobilePanel ? 'close ✕' : 'settings ⚙'}
          </button>
        </div>

        <aside className={`controls ${showMobilePanel ? 'mobile-open' : ''}`}>
          <ControlsPanel
            settings={settings}
            patch={patch}
            customExport={customExport}
            setCustomExport={setCustomExport}
            transparent={transparent}
            setTransparent={setTransparent}
            onExport={downloadPNG}
            onCopySettings={() => {
              navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
              showToast('settings copied as JSON');
            }}
            onReset={() => { setSettings(DEFAULTS); showToast('reset to defaults'); }}
          />
        </aside>
      </main>
      <Toast text={toast} />
    </div>
  );
}

// ===========================================================================
// CONTROLS PANEL
// ===========================================================================

function ControlsPanel({ settings, patch, customExport, setCustomExport, transparent, setTransparent, onExport, onCopySettings, onReset }) {
  return (
    <div className="controls-inner">
      <Section title="your name">
        <input
          className="ctrl-input"
          value={settings.text}
          onChange={e => patch('text', e.target.value)}
          maxLength={24}
          placeholder="type your name..."
        />
        <Field label="font">
          <select
            className="ctrl-select"
            value={settings.font}
            onChange={e => patch('font', e.target.value)}
          >
            {Object.entries(FONT_LABELS).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </Field>
      </Section>

      <Section title="geometry">
        <Slider label="size"            value={settings.size}            min={0.4} max={3}    step={0.05} onChange={v => patch('size', v)} />
        <Slider label="depth"           value={settings.depth}           min={0}   max={1.5}  step={0.02} onChange={v => patch('depth', v)} />
        <Toggle label="bevel"           value={settings.bevel.enabled}                                   onChange={v => patch('bevel.enabled', v)} />
        {settings.bevel.enabled && (
          <>
            <Slider label="bevel size"      value={settings.bevel.size}      min={0} max={0.15} step={0.005} onChange={v => patch('bevel.size', v)} />
            <Slider label="bevel thickness" value={settings.bevel.thickness} min={0} max={0.2}  step={0.005} onChange={v => patch('bevel.thickness', v)} />
          </>
        )}
      </Section>

      <Section title="material">
        <PresetGrid
          items={MATERIAL_PRESETS}
          value={settings.material.preset}
          onChange={v => patch('material.preset', v)}
        />
        <Field label="color">
          <ColorRow
            value={settings.material.color}
            onChange={v => patch('material.color', v)}
          />
        </Field>
      </Section>

      <Section title="lighting">
        <PresetGrid
          items={LIGHTING_PRESETS}
          value={settings.lighting}
          onChange={v => patch('lighting', v)}
          cols={5}
        />
      </Section>

      <Section title="scene">
        <Field label="background">
          <SegRadio
            value={settings.background.type}
            onChange={v => patch('background.type', v)}
            options={[
              { value: 'solid',       label: 'solid' },
              { value: 'gradient',    label: 'gradient' },
              { value: 'transparent', label: 'none' },
            ]}
          />
        </Field>
        {settings.background.type === 'solid' && (
          <Field label="bg color">
            <ColorRow value={settings.background.color} onChange={v => patch('background.color', v)} />
          </Field>
        )}
        {settings.background.type === 'gradient' && (
          <>
            <Field label="top color">
              <ColorRow value={settings.background.color}  onChange={v => patch('background.color',  v)} />
            </Field>
            <Field label="bottom color">
              <ColorRow value={settings.background.color2} onChange={v => patch('background.color2', v)} />
            </Field>
          </>
        )}
        <Toggle label="auto rotate" value={settings.autoRotate} onChange={v => patch('autoRotate', v)} />
        {settings.autoRotate && (
          <Slider label="rotation speed" value={settings.rotateSpeed} min={-3} max={3} step={0.1} onChange={v => patch('rotateSpeed', v)} />
        )}
      </Section>

      <Section title="export">
        <Toggle label="transparent bg" value={transparent} onChange={setTransparent} />
        <div className="export-grid">
          {EXPORT_PRESETS.map(p => (
            <button key={p.id} className="export-card" onClick={() => onExport(p.w, p.h)}>
              <div className="export-card-label">{p.label}</div>
              <div className="export-card-size">{p.w} × {p.h}</div>
              <div className="export-card-hint">{p.hint}</div>
            </button>
          ))}
        </div>
        <div className="custom-export">
          <div className="custom-export-label">custom size</div>
          <div className="custom-export-row">
            <input
              type="number" min={64} max={8192} step={1}
              value={customExport.w}
              onChange={e => setCustomExport(s => ({ ...s, w: Math.max(64, Math.min(8192, +e.target.value || 0)) }))}
            />
            <span>×</span>
            <input
              type="number" min={64} max={8192} step={1}
              value={customExport.h}
              onChange={e => setCustomExport(s => ({ ...s, h: Math.max(64, Math.min(8192, +e.target.value || 0)) }))}
            />
            <button className="custom-export-btn" onClick={() => onExport(customExport.w, customExport.h)}>
              export
            </button>
          </div>
        </div>
      </Section>

      <div className="footer-actions">
        <button className="footer-act" onClick={onCopySettings}>copy settings JSON</button>
        <button className="footer-act danger" onClick={onReset}>reset all</button>
      </div>
    </div>
  );
}

// ===========================================================================
// SHARED CONTROLS
// ===========================================================================

function Section({ title, children }) {
  return (
    <div className="section">
      <div className="section-title">{title}</div>
      <div className="section-body">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="field">
      <div className="field-label">{label}</div>
      <div className="field-body">{children}</div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }) {
  return (
    <div className="slider">
      <div className="slider-head">
        <span className="slider-label">{label}</span>
        <span className="slider-value">{Number(value).toFixed(step >= 1 ? 0 : 2)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
      />
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <button className={`toggle ${value ? 'on' : ''}`} onClick={() => onChange(!value)}>
      <span>{label}</span>
      <span className="toggle-switch"><span className="toggle-knob" /></span>
    </button>
  );
}

function SegRadio({ value, onChange, options }) {
  return (
    <div className="seg">
      {options.map(o => (
        <button
          key={o.value}
          className={`seg-btn ${value === o.value ? 'active' : ''}`}
          onClick={() => onChange(o.value)}
        >{o.label}</button>
      ))}
    </div>
  );
}

function PresetGrid({ items, value, onChange, cols = 3 }) {
  return (
    <div className="preset-grid" style={{ '--cols': cols }}>
      {items.map(it => (
        <button
          key={it.id}
          className={`preset-btn ${value === it.id ? 'active' : ''}`}
          onClick={() => onChange(it.id)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function ColorRow({ value, onChange }) {
  return (
    <div className="color-row">
      {COLOR_SWATCHES.map(c => (
        <button
          key={c}
          className={`swatch ${value.toLowerCase() === c.toLowerCase() ? 'active' : ''}`}
          style={{ background: c }}
          onClick={() => onChange(c)}
          aria-label={c}
        />
      ))}
      <label className="swatch-custom" title="custom color">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} />
        <span>+</span>
      </label>
    </div>
  );
}

// ===========================================================================
// HEADER / SHARED CHROME
// ===========================================================================

function Marquee() {
  const items = ['3D render mode', '✦ make it shiny ✦', 'export png any size', '⌬ free forever ⌬', '★彡 take it to your desktop 彡★'];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {[...items, ...items, ...items].map((it, i) => (
          <span key={i} className="marquee-item">{it}<span className="marquee-dot">●</span></span>
        ))}
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header className="topbar">
      <a href="index.html" className="logo">
        <span className="logo-mark">✶</span>
        <span className="logo-text">fancynickna<span className="logo-dot">.</span>me</span>
      </a>
      <nav className="nav">
        <a href="index.html">styles</a>
        <a href="builder.html">workshop</a>
        <a href="render.html" className="nav-active">3D</a>
        <a href="index.html" className="nav-cta">back →</a>
      </nav>
    </header>
  );
}

function Toast({ text }) {
  if (!text) return null;
  return <div className="toast">{text}</div>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RenderApp />);
