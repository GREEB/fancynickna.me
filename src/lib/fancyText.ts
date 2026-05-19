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
	{ id: 'zalgoHeavy', name: 'glitch (heavy)', fn: (s) => zalgo(s, 6) }
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
