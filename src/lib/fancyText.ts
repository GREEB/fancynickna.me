// Fancy text style mappings for nickname generation
// Ported from design_handoff_fancynickname/fancy-text.js — pure functions, no DOM.

export type StyleFn = (input: string) => string;
export interface FancyStyle {
	id: string;
	name: string;
	fn: StyleFn;
}
export interface DecoPack {
	pre: string;
	post: string;
}

const A = 'abcdefghijklmnopqrstuvwxyz';
const Au = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function makeUnicodeStyle(
	startLower: number | null,
	startUpper: number | null,
	startDigit: number | null,
	overrides: Record<string, string> = {}
): StyleFn {
	return (s: string) => {
		let out = '';
		for (let i = 0; i < s.length; i++) {
			const ch = s[i];
			if (overrides[ch]) {
				out += overrides[ch];
			} else if (ch >= 'a' && ch <= 'z' && startLower !== null) {
				out += String.fromCodePoint(startLower + (s.charCodeAt(i) - 97));
			} else if (ch >= 'A' && ch <= 'Z' && startUpper !== null) {
				out += String.fromCodePoint(startUpper + (s.charCodeAt(i) - 65));
			} else if (ch >= '0' && ch <= '9' && startDigit !== null) {
				out += String.fromCodePoint(startDigit + (s.charCodeAt(i) - 48));
			} else {
				out += ch;
			}
		}
		return out;
	};
}

const scriptMap: Record<string, string> = {
	B: 'ℬ',
	E: 'ℰ',
	F: 'ℱ',
	H: 'ℋ',
	I: 'ℐ',
	L: 'ℒ',
	M: 'ℳ',
	R: 'ℛ',
	e: 'ℯ',
	g: 'ℊ',
	o: 'ℴ'
};
const fraktur: Record<string, string> = { C: 'ℭ', H: 'ℌ', I: 'ℑ', R: 'ℜ', Z: 'ℨ' };
const doubleStruck: Record<string, string> = {
	C: 'ℂ',
	H: 'ℍ',
	N: 'ℕ',
	P: 'ℙ',
	Q: 'ℚ',
	R: 'ℝ',
	Z: 'ℤ'
};

const flipMap: Record<string, string> = {
	a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ı', j: 'ɾ', k: 'ʞ',
	l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ',
	w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
	A: '∀', B: 'B', C: 'Ɔ', D: 'D', E: 'Ǝ', F: 'Ⅎ', G: 'פ', H: 'H', I: 'I', J: 'ſ', K: 'ʞ',
	L: '˥', M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Q', R: 'R', S: 'S', T: '┴', U: '∩', V: 'Λ',
	W: 'M', X: 'X', Y: '⅄', Z: 'Z',
	'0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
	'.': '˙', ',': "'", '?': '¿', '!': '¡', "'": ',', '"': ',,', '(': ')', ')': '(',
	'[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '&': '⅋', _: '‾'
};
function flip(s: string): string {
	return Array.from(s)
		.reverse()
		.map((c) => flipMap[c] ?? c)
		.join('');
}

const smallCaps: Record<string, string> = {
	a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
	n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};
function toSmallCaps(s: string): string {
	return Array.from(s.toLowerCase())
		.map((c) => smallCaps[c] ?? c)
		.join('');
}

const superMap: Record<string, string> = {
	a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ', h: 'ʰ', i: 'ⁱ', j: 'ʲ', k: 'ᵏ', l: 'ˡ', m: 'ᵐ',
	n: 'ⁿ', o: 'ᵒ', p: 'ᵖ', q: 'q', r: 'ʳ', s: 'ˢ', t: 'ᵗ', u: 'ᵘ', v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ',
	'0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
	'+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾'
};
function toSuper(s: string): string {
	return Array.from(s.toLowerCase())
		.map((c) => superMap[c] ?? c)
		.join('');
}

function combine(s: string, mark: string): string {
	return Array.from(s)
		.map((c) => c + mark)
		.join('');
}

const zalgoUp = [
	'̍', '̎', '̄', '̅', '̿', '̑', '̆', '̐', '͒', '͗', '͑', '̇', '̈', '̊', '͂', '̓', '̈́', '͊', '͋', '͌',
	'̃', '̂', '̌', '͐', '̀', '́', '̋', '̏', '̒', '̓', '̔', '̽', '̉', 'ͣ', 'ͤ', 'ͥ', 'ͦ', 'ͧ', 'ͨ', 'ͩ',
	'ͪ', 'ͫ', 'ͬ', 'ͭ', 'ͮ', 'ͯ', '̾', '͛', '͆', '̚'
];
const zalgoDown = [
	'̖', '̗', '̘', '̙', '̜', '̝', '̞', '̟', '̠', '̤', '̥', '̦', '̩', '̪', '̫', '̬', '̭', '̮', '̯',
	'̰', '̱', '̲', '̳', '̹', '̺', '̻', '̼', 'ͅ', '͇', '͈', '͉', '͍', '͎', '͓', '͔', '͕', '͖', '͙',
	'͚', '̣'
];
const zalgoMid = ['̕', '̛', '̀', '́', '͘', '̡', '̢', '̧', '̨', '̴', '̵', '̶', '͜', '͝', '͞', '͟', '͠', '͢', '̸', '̷', '͡'];
function zalgo(s: string, intensity = 2): string {
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

function spaced(s: string): string {
	return Array.from(s).join(' ');
}

function squiggly(s: string): string {
	return combine(s, '̰');
}

function bubbleNegA(s: string): string {
	let out = '';
	for (const ch of s.toUpperCase()) {
		if (ch >= 'A' && ch <= 'Z') out += String.fromCodePoint(0x1f150 + (ch.charCodeAt(0) - 65));
		else out += ch;
	}
	return out;
}

function bubblePos(s: string): string {
	let out = '';
	for (const ch of s) {
		if (ch >= 'a' && ch <= 'z') out += String.fromCodePoint(0x24d0 + (ch.charCodeAt(0) - 97));
		else if (ch >= 'A' && ch <= 'Z') out += String.fromCodePoint(0x24b6 + (ch.charCodeAt(0) - 65));
		else if (ch >= '1' && ch <= '9') out += String.fromCodePoint(0x2460 + (ch.charCodeAt(0) - 49));
		else if (ch === '0') out += '⓪';
		else out += ch;
	}
	return out;
}

function squared(s: string): string {
	let out = '';
	for (const ch of s.toUpperCase()) {
		if (ch >= 'A' && ch <= 'Z') out += String.fromCodePoint(0x1f130 + (ch.charCodeAt(0) - 65));
		else out += ch;
	}
	return out;
}

function fullwidth(s: string): string {
	let out = '';
	for (const ch of s) {
		const code = ch.charCodeAt(0);
		if (code >= 33 && code <= 126) out += String.fromCharCode(code + 0xfee0);
		else if (ch === ' ') out += '　';
		else out += ch;
	}
	return out;
}

// — Additional styles —

const subMap: Record<string, string> = {
	a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ', p: 'ₚ',
	r: 'ᵣ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ',
	'0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
	'+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎'
};
function toSub(s: string): string {
	return Array.from(s.toLowerCase())
		.map((c) => subMap[c] ?? c)
		.join('');
}

function aesthetic(s: string): string {
	const wide = fullwidth(s);
	return Array.from(wide).join(' ');
}

const asianMap: Record<string, string> = {
	A: '卂', B: '乃', C: '匚', D: '刀', E: '乇', F: '千', G: 'Ꮆ', H: '卄', I: '丨', J: '丿', K: 'Ҝ',
	L: 'ㄥ', M: '爪', N: '几', O: 'ㄖ', P: '卩', Q: 'Ҩ', R: '尺', S: '丂', T: 'ㄒ', U: 'ㄩ',
	V: 'ᐯ', W: '山', X: '乂', Y: 'ㄚ', Z: '乙'
};
function asian(s: string): string {
	return Array.from(s.toUpperCase())
		.map((c) => asianMap[c] ?? c)
		.join('');
}

function boxed(s: string): string {
	return Array.from(s)
		.map((c) => (c === ' ' ? ' ' : `[${c}]`))
		.join('');
}

function dotted(s: string): string {
	return Array.from(s).join('·');
}

function mirror(s: string): string {
	return Array.from(s).reverse().join('');
}

function acronym(s: string): string {
	return Array.from(s.toUpperCase()).join('.') + '.';
}

const runicMap: Record<string, string> = {
	A: 'ᚨ', B: 'ᛒ', C: 'ᚲ', D: 'ᛞ', E: 'ᛖ', F: 'ᚠ', G: 'ᚷ', H: 'ᚺ', I: 'ᛁ', J: 'ᛃ', K: 'ᚲ',
	L: 'ᛚ', M: 'ᛗ', N: 'ᚾ', O: 'ᛟ', P: 'ᛈ', Q: 'ᛩ', R: 'ᚱ', S: 'ᛊ', T: 'ᛏ', U: 'ᚢ', V: 'ᚹ',
	W: 'ᚹ', X: 'ᛪ', Y: 'ᛦ', Z: 'ᛉ'
};
function runic(s: string): string {
	return Array.from(s.toUpperCase())
		.map((c) => runicMap[c] ?? c)
		.join('');
}

const greekMap: Record<string, string> = {
	A: 'Α', B: 'Β', C: 'Ϲ', D: 'Δ', E: 'Ε', F: 'Ϝ', G: 'Γ', H: 'Η', I: 'Ι', J: 'Ј', K: 'Κ',
	L: 'Λ', M: 'Μ', N: 'Ν', O: 'Ο', P: 'Ρ', Q: 'Ϙ', R: 'Ρ', S: 'Ϟ', T: 'Τ', U: 'Υ', V: 'Ϋ',
	W: 'Ψ', X: 'Χ', Y: 'Υ', Z: 'Ζ',
	a: 'α', b: 'β', c: 'ϲ', d: 'δ', e: 'ε', f: 'ϝ', g: 'γ', h: 'η', i: 'ι', j: 'ϳ', k: 'κ',
	l: 'λ', m: 'μ', n: 'ν', o: 'ο', p: 'ρ', q: 'ϙ', r: 'ρ', s: 'ϟ', t: 'τ', u: 'υ', v: 'ν',
	w: 'ψ', x: 'χ', y: 'γ', z: 'ζ'
};
function greek(s: string): string {
	return Array.from(s)
		.map((c) => greekMap[c] ?? c)
		.join('');
}

function starsBetween(s: string): string {
	return Array.from(s).join('✦');
}

// L33t speak — classic gamer/hacker letter→number substitutions
const leetMap: Record<string, string> = {
	a: '4', A: '4', b: '8', B: '8', c: '<', C: '<', d: 'D', e: '3', E: '3',
	f: 'F', g: '9', G: '9', h: '#', H: '#', i: '1', I: '1', j: 'J', k: 'K',
	l: '1', L: '1', m: 'M', n: 'N', o: '0', O: '0', p: 'P', q: 'Q', r: 'R',
	s: '5', S: '5', t: '7', T: '7', u: 'U', v: 'V', w: 'W', x: '><', X: '><',
	y: 'Y', z: '2', Z: '2'
};
function leet(s: string): string {
	return Array.from(s)
		.map((c) => leetMap[c] ?? c)
		.join('');
}

// Hacker l33t — heavier substitutions including multi-char ones
const hackerMap: Record<string, string> = {
	a: '@', A: '@', b: '|3', c: '(', d: '|)', e: '3', f: '|=', g: '6',
	h: '|-|', i: '!', j: '_|', k: '|<', l: '|_', m: '|\\/|', n: '|\\|',
	o: '()', p: '|2', q: '0_', r: '/2', s: '$', t: '+', u: '|_|',
	v: '\\/', w: '\\/\\/', x: '><', y: '`/', z: '7_'
};
function hacker(s: string): string {
	return Array.from(s.toLowerCase())
		.map((c) => hackerMap[c] ?? c)
		.join('');
}

// Regional indicator emoji "flag" letters
function regional(s: string): string {
	let out = '';
	for (const ch of s.toUpperCase()) {
		if (ch >= 'A' && ch <= 'Z') out += String.fromCodePoint(0x1f1e6 + (ch.charCodeAt(0) - 65));
		else out += ch;
	}
	return out;
}

export const styles: FancyStyle[] = [
	{ id: 'bold', name: 'BOLD', fn: makeUnicodeStyle(0x1d41a, 0x1d400, 0x1d7ce) },
	{ id: 'italic', name: 'italic', fn: makeUnicodeStyle(0x1d44e, 0x1d434, null) },
	{ id: 'boldItalic', name: 'bold italic', fn: makeUnicodeStyle(0x1d482, 0x1d468, null) },
	{ id: 'sansBold', name: 'sans bold', fn: makeUnicodeStyle(0x1d5ee, 0x1d5d4, 0x1d7ec) },
	{ id: 'sansItalic', name: 'sans italic', fn: makeUnicodeStyle(0x1d622, 0x1d608, null) },
	{ id: 'script', name: 'cursive', fn: makeUnicodeStyle(0x1d4b6, 0x1d49c, null, scriptMap) },
	{ id: 'boldScript', name: 'bold cursive', fn: makeUnicodeStyle(0x1d4ea, 0x1d4d0, null) },
	{ id: 'fraktur', name: 'gothic', fn: makeUnicodeStyle(0x1d51e, 0x1d504, null, fraktur) },
	{ id: 'boldFraktur', name: 'bold gothic', fn: makeUnicodeStyle(0x1d586, 0x1d56c, null) },
	{
		id: 'doubleStruck',
		name: 'outline',
		fn: makeUnicodeStyle(0x1d552, 0x1d538, 0x1d7d8, doubleStruck)
	},
	{ id: 'mono', name: 'monospace', fn: makeUnicodeStyle(0x1d68a, 0x1d670, 0x1d7f6) },
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
	{ id: 'sub', name: 'ₛᵤᵦₛcᵣᵢₚₜ', fn: toSub },
	{ id: 'aesthetic', name: 'ａ ｅ ｓ ｔ ｈ ｅ ｔ ｉ ｃ', fn: aesthetic },
	{ id: 'asian', name: '卂丂丨卂几', fn: asian },
	{ id: 'boxed', name: '[b][o][x][e][d]', fn: boxed },
	{ id: 'dotted', name: 'd·o·t·t·e·d', fn: dotted },
	{ id: 'mirror', name: 'rorrim', fn: mirror },
	{ id: 'acronym', name: 'A.C.R.O.N.Y.M.', fn: acronym },
	{ id: 'runic', name: 'ᚱᚢᚾᛁᚲ', fn: runic },
	{ id: 'greek', name: 'Γrεεκ', fn: greek },
	{ id: 'stars', name: 's✦t✦a✦r✦s', fn: starsBetween },
	{ id: 'leet', name: 'l337', fn: leet },
	{ id: 'hacker', name: 'h@ck3r |2 ', fn: hacker },
	{ id: 'regional', name: '🇷 🇪 🇬 🇮 🇴 🇳', fn: regional }
];

export const decoPacks: Record<string, DecoPack> = {
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
	dots: { pre: '·: ', post: ' :·' }
};

export function applyStyle(
	name: string,
	style: FancyStyle,
	deco?: DecoPack,
	applyDeco = false
): string {
	const base = style.fn(name);
	if (deco && applyDeco) return deco.pre + base + deco.post;
	return base;
}
