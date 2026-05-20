// Home page has no per-request data — prerender it to a static HTML file at
// build time so it doesn't count toward Vercel Hobby's 12-function cap.
export const prerender = true;
