import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { RequestHandler } from './$types';
// Vite's ?inline returns the font as a base64 data URL baked into the JS bundle.
// We use this instead of readFileSync(import.meta.url-relative path) because the
// Vercel adapter doesn't ship loose files next to the compiled +server.js — and
// SvelteKit's postbuild `analyse` step runs the module to extract metadata, so
// any module-init `readFileSync` of an asset path explodes during build.
// ~90KB TTF -> ~120KB base64 string in the bundle; cost is acceptable.
import archivoBlackDataUrl from '$lib/server/og/ArchivoBlack-Regular.ttf?inline';

// Dynamic Open Graph image — 1200×630 PNG.
//
// Modes (driven by query params):
//  - default:          /og.png?title=Foo&subtitle=Bar       -> brand card with big title
//  - character mode:   /og.png?char=♥&title=name&subtitle=… -> giant glyph on left, name+meta right
//
// Title font is Archivo Black (inlined above). System fonts stay enabled so the
// serif fallback covers Unicode glyphs that Archivo Black doesn't have (hearts,
// math, currency, etc.) — on Vercel's runtime that's DejaVu.

const W = 1200;
const H = 630;

// Lazy /tmp setup: resvg-js 2.6 only accepts file paths (not buffers) via
// `font.fontFiles`. Decoding the inlined data URL once on first request and
// writing it to /tmp gives resvg a stable path to open without doing IO at
// module init (which would fail SvelteKit's analyse phase on the build host).
let cachedFontPath: string | null = null;
function ensureFontPath(): string {
	if (cachedFontPath) return cachedFontPath;
	const p = join(tmpdir(), 'fancynickname-archivo-black.ttf');
	if (!existsSync(p)) {
		const base64 = archivoBlackDataUrl.split(',')[1];
		writeFileSync(p, Buffer.from(base64, 'base64'));
	}
	cachedFontPath = p;
	return p;
}

function esc(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Rough visual char count — uses Array.from to count grapheme codepoints,
// so emoji/CJK count as 1 instead of 2-4 like .length would give.
function visibleLength(s: string): number {
	return Array.from(s).length;
}

function fontSizeForTitle(title: string): number {
	const n = visibleLength(title);
	if (n <= 2) return 360;
	if (n <= 4) return 240;
	if (n <= 8) return 160;
	if (n <= 12) return 120;
	if (n <= 18) return 92;
	if (n <= 26) return 72;
	if (n <= 36) return 58;
	return 48;
}

function buildDefault(title: string, subtitle: string): string {
	const t = esc(title.slice(0, 60));
	const s = esc(subtitle.slice(0, 120));
	const size = fontSizeForTitle(title);
	const titleY = size >= 280 ? 420 : size >= 180 ? 360 : 320;

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
		<rect width="${W}" height="${H}" fill="#f5f2ea"/>
		<rect x="0" y="0" width="240" height="14" fill="#c8ff3d"/>
		<rect x="0" y="0" width="14" height="240" fill="#c8ff3d"/>
		<rect x="${W - 360}" y="${H - 18}" width="360" height="18" fill="#0e0e10"/>
		<rect x="${W - 18}" y="${H - 360}" width="18" height="360" fill="#0e0e10"/>
		<text x="80" y="120" font-family="ui-monospace, Menlo, monospace" font-size="20" fill="#0e0e10" letter-spacing="2" opacity="0.7">FANCYNICKNA.ME</text>
		<text x="80" y="${titleY}" font-family="Archivo Black" font-size="${size}" fill="#0e0e10" letter-spacing="-3">${t}</text>
		<text x="80" y="${titleY + 110}" font-family="ui-monospace, Menlo, monospace" font-size="26" fill="#0e0e10" opacity="0.75">${s}</text>
		<circle cx="${W - 90}" cy="120" r="18" fill="#c8ff3d" stroke="#0e0e10" stroke-width="3"/>
	</svg>`;
}

function buildCharacter(char: string, name: string, subtitle: string): string {
	const c = esc(Array.from(char)[0] ?? '?');
	const n = esc(name.slice(0, 40));
	const s = esc(subtitle.slice(0, 80));
	const nlen = visibleLength(name);
	const nameSize = nlen > 28 ? 40 : nlen > 22 ? 48 : nlen > 16 ? 56 : nlen > 10 ? 68 : 80;

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
		<rect width="${W}" height="${H}" fill="#f5f2ea"/>
		<rect x="60" y="90" width="500" height="500" rx="24" fill="#ffffff" stroke="#0e0e10" stroke-width="3"/>
		<rect x="68" y="98" width="500" height="500" rx="24" fill="transparent" stroke="#c8ff3d" stroke-width="3" opacity="0.6"/>
		<text x="600" y="120" font-family="ui-monospace, Menlo, monospace" font-size="20" fill="#0e0e10" letter-spacing="2" opacity="0.7">FANCYNICKNA.ME · UNICODE</text>
		<text x="310" y="430" font-family="serif" font-size="380" fill="#0e0e10" text-anchor="middle">${c}</text>
		<text x="600" y="320" font-family="Archivo Black" font-size="${nameSize}" fill="#0e0e10" letter-spacing="-2">${n}</text>
		<text x="600" y="${320 + nameSize + 24}" font-family="ui-monospace, Menlo, monospace" font-size="26" fill="#0e0e10" opacity="0.75">${s}</text>
		<rect x="0" y="0" width="14" height="${H}" fill="#c8ff3d"/>
		<rect x="${W - 18}" y="${H - 360}" width="18" height="360" fill="#0e0e10"/>
	</svg>`;
}

function render(svg: string, fontPath: string): Buffer {
	return new Resvg(svg, {
		fitTo: { mode: 'width', value: W },
		font: {
			loadSystemFonts: true,
			fontFiles: [fontPath],
			defaultFontFamily: 'Archivo Black'
		}
	})
		.render()
		.asPng();
}

export const GET: RequestHandler = async ({ url, setHeaders }) => {
	const char = url.searchParams.get('char');
	const title = url.searchParams.get('title') || 'fancy nickname generator';
	const subtitle =
		url.searchParams.get('subtitle') || 'Free Unicode text styles. Click to copy. No signup.';

	const fontPath = ensureFontPath();
	const svg = char ? buildCharacter(char, title, subtitle) : buildDefault(title, subtitle);
	const png = render(svg, fontPath);

	setHeaders({
		'content-type': 'image/png',
		'cache-control': 'public, max-age=86400, immutable'
	});
	return new Response(new Uint8Array(png));
};
