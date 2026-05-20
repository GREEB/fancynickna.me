// Fancy text style mappings for nickname generation
// Each style is a function (str) => fancyStr

const A = 'abcdefghijklmnopqrstuvwxyz';
const Au = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const N = '0123456789';

function mapper(lower, upper, digits) {
  return (s) => {
    let out = '';
    for (const ch of s) {
      const li = A.indexOf(ch);
      const ui = Au.indexOf(ch);
      const ni = digits ? N.indexOf(ch) : -1;
      if (li >= 0 && lower) out += lower[li];
      else if (ui >= 0 && upper) out += upper[ui];
      else if (ni >= 0 && digits) out += digits[ni];
      else out += ch;
    }
    return out;
  };
}

// Unicode math alphanumeric — built by code point offsets
function unicodeRange(startLower, startUpper, startDigit) {
  return (s) => {
    let out = '';
    for (const ch of s) {
      const code = ch.codePointAt(0);
      if (ch >= 'a' && ch <= 'z' && startLower) {
        out += String.fromCodePoint(startLower + (code - 97));
      } else if (ch >= 'A' && ch <= 'Z' && startUpper) {
        out += String.fromCodePoint(startUpper + (code - 65));
      } else if (ch >= '0' && ch <= '9' && startDigit) {
        out += String.fromCodePoint(startDigit + (code - 48));
      } else {
        out += ch;
      }
    }
    return out;
  };
}

// Custom: script has some letter exceptions
const scriptMap = {
  B: 'ℬ', E: 'ℰ', F: 'ℱ', H: 'ℋ', I: 'ℐ', L: 'ℒ', M: 'ℳ', R: 'ℛ',
  e: 'ℯ', g: 'ℊ', o: 'ℴ',
};
const fraktur = { C: 'ℭ', H: 'ℌ', I: 'ℑ', R: 'ℜ', Z: 'ℨ' };
const doubleStruck = { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' };

function makeUnicodeStyle(startLower, startUpper, startDigit, overrides = {}) {
  const base = unicodeRange(startLower, startUpper, startDigit);
  return (s) => {
    let out = base(s);
    // re-pass to apply overrides — easier to just do char by char
    let final = '';
    let i = 0;
    while (i < s.length) {
      const ch = s[i];
      if (overrides[ch]) {
        final += overrides[ch];
      } else if (ch >= 'a' && ch <= 'z' && startLower) {
        final += String.fromCodePoint(startLower + (s.charCodeAt(i) - 97));
      } else if (ch >= 'A' && ch <= 'Z' && startUpper) {
        final += String.fromCodePoint(startUpper + (s.charCodeAt(i) - 65));
      } else if (ch >= '0' && ch <= '9' && startDigit) {
        final += String.fromCodePoint(startDigit + (s.charCodeAt(i) - 48));
      } else {
        final += ch;
      }
      i++;
    }
    return final;
  };
}

// Upside down
const flipMap = {
  a:'ɐ', b:'q', c:'ɔ', d:'p', e:'ǝ', f:'ɟ', g:'ƃ', h:'ɥ', i:'ı', j:'ɾ', k:'ʞ',
  l:'l', m:'ɯ', n:'u', o:'o', p:'d', q:'b', r:'ɹ', s:'s', t:'ʇ', u:'n', v:'ʌ',
  w:'ʍ', x:'x', y:'ʎ', z:'z',
  A:'∀', B:'B', C:'Ɔ', D:'D', E:'Ǝ', F:'Ⅎ', G:'פ', H:'H', I:'I', J:'ſ', K:'ʞ',
  L:'˥', M:'W', N:'N', O:'O', P:'Ԁ', Q:'Q', R:'R', S:'S', T:'┴', U:'∩', V:'Λ',
  W:'M', X:'X', Y:'⅄', Z:'Z',
  '0':'0','1':'Ɩ','2':'ᄅ','3':'Ɛ','4':'ㄣ','5':'ϛ','6':'9','7':'ㄥ','8':'8','9':'6',
  '.':'˙', ',':"'", '?':'¿', '!':'¡', "'":',', '"':',,', '(':')', ')':'(',
  '[':']', ']':'[', '{':'}', '}':'{', '<':'>', '>':'<', '&':'⅋', '_':'‾',
};
function flip(s) {
  return Array.from(s).reverse().map(c => flipMap[c] || c).join('');
}

// Small caps
const smallCaps = {
  a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',
  n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ',
};
function toSmallCaps(s) {
  return Array.from(s.toLowerCase()).map(c => smallCaps[c] || c).join('');
}

// Superscript
const superMap = {
  a:'ᵃ',b:'ᵇ',c:'ᶜ',d:'ᵈ',e:'ᵉ',f:'ᶠ',g:'ᵍ',h:'ʰ',i:'ⁱ',j:'ʲ',k:'ᵏ',l:'ˡ',m:'ᵐ',
  n:'ⁿ',o:'ᵒ',p:'ᵖ',q:'q',r:'ʳ',s:'ˢ',t:'ᵗ',u:'ᵘ',v:'ᵛ',w:'ʷ',x:'ˣ',y:'ʸ',z:'ᶻ',
  '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
  '+':'⁺','-':'⁻','=':'⁼','(':'⁽',')':'⁾',
};
function toSuper(s) {
  return Array.from(s.toLowerCase()).map(c => superMap[c] || c).join('');
}

// Strikethrough / underline combining
function combine(s, mark) {
  return Array.from(s).map(c => c + mark).join('');
}

// Zalgo — light/medium chaos
const zalgoUp = ['̍','̎','̄','̅','̿','̑','̆','̐','͒','͗','͑','̇','̈','̊','͂','̓','̈́','͊','͋','͌','̃','̂','̌','͐','̀','́','̋','̏','̒','̓','̔','̽','̉','ͣ','ͤ','ͥ','ͦ','ͧ','ͨ','ͩ','ͪ','ͫ','ͬ','ͭ','ͮ','ͯ','̾','͛','͆','̚'];
const zalgoDown = ['̖','̗','̘','̙','̜','̝','̞','̟','̠','̤','̥','̦','̩','̪','̫','̬','̭','̮','̯','̰','̱','̲','̳','̹','̺','̻','̼','ͅ','͇','͈','͉','͍','͎','͓','͔','͕','͖','͙','͚','̣'];
const zalgoMid = ['̕','̛','̀','́','͘','̡','̢','̧','̨','̴','̵','̶','͜','͝','͞','͟','͠','͢','̸','̷','͡'];
function zalgo(s, intensity = 2) {
  let out = '';
  for (const ch of s) {
    out += ch;
    if (ch === ' ') continue;
    for (let i = 0; i < intensity; i++) out += zalgoUp[Math.floor(Math.random() * zalgoUp.length)];
    for (let i = 0; i < intensity; i++) out += zalgoDown[Math.floor(Math.random() * zalgoDown.length)];
    if (Math.random() < 0.5) out += zalgoMid[Math.floor(Math.random() * zalgoMid.length)];
  }
  return out;
}

// Spaced out
function spaced(s) { return Array.from(s).join(' '); }

// Wide spaces between
function widespaced(s) { return Array.from(s).join('  '); }

// Wavy ~tilde~ around chars
function wavy(s) { return '~' + Array.from(s).join('~') + '~'; }

// Stinky cute
function tildes(s) { return '~*' + s + '*~'; }

// Squiggly underline
function squiggly(s) { return combine(s, '̰'); }

// Bubble (negative — black bg)
const bubbleNeg = unicodeRange(null, 0x1F150, null); // 🅐
function bubbleNegA(s) {
  let out = '';
  for (const ch of s.toUpperCase()) {
    if (ch >= 'A' && ch <= 'Z') out += String.fromCodePoint(0x1F150 + (ch.charCodeAt(0) - 65));
    else out += ch;
  }
  return out;
}

// Bubble (positive)
function bubblePos(s) {
  let out = '';
  for (const ch of s) {
    if (ch >= 'a' && ch <= 'z') out += String.fromCodePoint(0x24D0 + (ch.charCodeAt(0) - 97));
    else if (ch >= 'A' && ch <= 'Z') out += String.fromCodePoint(0x24B6 + (ch.charCodeAt(0) - 65));
    else if (ch >= '1' && ch <= '9') out += String.fromCodePoint(0x2460 + (ch.charCodeAt(0) - 49));
    else if (ch === '0') out += '⓪';
    else out += ch;
  }
  return out;
}

// Squared
function squared(s) {
  let out = '';
  for (const ch of s.toUpperCase()) {
    if (ch >= 'A' && ch <= 'Z') out += String.fromCodePoint(0x1F130 + (ch.charCodeAt(0) - 65));
    else out += ch;
  }
  return out;
}

// Fullwidth
function fullwidth(s) {
  let out = '';
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    if (code >= 33 && code <= 126) out += String.fromCharCode(code + 0xFEE0);
    else if (ch === ' ') out += '　';
    else out += ch;
  }
  return out;
}

// Decoration packs
const decoPacks = {
  none: { pre: '', post: '' },
  sparkles: { pre: '✦ ', post: ' ✦' },
  stars: { pre: '★彡 ', post: ' 彡★' },
  hearts: { pre: '♡ ', post: ' ♡' },
  fire: { pre: '🜲 ', post: ' 🜲' },
  cyber: { pre: '⌬ ', post: ' ⌬' },
  arrows: { pre: '➤ ', post: ' ✦' },
  kawaii: { pre: '⋆˚࿐ ', post: ' ࿐˚⋆' },
  chaos: { pre: '꧁༒ ', post: ' ༒꧂' },
  brackets: { pre: '【 ', post: ' 】' },
  dots: { pre: '·: ', post: ' :·' },
};

window.FancyText = {
  styles: [
    { id: 'bold', name: 'BOLD', fn: makeUnicodeStyle(0x1D41A, 0x1D400, 0x1D7CE) },
    { id: 'italic', name: 'italic', fn: makeUnicodeStyle(0x1D44E, 0x1D434, null) },
    { id: 'boldItalic', name: 'bold italic', fn: makeUnicodeStyle(0x1D482, 0x1D468, null) },
    { id: 'sansBold', name: 'sans bold', fn: makeUnicodeStyle(0x1D5EE, 0x1D5D4, 0x1D7EC) },
    { id: 'sansItalic', name: 'sans italic', fn: makeUnicodeStyle(0x1D622, 0x1D608, null) },
    { id: 'script', name: 'cursive', fn: makeUnicodeStyle(0x1D4B6, 0x1D49C, null, scriptMap) },
    { id: 'boldScript', name: 'bold cursive', fn: makeUnicodeStyle(0x1D4EA, 0x1D4D0, null) },
    { id: 'fraktur', name: 'gothic', fn: makeUnicodeStyle(0x1D51E, 0x1D504, null, fraktur) },
    { id: 'boldFraktur', name: 'bold gothic', fn: makeUnicodeStyle(0x1D586, 0x1D56C, null) },
    { id: 'doubleStruck', name: 'outline', fn: makeUnicodeStyle(0x1D552, 0x1D538, 0x1D7D8, doubleStruck) },
    { id: 'mono', name: 'monospace', fn: makeUnicodeStyle(0x1D68A, 0x1D670, 0x1D7F6) },
    { id: 'fullwidth', name: 'ｆｕｌｌ ｗｉｄｔｈ', fn: fullwidth },
    { id: 'smallCaps', name: 'sᴍᴀʟʟ ᴄᴀᴘs', fn: toSmallCaps },
    { id: 'bubble', name: 'bubble', fn: bubblePos },
    { id: 'bubbleNeg', name: 'inverted bubble', fn: bubbleNegA },
    { id: 'squared', name: 'squared', fn: squared },
    { id: 'super', name: 'ˢᵘᵖᵉʳ', fn: toSuper },
    { id: 'flip', name: 'upside down', fn: flip },
    { id: 'strike', name: 'strikethrough', fn: (s) => combine(s, '̶') },
    { id: 'underline', name: 'underline', fn: (s) => combine(s, '̲') },
    { id: 'wavy', name: 'squiggly', fn: squiggly },
    { id: 'spaced', name: 's p a c e d', fn: spaced },
    { id: 'zalgoLight', name: 'glitch (light)', fn: (s) => zalgo(s, 1) },
    { id: 'zalgoMid', name: 'glitch', fn: (s) => zalgo(s, 3) },
    { id: 'zalgoHeavy', name: 'glitch (heavy)', fn: (s) => zalgo(s, 6) },
  ],
  decoPacks,
};
