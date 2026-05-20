// Nickname Workshop — manual builder
const { useState, useEffect, useRef, useMemo, useCallback } = React;

function BuilderApp() {
  const [name, setName] = useState('');
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('letters');
  const [alphabet, setAlphabet] = useState('bold');
  const [subcat, setSubcat] = useState('Stars');
  const [recent, setRecent] = useState([]);
  const [toast, setToast] = useState(null);
  const [flashChar, setFlashChar] = useState(null);
  const inputRef = useRef(null);

  // Insert helpers ----------------------------------------------------------
  const pushHistory = useCallback((current) => {
    setHistory(h => [...h.slice(-30), current]);
  }, []);

  const insertAtCursor = useCallback((chunk) => {
    pushHistory(name);
    const input = inputRef.current;
    let newName;
    let newCursor;
    if (input && document.activeElement === input) {
      const start = input.selectionStart ?? name.length;
      const end = input.selectionEnd ?? name.length;
      newName = name.slice(0, start) + chunk + name.slice(end);
      newCursor = start + chunk.length;
    } else {
      newName = name + chunk;
      newCursor = newName.length;
    }
    setName(newName);
    setRecent(r => [chunk, ...r.filter(c => c !== chunk)].slice(0, 18));
    setFlashChar(chunk + Math.random()); // unique key per click
    setTimeout(() => setFlashChar(null), 300);
    requestAnimationFrame(() => {
      if (input) {
        input.focus();
        try { input.setSelectionRange(newCursor, newCursor); } catch (e) {}
      }
    });
  }, [name, pushHistory]);

  const applyStyle = useCallback((styleId) => {
    const style = FancyText.styles.find(s => s.id === styleId);
    if (!style) return;
    pushHistory(name);
    setName(style.fn(name || 'YourName'));
  }, [name, pushHistory]);

  const undo = useCallback(() => {
    setHistory(h => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setName(prev);
      return h.slice(0, -1);
    });
  }, []);

  const clear = useCallback(() => {
    pushHistory(name);
    setName('');
    inputRef.current?.focus();
  }, [name, pushHistory]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(name);
      setToast(name ? 'copied to clipboard' : 'copied (nothing to copy)');
      setTimeout(() => setToast(null), 1600);
    } catch (e) {
      setToast('copy failed');
      setTimeout(() => setToast(null), 1600);
    }
  };

  const randomize = useCallback(() => {
    const cats = Object.values(BuilderData.symbolCategories);
    const pool = cats.flat();
    const pick = () => pool[Math.floor(Math.random() * pool.length)];
    const styles = FancyText.styles.filter(s => !s.id.startsWith('zalgo'));
    const style = styles[Math.floor(Math.random() * styles.length)];
    const baseWords = ['void', 'cherry', 'glitch', 'lunar', 'echo', 'static', 'pixel', 'mochi', 'cosmo', 'witch', 'shy', 'feral'];
    const base = baseWords[Math.floor(Math.random() * baseWords.length)];
    const tmpl = BuilderData.templates[Math.floor(Math.random() * BuilderData.templates.length)];
    pushHistory(name);
    setName(`${tmpl.wrap[0]}${pick()} ${style.fn(base)} ${pick()}${tmpl.wrap[1]}`);
  }, [name, pushHistory]);

  return (
    <div className="page" data-screen-label="builder">
      <Marquee />
      <TopBar />
      <main className="workshop">
        <PreviewPane
          name={name}
          setName={setName}
          inputRef={inputRef}
          onCopy={copy}
          onClear={clear}
          onUndo={undo}
          onRandom={randomize}
          canUndo={history.length > 0}
          flashChar={flashChar}
          recent={recent}
          onRecentClick={insertAtCursor}
        />
        <PalettePane
          tab={tab}
          setTab={setTab}
          alphabet={alphabet}
          setAlphabet={setAlphabet}
          subcat={subcat}
          setSubcat={setSubcat}
          onInsert={insertAtCursor}
          onTemplate={(t) => { pushHistory(name); setName(t.wrap[0] + (name || 'YourName') + t.wrap[1]); }}
          onApplyStyle={applyStyle}
          name={name}
        />
      </main>
      <Toast text={toast} />
    </div>
  );
}

// ============================================================================
// HEADER + MARQUEE
// ============================================================================

function Marquee() {
  const items = ['workshop mode', '✦ click anything to insert ✦', 'live preview', '⌬ build your own ⌬', 'no signup', '★彡 from scratch 彡★'];
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
        <a href="builder.html" className="nav-active">workshop</a>
        <a href="render.html">3D</a>
        <a href="index.html" className="nav-cta">back to generator →</a>
      </nav>
    </header>
  );
}

// ============================================================================
// PREVIEW PANE (left, sticky)
// ============================================================================

function PreviewPane({ name, setName, inputRef, onCopy, onClear, onUndo, onRandom, canUndo, flashChar, recent, onRecentClick }) {
  return (
    <aside className="preview-pane">
      <div className="preview-sticky">
        <div className="preview-eyebrow">
          <span className="dot" />
          preview · live
        </div>

        <div className={`preview-box ${flashChar ? 'flash' : ''}`} key={flashChar || 'static'}>
          {name ? (
            <div className="preview-name">{name}</div>
          ) : (
            <div className="preview-placeholder">your nickname appears here →</div>
          )}
          <div className="preview-meta">
            <span>{[...name].length} chars</span>
            <span className="preview-dot">●</span>
            <span>{new Blob([name]).size} bytes</span>
          </div>
        </div>

        <div className="edit-row">
          <label className="edit-label">edit directly</label>
          <input
            ref={inputRef}
            className="edit-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="type or click symbols →"
            spellCheck={false}
          />
        </div>

        <button className="copy-btn" onClick={onCopy}>
          <span>copy nickname</span>
          <span className="copy-icon">⧉</span>
        </button>

        <div className="action-row">
          <button className="act" onClick={onClear} title="clear all">
            <span className="act-glyph">⌫</span>
            <span>clear</span>
          </button>
          <button className="act" onClick={onUndo} disabled={!canUndo} title="undo">
            <span className="act-glyph">↶</span>
            <span>undo</span>
          </button>
          <button className="act" onClick={onRandom} title="randomize">
            <span className="act-glyph">⟳</span>
            <span>random</span>
          </button>
        </div>

        {recent.length > 0 && (
          <div className="recent">
            <div className="recent-label">recently used</div>
            <div className="recent-row">
              {recent.map((r, i) => (
                <button key={i} className="recent-chip" onClick={() => onRecentClick(r)}>{r}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ============================================================================
// PALETTE PANE (right, scrolling)
// ============================================================================

function PalettePane({ tab, setTab, alphabet, setAlphabet, subcat, setSubcat, onInsert, onTemplate, onApplyStyle, name }) {
  const tabs = [
    { id: 'letters', label: 'letters', glyph: '𝓐' },
    { id: 'symbols', label: 'symbols', glyph: '✦' },
    { id: 'decorations', label: 'decorations', glyph: '꧁꧂' },
    { id: 'transform', label: 'transform', glyph: '⇄' },
  ];
  return (
    <section className="palette-pane">
      <div className="palette-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`pal-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="pal-tab-glyph">{t.glyph}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      <div className="palette-body">
        {tab === 'letters' && <LettersPanel alphabet={alphabet} setAlphabet={setAlphabet} onInsert={onInsert} />}
        {tab === 'symbols' && <SymbolsPanel subcat={subcat} setSubcat={setSubcat} onInsert={onInsert} />}
        {tab === 'decorations' && <DecorationsPanel onTemplate={onTemplate} name={name} />}
        {tab === 'transform' && <TransformPanel onApplyStyle={onApplyStyle} name={name} />}
      </div>
    </section>
  );
}

// ============================================================================
// LETTERS PANEL — pick an alphabet, then insert any letter
// ============================================================================

function LettersPanel({ alphabet, setAlphabet, onInsert }) {
  const styleOptions = useMemo(() => FancyText.styles.filter(s =>
    !['flip', 'strike', 'underline', 'wavy', 'spaced', 'zalgoLight', 'zalgoMid', 'zalgoHeavy'].includes(s.id)
  ), []);
  const style = styleOptions.find(s => s.id === alphabet) || styleOptions[0];
  const chars = useMemo(() => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => style.fn(c));
    const lower = 'abcdefghijklmnopqrstuvwxyz'.split('').map(c => style.fn(c));
    const digits = '0123456789'.split('').map(c => style.fn(c));
    return { upper, lower, digits };
  }, [style]);

  return (
    <div className="panel-letters">
      <div className="panel-head">
        <h3>fancy alphabets</h3>
        <p>pick a style, click letters to add them one at a time.</p>
      </div>
      <div className="alphabet-picker">
        {styleOptions.map(s => (
          <button
            key={s.id}
            className={`alpha-pill ${alphabet === s.id ? 'active' : ''}`}
            onClick={() => setAlphabet(s.id)}
          >
            <span className="alpha-pill-name">{s.name}</span>
            <span className="alpha-pill-sample">{s.fn('Aa')}</span>
          </button>
        ))}
      </div>
      <div className="letter-section">
        <div className="letter-section-label">uppercase</div>
        <CharGrid chars={chars.upper} onInsert={onInsert} cols={13} />
      </div>
      <div className="letter-section">
        <div className="letter-section-label">lowercase</div>
        <CharGrid chars={chars.lower} onInsert={onInsert} cols={13} />
      </div>
      <div className="letter-section">
        <div className="letter-section-label">digits</div>
        <CharGrid chars={chars.digits} onInsert={onInsert} cols={10} />
      </div>
    </div>
  );
}

// ============================================================================
// SYMBOLS PANEL — categorized special character grid
// ============================================================================

function SymbolsPanel({ subcat, setSubcat, onInsert }) {
  const cats = Object.keys(BuilderData.symbolCategories);
  const chars = BuilderData.symbolCategories[subcat] || [];
  return (
    <div className="panel-symbols">
      <div className="panel-head">
        <h3>special characters</h3>
        <p>pure Unicode. works in most usernames, bios, chat.</p>
      </div>
      <div className="subcat-row">
        {cats.map(c => (
          <button
            key={c}
            className={`subcat ${subcat === c ? 'active' : ''}`}
            onClick={() => setSubcat(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <CharGrid chars={chars} onInsert={onInsert} cols={10} big />
    </div>
  );
}

// ============================================================================
// DECORATIONS PANEL — wrap templates
// ============================================================================

function DecorationsPanel({ onTemplate, name }) {
  const sample = name || 'YourName';
  return (
    <div className="panel-decorations">
      <div className="panel-head">
        <h3>decoration templates</h3>
        <p>wraps your nickname with matching glyphs on both sides.</p>
      </div>
      <div className="template-grid">
        {BuilderData.templates.map((t, i) => (
          <button key={i} className="template-card" onClick={() => onTemplate(t)}>
            <div className="template-name">{t.name}</div>
            <div className="template-preview">
              {t.wrap[0]}<span className="template-preview-name">{sample}</span>{t.wrap[1]}
            </div>
            <div className="template-action">apply →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TRANSFORM PANEL — apply a style to the whole nickname
// ============================================================================

function TransformPanel({ onApplyStyle, name }) {
  const sample = name || 'YourName';
  return (
    <div className="panel-transform">
      <div className="panel-head">
        <h3>transform the whole thing</h3>
        <p>applies a style to your full nickname. replaces what's there.</p>
      </div>
      <div className="transform-grid">
        {FancyText.styles.map(s => (
          <button key={s.id} className="transform-card" onClick={() => onApplyStyle(s.id)}>
            <div className="transform-name">{s.name}</div>
            <div className="transform-preview">{s.fn(sample)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SHARED: CHAR GRID
// ============================================================================

function CharGrid({ chars, onInsert, cols = 10, big = false }) {
  return (
    <div
      className={`char-grid ${big ? 'big' : ''}`}
      style={{ '--cols': cols }}
    >
      {chars.map((c, i) => (
        <button
          key={i}
          className="char-tile"
          onClick={() => onInsert(c)}
          title={`insert ${c}`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// TOAST
// ============================================================================

function Toast({ text }) {
  if (!text) return null;
  return <div className="toast">{text}</div>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<BuilderApp />);
