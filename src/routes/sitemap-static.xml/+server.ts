import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async ({ url }) => {
	const origin = url.origin;
	const paths = ['/', '/styles', '/advanced', '/decorations', '/3d', '/games', '/symbols', '/about'];
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/0.9">
${paths.map((p) => `<url><loc>${origin}${p}</loc></url>`).join('\n')}
</urlset>`;
	return new Response(xml, {
		headers: { 'content-type': 'application/xml; charset=utf-8' }
	});
};
