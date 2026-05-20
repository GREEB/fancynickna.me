// Main app for fancynickna.me
const { useState, useEffect, useRef, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "lime",
  "deco": "none",
  "layout": "grid",
  "applyDeco": false,
  "showCount": true,
  "bg": "cream"
}/*EDITMODE-END*/;

const ACCENTS = {
  lime:   { hex: '#C8FF3D', name: 'acid lime' },
  pink:   { hex: '#FF4FB0', name: 'hot pink' },
  blue:   { hex: '#4F7CFF', name: 'electric blue' },
  orange: { hex: '#FF7A3D', name: 'sunset' },
};

const BGS = {
  cream: { bg: '#F5F2EA', fg: '#0E0E10' },
  ink:   { bg: '#0E0E10', fg: '#F5F2EA' },
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [name, setName] = useState('Maya');
  const [copiedId, setCopiedId] = useState(null);
  const [toast, setToast] = useState(null);
  const [tick, setTick] = useState(0);
  const accent = ACCENTS[t.accent] || ACCENTS.lime;
  const bg = BGS[t.bg] || BGS.cream;

  // Re-render zalgo periodically for chaos
  useEffect(() => {
    const id = setInterval(() => setTick(x => x + 1), 1400);
    return () => clearInterval(id);
  }, []);

  // Set CSS vars
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--accent', accent.hex);
    r.style.setProperty('--bg', bg.bg);
    r.style.setProperty('--fg', bg.fg);
    r.style.setProperty('--fg-soft', bg.fg + 'A0');
    r.style.setProperty('--line', bg.fg + '22');
    r.style.setProperty('--card', t.bg === 'ink' ? '#1A1A1D' : '#FFFFFF');
  }, [accent.hex, bg.bg, bg.fg, t.bg]);

  const deco = FancyText.decoPacks[t.deco] || FancyText.decoPacks.none;
  const decorate = (s) => t.applyDeco ? `${deco.pre}${s}${deco.post}` : s;

  const variants = useMemo(() => {
    const input = name || 'YourName';
    return FancyText.styles.map(st => ({
      id: st.id,
      name: st.name,
      value: decorate(st.fn(input)),
    }));
    // eslint-disable-next-line
  }, [name, t.applyDeco, t.deco, tick]);

  const copy = async (variant) => {
    try {
      await navigator.clipboard.writeText(variant.value);
      setCopiedId(variant.id);
      setToast(`copied "${variant.name}"`);
      setTimeout(() => setCopiedId(null), 900);
      setTimeout(() => setToast(null), 1600);
    } catch (e) {
      setToast('copy failed');
      setTimeout(() => setToast(null), 1600);
    }
  };

  return (
    <div className="page" data-screen-label="main">
      <Marquee accent={accent} />
      <TopBar />
      <Hero name={name} setName={setName} accent={accent} count={variants.length} showCount={t.showCount} />
      <SuggestionRow setName={setName} />
      <Results variants={variants} copy={copy} copiedId={copiedId} layout={t.layout} />
      <FAQStrip />
      <FooterStrip accent={accent} />
      <Toast text={toast} />
      <TweaksPanel>
        <TweakSection label="Vibe" />
        <TweakColor
          label="Accent"
          value={accent.hex}
          onChange={hex => {
            const found = Object.entries(ACCENTS).find(([, c]) => c.hex.toLowerCase() === String(hex).toLowerCase());
            if (found) setTweak('accent', found[0]);
          }}
          options={Object.values(ACCENTS).map(c => c.hex)}
        />
        <TweakRadio
          label="Background"
          value={t.bg}
          onChange={v => setTweak('bg', v)}
          options={['cream', 'ink']}
        />
        <TweakSection label="Decorations" />
        <TweakSelect
          label="Pack"
          value={t.deco}
          onChange={v => setTweak('deco', v)}
          options={Object.keys(FancyText.decoPacks)}
        />
        <TweakToggle
          label="Apply to output"
          value={t.applyDeco}
          onChange={v => setTweak('applyDeco', v)}
        />
        <TweakSection label="Layout" />
        <TweakRadio
          label="Grid"
          value={t.layout}
          onChange={v => setTweak('layout', v)}
          options={['grid', 'mosaic', 'list']}
        />
        <TweakToggle
          label="Counter row"
          value={t.showCount}
          onChange={v => setTweak('showCount', v)}
        />
      </TweaksPanel>
    </div>
  );
}

function Marquee({ accent }) {
  const items = ['fancy fancy fancy', '✦ since whenever ✦', 'made for the chronically online', '⌬ no signup ⌬', 'free forever', '★彡 paste anywhere 彡★', 'discord. twitch. bsky. wherever.', '𝓯𝓻𝓮𝓮 𝓯𝓸𝓻𝓮𝓿𝓮𝓻'];
  return (
    <div className="marquee" style={{ background: accent.hex }}>
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
      <div className="logo">
        <span className="logo-mark">✶</span>
        <span className="logo-text">fancynickna<span className="logo-dot">.</span>me</span>
      </div>
      <nav className="nav">
        <a href="#">styles</a>
        <a href="builder.html">workshop</a>
        <a href="render.html">3D</a>
        <a href="render.html" className="nav-cta">try 3D mode →</a>
      </nav>
    </header>
  );
}

function Hero({ name, setName, accent, count, showCount }) {
  const inputRef = useRef(null);
  return (
    <section className="hero">
      <div className="hero-eyebrow">
        <span className="dot" />
        the nickname generator that does too much
      </div>
      <h1 className="hero-title">
        make your name<br />
        <span className="hero-title-fancy">
          <span className="fancy-1">𝕗𝕒𝕟𝕔𝕪</span>
          <span className="fancy-2">𝓯𝓪𝓷𝓬𝔂</span>
          <span className="fancy-3" style={{ color: accent.hex }}>꧁ＦＡＮＣＹ꧂</span>
        </span>
        as hell.
      </h1>
      <p className="hero-sub">
        type your name once. get {count}+ styled versions. tap to copy. paste in your discord, your bio, your group chat, wherever.
      </p>
      <div className="input-cue">
        <span className="input-cue-arrow">↓</span>
        <span>type your name here</span>
      </div>
      <div className="input-wrap">
        <div className="input-label">your name</div>
        <input
          ref={inputRef}
          className="big-input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="type something..."
          maxLength={32}
          autoFocus
        />
        <button className="input-clear" onClick={() => { setName(''); inputRef.current?.focus(); }}>
          clear
        </button>
      </div>
      {showCount && (
        <div className="counter-row">
          <Counter n={count} label="styles" />
          <Counter n={Object.keys(FancyText.decoPacks).length - 1} label="deco packs" />
          <Counter n={32} label="char limit" />
          <Counter n="∞" label="free uses" />
        </div>
      )}
    </section>
  );
}

function Counter({ n, label }) {
  return (
    <div className="counter">
      <div className="counter-n">{n}</div>
      <div className="counter-l">{label}</div>
    </div>
  );
}

const SUGGESTIONS = ['Maya', 'kai', 'Ren', '404', 'voidbabe', 'goblin', 'tofu', 'cherry', 'glitch', 'mochi'];
function SuggestionRow({ setName }) {
  return (
    <div className="suggest-row">
      <span className="suggest-label">try:</span>
      {SUGGESTIONS.map(s => (
        <button key={s} className="chip" onClick={() => setName(s)}>{s}</button>
      ))}
    </div>
  );
}

function Results({ variants, copy, copiedId, layout }) {
  return (
    <section className={`results results-${layout}`}>
      <div className="results-head">
        <h2 className="results-title">all the styles.</h2>
        <div className="results-meta">tap any card · copies instantly</div>
      </div>
      <div className="cards">
        {variants.map((v, i) => (
          <Card key={v.id} v={v} i={i} onCopy={() => copy(v)} copied={copiedId === v.id} layout={layout} />
        ))}
      </div>
    </section>
  );
}

function Card({ v, i, onCopy, copied, layout }) {
  return (
    <button
      className={`card card-${layout} ${copied ? 'copied' : ''}`}
      onClick={onCopy}
      title="click to copy"
    >
      <div className="card-head">
        <span className="card-num">#{String(i + 1).padStart(2, '0')}</span>
        <span className="card-name">{v.name}</span>
        <span className="card-status">{copied ? 'copied!' : 'tap to copy'}</span>
      </div>
      <div className="card-value">{v.value || '\u00A0'}</div>
    </button>
  );
}

function FAQStrip() {
  const faqs = [
    { q: 'is it free?', a: 'yes. forever. no signup. no ads. no tracking.' },
    { q: 'will it work on discord/insta/tiktok?', a: 'most styles, yes. some platforms strip combining characters — try a different style if one breaks.' },
    { q: 'is it actually a font?', a: "nope — unicode characters that look like fonts. that's why they work in places where you can't change the font." },
    { q: 'can i use the glitch one in my username?', a: 'sometimes. try it. worst case it gets rejected and you pick another.' },
  ];
  return (
    <section className="faq">
      <h2 className="faq-title">questions you're definitely asking</h2>
      <div className="faq-grid">
        {faqs.map((f, i) => (
          <div key={i} className="faq-item">
            <div className="faq-q">{f.q}</div>
            <div className="faq-a">{f.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FooterStrip({ accent }) {
  return (
    <footer className="footer">
      <div className="footer-big" style={{ WebkitTextStroke: `2px var(--fg)`, color: 'transparent' }}>
        fancynickna.me
      </div>
      <div className="footer-row">
        <span>© whatever year you're reading this</span>
        <span className="footer-dot">●</span>
        <span>made with too much time</span>
        <span className="footer-dot">●</span>
        <span style={{ color: accent.hex }}>v0.1</span>
      </div>
    </footer>
  );
}

function Toast({ text }) {
  if (!text) return null;
  return <div className="toast">{text}</div>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
