// Descriptive metadata for each fancyText style.
// Used by the /styles index for short blurbs and by /styles/[id] for full SEO copy.

export interface StyleMeta {
	tagline: string;
	description: string;
	useCases: string[];
	worksIn: string;
	notes?: string;
}

export const styleMeta: Record<string, StyleMeta> = {
	bold: {
		tagline: 'Heavy serif bold letters from the Unicode mathematical alphanumerics block.',
		description:
			'Bold uses the Unicode mathematical bold characters (U+1D400–U+1D433 for letters, U+1D7CE–U+1D7D7 for digits). It renders with weight regardless of the surrounding font, which makes it stand out in usernames, bios, and chat where you can\'t apply CSS.',
		useCases: ['Discord usernames', 'Instagram bios', 'Twitter display names', 'Reddit flair'],
		worksIn: 'most modern platforms — anywhere with Unicode support'
	},
	italic: {
		tagline: 'Mathematical italic letters with a calligraphic slant.',
		description:
			'Italic uses Unicode\'s mathematical italic block (U+1D434–U+1D467). The slant is real Unicode, not CSS, so it survives copy-paste into apps that strip formatting.',
		useCases: ['Twitter tweets', 'TikTok bios', 'forum signatures'],
		worksIn: 'most platforms'
	},
	boldItalic: {
		tagline: 'Bold and italic combined — heavyweight emphasis.',
		description:
			'Bold italic combines the visual weight of bold with the slant of italic, drawn from Unicode\'s mathematical bold italic block. Use when you want maximum emphasis.',
		useCases: ['game tags', 'profile headers'],
		worksIn: 'most platforms'
	},
	sansBold: {
		tagline: 'Bold, sans-serif — clean and assertive.',
		description:
			'Sans bold uses Unicode\'s mathematical sans-serif bold characters. Reads cleaner than serif bold for short usernames; particularly nice with all-caps.',
		useCases: ['gaming usernames', 'modern brand handles', 'tech profiles'],
		worksIn: 'most platforms'
	},
	sansItalic: {
		tagline: 'Italic sans-serif — minimal and modern.',
		description:
			'Sans italic gives you a soft slant without the heavy serifs. Best for short, casual names where serif italic would feel too formal.',
		useCases: ['Instagram', 'Pinterest', 'aesthetic profile names'],
		worksIn: 'most platforms'
	},
	script: {
		tagline: 'Cursive calligraphic letters — handwritten elegance.',
		description:
			'Cursive uses Unicode\'s mathematical script block, designed to mimic copperplate handwriting. A few uppercase letters (B, E, F, H, I, L, M, R) use their dedicated Letterlike Symbols codepoints for proper rendering.',
		useCases: ['wedding-style bios', 'romantic profile names', 'art portfolios'],
		worksIn: 'most platforms (some old Android may show boxes for rare letters)'
	},
	boldScript: {
		tagline: 'Bold calligraphic cursive — confident and ornamental.',
		description:
			'Bold cursive uses Unicode\'s mathematical bold script block. Heavier than plain cursive, with thick downstrokes. Great when cursive feels too thin.',
		useCases: ['fashion profiles', 'luxury aesthetic bios', 'art handles'],
		worksIn: 'most platforms'
	},
	fraktur: {
		tagline: 'Gothic blackletter — medieval, metal, dramatic.',
		description:
			'Fraktur (gothic) draws from Unicode\'s mathematical fraktur block. Originally used for typesetting in 15th-century Europe, now a hallmark of metal bands and tattoo lettering.',
		useCases: ['metal band fans', 'darkcore aesthetic', 'fantasy game characters'],
		worksIn: 'most platforms'
	},
	boldFraktur: {
		tagline: 'Bold gothic blackletter — the heaviest medieval option.',
		description:
			'Bold fraktur is the heavyweight cousin of regular gothic. Dense, theatrical, and unmissable.',
		useCases: ['black metal handles', 'gothic streamers', 'fantasy clan tags'],
		worksIn: 'most platforms'
	},
	doubleStruck: {
		tagline: 'Outline letters — like ℝℕ math sets.',
		description:
			'Double-struck (outline) uses Unicode\'s mathematical double-struck block, also known as blackboard bold. Letters appear hollow, with a doubled outer stroke.',
		useCases: ['minimalist usernames', 'science/math profiles', 'aesthetic gamertags'],
		worksIn: 'most platforms'
	},
	mono: {
		tagline: 'Monospace — every character the same width.',
		description:
			'Monospace uses Unicode\'s mathematical monospace block. Each character takes the same horizontal space, like a typewriter. Looks great for ASCII-art-adjacent vibes.',
		useCases: ['coder profiles', 'terminal aesthetic', 'hacker-themed names'],
		worksIn: 'most platforms (best with monospace-friendly fonts)'
	},
	fullwidth: {
		tagline: 'Full-width — vaporwave Japanese-style spacing.',
		description:
			'Fullwidth maps ASCII to its CJK-fullwidth equivalents (U+FF01–U+FF5E). The same characters East-Asian typography uses inline; reads as the unmistakable ｖａｐｏｒｗａｖｅ aesthetic.',
		useCases: ['vaporwave bios', 'lo-fi music profiles', '90s aesthetic usernames'],
		worksIn: 'most platforms'
	},
	smallCaps: {
		tagline: 'Small capitals — uppercase letterforms at lowercase height.',
		description:
			'Small caps approximates the typographic technique of using small-height capital letters. Uses Unicode IPA and phonetic block characters. Subtle but distinctive.',
		useCases: ['minimalist profiles', 'reading-list bios', 'editorial handles'],
		worksIn: 'most platforms'
	},
	bubble: {
		tagline: 'Circled letters — each character inside a circle.',
		description:
			'Bubble (positive) uses Unicode\'s enclosed alphanumerics block (U+24B6 for caps, U+24D0 for lowercase). Looks like sticker letters or playground typography.',
		useCases: ['cute aesthetic profiles', 'kawaii bios', 'sticker-style handles'],
		worksIn: 'most platforms'
	},
	bubbleNeg: {
		tagline: 'Inverted circled letters — white text on dark filled circles.',
		description:
			'Inverted bubble uses Unicode\'s negative-circled letters (U+1F150–U+1F169). Dramatic, punchy, and surprisingly emoji-compatible.',
		useCases: ['streamer handles', 'gaming tags', 'high-contrast bios'],
		worksIn: 'most platforms'
	},
	squared: {
		tagline: 'Squared letters — letterforms inside boxes.',
		description:
			'Squared uses Unicode\'s squared letters block (U+1F130–U+1F149). Industrial, modular, and reminiscent of warning labels or sci-fi UIs.',
		useCases: ['sci-fi clan tags', 'cyberpunk profiles', 'industrial design bios'],
		worksIn: 'most platforms'
	},
	super: {
		tagline: 'Superscript — tiny letters raised above the baseline.',
		description:
			'Superscript shrinks letters and lifts them up. Built from Unicode\'s superscript modifier letters; some letters (like q) have no superscript form and stay normal.',
		useCases: ['minimalist usernames', 'compact bios', 'footnote-style flair'],
		worksIn: 'most platforms'
	},
	sub: {
		tagline: 'Subscript — tiny letters dropped below the baseline.',
		description:
			'Subscript drops letters below the baseline. Subscript Unicode coverage is partial (a, e, h, i, j, k, l, m, n, o, p, r, s, t, u, v, x); the rest pass through unchanged.',
		useCases: ['math-themed bios', 'chemistry handles', 'compact accents'],
		worksIn: 'most platforms — partial letter coverage'
	},
	flip: {
		tagline: 'Upside-down text — characters flipped 180° and reversed.',
		description:
			'Flip rotates each character 180° using a custom lookup of Unicode characters that visually approximate inverted versions. Then reverses the order so it reads correctly when the screen is upside-down.',
		useCases: ['funny bios', 'attention-grabbing tweets', 'pranks'],
		worksIn: 'most platforms'
	},
	strike: {
		tagline: 'Strikethrough — a line through every character.',
		description:
			'Strikethrough applies the combining long stroke overlay (U+0336) after each character. Works on any letters, digits, or symbols.',
		useCases: ['edit notes in bios', 'crossed-out aesthetic', 'punk handles'],
		worksIn: 'most platforms'
	},
	underline: {
		tagline: 'Underline — a line beneath every character.',
		description:
			'Underline applies the combining low line (U+0332) after each character. Real underline, no CSS needed, survives copy-paste.',
		useCases: ['emphasis in plain-text bios', 'link-style flair'],
		worksIn: 'most platforms'
	},
	wavy: {
		tagline: 'Squiggly — a wavy line beneath every character.',
		description:
			'Squiggly applies the combining tilde below (U+0330) after each character. Suggests a hand-drawn underline.',
		useCases: ['casual bios', 'doodle aesthetic'],
		worksIn: 'most platforms'
	},
	spaced: {
		tagline: 'Spaced out — single spaces between every character.',
		description:
			'Spaced inserts a regular space between every character. Slows the eye down, makes short names feel longer.',
		useCases: ['minimalist bios', 'editorial profile names'],
		worksIn: 'everywhere'
	},
	zalgoLight: {
		tagline: 'Light glitch — subtle combining marks above and below.',
		description:
			'Zalgo (light) randomly stacks 1–2 Unicode combining diacritics around each character. Looks corrupted but readable. Re-rolls every 1.4 seconds in preview.',
		useCases: ['horror aesthetic', 'creepypasta bios', 'glitch-art handles'],
		worksIn: 'most platforms — some may collapse the stacking'
	},
	zalgoMid: {
		tagline: 'Mid glitch — moderately corrupted text.',
		description:
			'Zalgo (mid) stacks 3 combining marks per character. The classic "corrupted text" look without going full chaos.',
		useCases: ['horror handles', 'darkcore bios'],
		worksIn: 'most platforms — visual results vary'
	},
	zalgoHeavy: {
		tagline: 'Heavy glitch — maximum corruption.',
		description:
			'Zalgo (heavy) stacks 6 combining marks per character. Pure visual noise, may break some text layouts.',
		useCases: ['extreme glitch art', 'horror cores'],
		worksIn: 'most platforms — may break some renderers'
	},
	aesthetic: {
		tagline: 'Aesthetic — fullwidth letters with spaces between them.',
		description:
			'Aesthetic combines the fullwidth CJK-style spacing with extra spaces between every character. The signature look of vaporwave, lo-fi, and aesthetic social media accounts.',
		useCases: ['vaporwave bios', 'TikTok handles', 'aesthetic Tumblr', 'lo-fi music'],
		worksIn: 'most platforms'
	},
	asian: {
		tagline: 'Asian-style — CJK characters that visually approximate Latin letters.',
		description:
			'Asian uses Chinese, Japanese, Korean, Cherokee, and Cyrillic characters that look like Latin letters (e.g. A → 卂, S → 丂). Popular in fighting-game tags and 2000s online culture.',
		useCases: ['fighting game tags', 'clan names', 'retro gaming profiles'],
		worksIn: 'most platforms — name filters may block some characters',
		notes: 'These are real CJK codepoints, not Latin lookalikes — they\'ll fail strict ASCII filters.'
	},
	boxed: {
		tagline: 'Boxed — each letter wrapped in square brackets.',
		description:
			'Boxed inserts each character into ASCII square brackets like [M][A][Y][A]. Reads like a 90s arcade scoreboard or DOS BBS handle.',
		useCases: ['retro arcade tags', 'BBS-style names', 'retro game handles'],
		worksIn: 'everywhere (pure ASCII)'
	},
	dotted: {
		tagline: 'Dotted — letters joined by middle dots.',
		description:
			'Dotted joins each character with a Unicode middle dot (U+00B7). M·A·Y·A. Reads clean, minimal, and slightly typographic.',
		useCases: ['minimalist bios', 'design portfolios', 'editorial handles'],
		worksIn: 'everywhere'
	},
	mirror: {
		tagline: 'Mirror — character order reversed.',
		description:
			'Mirror reverses the character order without flipping the letterforms themselves. "Maya" becomes "ayaM". Useful for palindrome-style handles.',
		useCases: ['puzzle bios', 'cryptic handles'],
		worksIn: 'everywhere'
	},
	acronym: {
		tagline: 'Acronym — uppercase letters joined by dots.',
		description:
			'Acronym uppercases every character and joins them with dots. M.A.Y.A. — like an organization name or government agency tag.',
		useCases: ['fake-agency bios', 'professional-aesthetic handles', 'corporate parody'],
		worksIn: 'everywhere'
	},
	runic: {
		tagline: 'Runic — Norse rune characters that approximate Latin letters.',
		description:
			'Runic uses Unicode\'s runic block (U+16A0–U+16F8). The Anglo-Saxon and Younger Futhark runes that look closest to each Latin letter. Used by Vikings, fantasy gamers, and Black Metal.',
		useCases: ['fantasy RPG characters', 'viking-themed handles', 'metal band fans'],
		worksIn: 'most platforms — some name filters may block non-Latin scripts'
	},
	greek: {
		tagline: 'Greek-lookalike — Greek letters that mimic Latin.',
		description:
			'Greek uses Greek and Coptic block characters that visually resemble Latin letters (A → Α, B → Β, K → Κ). The "homoglyph" technique is also why this style can sometimes bypass naive content filters.',
		useCases: ['fraternity/sorority profiles', 'classics enthusiasts', 'subtle filter evasion (ethically)'],
		worksIn: 'most platforms',
		notes: 'These are real Greek letters, not Latin. Phishing/abuse uses of homoglyphs aren\'t supported.'
	},
	stars: {
		tagline: 'Stars between — letters joined by sparkle characters.',
		description:
			'Stars between joins each character with ✦ (U+2726 black four-pointed star). Decorative, sparkly, K-pop-fancam-friendly.',
		useCases: ['K-pop fan accounts', 'stan twitter bios', 'sparkle aesthetic profiles'],
		worksIn: 'most platforms'
	}
};
