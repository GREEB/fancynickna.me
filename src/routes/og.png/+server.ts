import { Resvg } from '@resvg/resvg-js';
import type { RequestHandler } from './$types';

// Dynamic Open Graph image — 1200×630 PNG.
// Pages can call `/og.png?title=Foo` to get a branded card for og:image and twitter:image.
// The brutalist accent + huge display type matches the site aesthetic.

const W = 1200;
const H = 630;

function buildSvg(title: string, subtitle: string): string {
	// Escape so user-provided text can't break the XML
	const t = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 60);
	const s = subtitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 120);
	// Display font is Archivo Black; we render with serif as a portable fallback
	// (resvg-js doesn't have @fontsource/archivo-black available without bundling).
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
		<rect width="${W}" height="${H}" fill="#f5f2ea"/>
		<!-- Accent block in the corner -->
		<rect x="0" y="0" width="240" height="14" fill="#c8ff3d"/>
		<rect x="0" y="0" width="14" height="240" fill="#c8ff3d"/>
		<!-- Bottom-right offset accent (brutalist shadow vibe) -->
		<rect x="${W - 360}" y="${H - 18}" width="360" height="18" fill="#0e0e10"/>
		<rect x="${W - 18}" y="${H - 360}" width="18" height="360" fill="#0e0e10"/>
		<!-- Tagline label -->
		<text x="80" y="120" font-family="ui-monospace, Menlo, monospace" font-size="20" fill="#0e0e10" letter-spacing="2" opacity="0.7">FANCYNICKNA.ME</text>
		<!-- Title -->
		<text x="80" y="320" font-family="Helvetica, Arial, sans-serif" font-weight="900" font-size="118" fill="#0e0e10" letter-spacing="-3">${t}</text>
		<!-- Subtitle -->
		<text x="80" y="430" font-family="ui-monospace, Menlo, monospace" font-size="26" fill="#0e0e10" opacity="0.75">${s}</text>
		<!-- Brand mark accent dot -->
		<circle cx="${W - 90}" cy="120" r="18" fill="#c8ff3d" stroke="#0e0e10" stroke-width="3"/>
	</svg>`;
}

export const GET: RequestHandler = async ({ url, setHeaders }) => {
	const title = url.searchParams.get('title') || 'fancy nickname generator';
	const subtitle =
		url.searchParams.get('subtitle') ||
		'Free Unicode text styles. 38 transforms. 200+ decorations. No signup.';

	const svg = buildSvg(title, subtitle);
	const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();

	setHeaders({
		'content-type': 'image/png',
		// Cached at the edge for a day; cheap to regenerate.
		'cache-control': 'public, max-age=86400, immutable'
	});
	// Resvg returns a Node Buffer; Response wants a BodyInit, so wrap as Uint8Array.
	return new Response(new Uint8Array(png));
};
