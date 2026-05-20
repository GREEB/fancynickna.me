// Pre/post nickname decorations — the classic MSN / MySpace / Skype-era
// "wrap your name in ASCII art" library. Each entry is a (pre, post) pair that
// gets concatenated around the user's name like `${pre}name${post}`.
//
// Curated by hand because the best-known online catalog (nickfinder.com) is
// behind Cloudflare Turnstile and the others load via JS. If we later want to
// expand this, the right path is probably a Bun script that pulls from a JSON
// dataset in a public GitHub repo (kaomoji databases work).

export interface Decoration {
	id: string;
	pre: string;
	post: string;
	category: DecoCategory;
}

export type DecoCategory =
	| 'hearts'
	| 'sparkles'
	| 'stars'
	| 'flowers'
	| 'royal'
	| 'gothic'
	| 'gaming'
	| 'brackets'
	| 'arrows'
	| 'kawaii'
	| 'symbols'
	| 'lines'
	| 'fire'
	| 'msn';

export const decorationCategories: { id: DecoCategory; label: string }[] = [
	{ id: 'hearts', label: 'hearts' },
	{ id: 'sparkles', label: 'sparkles' },
	{ id: 'stars', label: 'stars' },
	{ id: 'flowers', label: 'flowers' },
	{ id: 'royal', label: 'royal' },
	{ id: 'gothic', label: 'gothic' },
	{ id: 'gaming', label: 'gaming' },
	{ id: 'brackets', label: 'brackets' },
	{ id: 'arrows', label: 'arrows' },
	{ id: 'kawaii', label: 'kawaii' },
	{ id: 'symbols', label: 'symbols' },
	{ id: 'lines', label: 'lines' },
	{ id: 'fire', label: 'fire' },
	{ id: 'msn', label: 'msn classic' }
];

// 200+ decorations. id is intentionally just an index suffix per category
// because the visual is the identity — these get listed and previewed, not
// individually named.
export const decorations: Decoration[] = [
	// HEARTS
	{ id: 'hearts-1', pre: '♡ ', post: ' ♡', category: 'hearts' },
	{ id: 'hearts-2', pre: '♥ ', post: ' ♥', category: 'hearts' },
	{ id: 'hearts-3', pre: '❤ ', post: ' ❤', category: 'hearts' },
	{ id: 'hearts-4', pre: '❥ ', post: ' ❥', category: 'hearts' },
	{ id: 'hearts-5', pre: '꒰♡ ', post: ' ♡꒱', category: 'hearts' },
	{ id: 'hearts-6', pre: '˚ʚ♡ɞ˚ ', post: ' ˚ʚ♡ɞ˚', category: 'hearts' },
	{ id: 'hearts-7', pre: '♡⃕ ', post: ' ⃕♡', category: 'hearts' },
	{ id: 'hearts-8', pre: '♡˖꒰ ', post: ' ꒱˖♡', category: 'hearts' },
	{ id: 'hearts-9', pre: 'ღ ', post: ' ღ', category: 'hearts' },
	{ id: 'hearts-10', pre: '♡ܓ ', post: ' ܓ♡', category: 'hearts' },
	{ id: 'hearts-11', pre: '❣ ', post: ' ❣', category: 'hearts' },
	{ id: 'hearts-12', pre: '♡̷̷̷ ', post: ' ̷̷̷♡', category: 'hearts' },
	{ id: 'hearts-13', pre: '(♡‿♡) ', post: ' (♡‿♡)', category: 'hearts' },
	{ id: 'hearts-14', pre: '✿ ♡ ✿ ', post: ' ✿ ♡ ✿', category: 'hearts' },
	{ id: 'hearts-15', pre: '~♡~ ', post: ' ~♡~', category: 'hearts' },

	// SPARKLES
	{ id: 'sparkles-1', pre: '✦ ', post: ' ✦', category: 'sparkles' },
	{ id: 'sparkles-2', pre: '✧ ', post: ' ✧', category: 'sparkles' },
	{ id: 'sparkles-3', pre: '⋆˚࿔ ', post: ' ࿔˚⋆', category: 'sparkles' },
	{ id: 'sparkles-4', pre: '✧˖° ', post: ' °˖✧', category: 'sparkles' },
	{ id: 'sparkles-5', pre: '⋆｡˚ ', post: ' ˚｡⋆', category: 'sparkles' },
	{ id: 'sparkles-6', pre: '✦.•° ', post: ' °•.✦', category: 'sparkles' },
	{ id: 'sparkles-7', pre: '꒰⊹ ', post: ' ⊹꒱', category: 'sparkles' },
	{ id: 'sparkles-8', pre: '⊹ ࣪ ˖ ', post: ' ˖ ࣪ ⊹', category: 'sparkles' },
	{ id: 'sparkles-9', pre: '𓆩 ', post: ' 𓆪', category: 'sparkles' },
	{ id: 'sparkles-10', pre: '✦༻ ', post: ' ༺✦', category: 'sparkles' },
	{ id: 'sparkles-11', pre: '⊰⊹ ', post: ' ⊹⊱', category: 'sparkles' },
	{ id: 'sparkles-12', pre: '✩‧₊˚ ', post: ' ˚₊‧✩', category: 'sparkles' },
	{ id: 'sparkles-13', pre: '· ✦ · ', post: ' · ✦ ·', category: 'sparkles' },
	{ id: 'sparkles-14', pre: '⋆ ‧₊˚ ', post: ' ˚₊‧ ⋆', category: 'sparkles' },
	{ id: 'sparkles-15', pre: '⁺ ˚ . * ', post: ' * . ˚ ⁺', category: 'sparkles' },

	// STARS
	{ id: 'stars-1', pre: '★ ', post: ' ★', category: 'stars' },
	{ id: 'stars-2', pre: '☆ ', post: ' ☆', category: 'stars' },
	{ id: 'stars-3', pre: '★彡 ', post: ' 彡★', category: 'stars' },
	{ id: 'stars-4', pre: '✬ ', post: ' ✬', category: 'stars' },
	{ id: 'stars-5', pre: '✯ ', post: ' ✯', category: 'stars' },
	{ id: 'stars-6', pre: '⭐ ', post: ' ⭐', category: 'stars' },
	{ id: 'stars-7', pre: '☄ ', post: ' ☄', category: 'stars' },
	{ id: 'stars-8', pre: '★~★ ', post: ' ★~★', category: 'stars' },
	{ id: 'stars-9', pre: '~☆~ ', post: ' ~☆~', category: 'stars' },
	{ id: 'stars-10', pre: '☆ʚ ', post: ' ɞ☆', category: 'stars' },

	// FLOWERS
	{ id: 'flowers-1', pre: '✿ ', post: ' ✿', category: 'flowers' },
	{ id: 'flowers-2', pre: '❀ ', post: ' ❀', category: 'flowers' },
	{ id: 'flowers-3', pre: '❁ ', post: ' ❁', category: 'flowers' },
	{ id: 'flowers-4', pre: '✾ ', post: ' ✾', category: 'flowers' },
	{ id: 'flowers-5', pre: '❃ ', post: ' ❃', category: 'flowers' },
	{ id: 'flowers-6', pre: '✼ ', post: ' ✼', category: 'flowers' },
	{ id: 'flowers-7', pre: '⚘ ', post: ' ⚘', category: 'flowers' },
	{ id: 'flowers-8', pre: '☘ ', post: ' ☘', category: 'flowers' },
	{ id: 'flowers-9', pre: '🌸 ', post: ' 🌸', category: 'flowers' },
	{ id: 'flowers-10', pre: '🌺 ', post: ' 🌺', category: 'flowers' },
	{ id: 'flowers-11', pre: '🌹 ', post: ' 🌹', category: 'flowers' },
	{ id: 'flowers-12', pre: '🌻 ', post: ' 🌻', category: 'flowers' },
	{ id: 'flowers-13', pre: '🌼 ', post: ' 🌼', category: 'flowers' },
	{ id: 'flowers-14', pre: '🏵 ', post: ' 🏵', category: 'flowers' },
	{ id: 'flowers-15', pre: '💐 ', post: ' 💐', category: 'flowers' },
	{ id: 'flowers-16', pre: '✿◕‿◕✿ ', post: ' ✿◕‿◕✿', category: 'flowers' },
	{ id: 'flowers-17', pre: 'ʚ✿ɞ ', post: ' ʚ✿ɞ', category: 'flowers' },
	{ id: 'flowers-18', pre: '❀✿❀ ', post: ' ❀✿❀', category: 'flowers' },

	// ROYAL
	{ id: 'royal-1', pre: '♔ ', post: ' ♔', category: 'royal' },
	{ id: 'royal-2', pre: '♛ ', post: ' ♛', category: 'royal' },
	{ id: 'royal-3', pre: '♚ ', post: ' ♚', category: 'royal' },
	{ id: 'royal-4', pre: '✦♕✦ ', post: ' ✦♕✦', category: 'royal' },
	{ id: 'royal-5', pre: '⚜ ', post: ' ⚜', category: 'royal' },
	{ id: 'royal-6', pre: '✤ ', post: ' ✤', category: 'royal' },
	{ id: 'royal-7', pre: '✺ ', post: ' ✺', category: 'royal' },
	{ id: 'royal-8', pre: '👑 ', post: ' 👑', category: 'royal' },
	{ id: 'royal-9', pre: '༺♔༻ ', post: ' ༺♔༻', category: 'royal' },
	{ id: 'royal-10', pre: '⚜♛⚜ ', post: ' ⚜♛⚜', category: 'royal' },

	// GOTHIC
	{ id: 'gothic-1', pre: '✞ ', post: ' ✞', category: 'gothic' },
	{ id: 'gothic-2', pre: '☠ ', post: ' ☠', category: 'gothic' },
	{ id: 'gothic-3', pre: '⚰ ', post: ' ⚰', category: 'gothic' },
	{ id: 'gothic-4', pre: '☥ ', post: ' ☥', category: 'gothic' },
	{ id: 'gothic-5', pre: '☩ ', post: ' ☩', category: 'gothic' },
	{ id: 'gothic-6', pre: '✟ ', post: ' ✟', category: 'gothic' },
	{ id: 'gothic-7', pre: '✠ ', post: ' ✠', category: 'gothic' },
	{ id: 'gothic-8', pre: '⛧ ', post: ' ⛧', category: 'gothic' },
	{ id: 'gothic-9', pre: '☽ ', post: ' ☾', category: 'gothic' },
	{ id: 'gothic-10', pre: '༒ ', post: ' ༒', category: 'gothic' },
	{ id: 'gothic-11', pre: '꧁༒ ', post: ' ༒꧂', category: 'gothic' },
	{ id: 'gothic-12', pre: '꧁☬ ', post: ' ☬꧂', category: 'gothic' },
	{ id: 'gothic-13', pre: '☬ ', post: ' ☬', category: 'gothic' },
	{ id: 'gothic-14', pre: '☠︎ ', post: ' ☠︎', category: 'gothic' },
	{ id: 'gothic-15', pre: '✟†✟ ', post: ' ✟†✟', category: 'gothic' },

	// GAMING / BADASS
	{ id: 'gaming-1', pre: '꧁༒☬ ', post: ' ☬༒꧂', category: 'gaming' },
	{ id: 'gaming-2', pre: '▰▱▰ ', post: ' ▰▱▰', category: 'gaming' },
	{ id: 'gaming-3', pre: '▌║█ ', post: ' █║▌', category: 'gaming' },
	{ id: 'gaming-4', pre: '⫷ ', post: ' ⫸', category: 'gaming' },
	{ id: 'gaming-5', pre: '◢ ', post: ' ◣', category: 'gaming' },
	{ id: 'gaming-6', pre: '◤ ', post: ' ◥', category: 'gaming' },
	{ id: 'gaming-7', pre: '⨳ ', post: ' ⨳', category: 'gaming' },
	{ id: 'gaming-8', pre: '◤◢ ', post: ' ◣◥', category: 'gaming' },
	{ id: 'gaming-9', pre: '✖ ', post: ' ✖', category: 'gaming' },
	{ id: 'gaming-10', pre: '⌬ ', post: ' ⌬', category: 'gaming' },
	{ id: 'gaming-11', pre: '꧁ ', post: ' ꧂', category: 'gaming' },
	{ id: 'gaming-12', pre: '✾⊰ ', post: ' ⊱✾', category: 'gaming' },
	{ id: 'gaming-13', pre: '꧁≛ ', post: ' ≛꧂', category: 'gaming' },
	{ id: 'gaming-14', pre: '⛧༒ ', post: ' ༒⛧', category: 'gaming' },
	{ id: 'gaming-15', pre: '꧁•ҲѦᴎᴎy• ', post: ' •ɴɪɢʜᴛ•꧂', category: 'gaming' },
	{ id: 'gaming-16', pre: '⚔ ', post: ' ⚔', category: 'gaming' },
	{ id: 'gaming-17', pre: '🔱 ', post: ' 🔱', category: 'gaming' },
	{ id: 'gaming-18', pre: '⚡ ', post: ' ⚡', category: 'gaming' },
	{ id: 'gaming-19', pre: '⫷★ ', post: ' ★⫸', category: 'gaming' },
	{ id: 'gaming-20', pre: '꧁ঔৣ☬ ', post: ' ☬ঔৣ꧂', category: 'gaming' },

	// BRACKETS / FRAMES
	{ id: 'brackets-1', pre: '【 ', post: ' 】', category: 'brackets' },
	{ id: 'brackets-2', pre: '「 ', post: ' 」', category: 'brackets' },
	{ id: 'brackets-3', pre: '『 ', post: ' 』', category: 'brackets' },
	{ id: 'brackets-4', pre: '〘 ', post: ' 〙', category: 'brackets' },
	{ id: 'brackets-5', pre: '《 ', post: ' 》', category: 'brackets' },
	{ id: 'brackets-6', pre: '〔 ', post: ' 〕', category: 'brackets' },
	{ id: 'brackets-7', pre: '［ ', post: ' ］', category: 'brackets' },
	{ id: 'brackets-8', pre: '⦅ ', post: ' ⦆', category: 'brackets' },
	{ id: 'brackets-9', pre: '⟦ ', post: ' ⟧', category: 'brackets' },
	{ id: 'brackets-10', pre: '⌈ ', post: ' ⌉', category: 'brackets' },
	{ id: 'brackets-11', pre: '⌊ ', post: ' ⌋', category: 'brackets' },
	{ id: 'brackets-12', pre: '《✦ ', post: ' ✦》', category: 'brackets' },
	{ id: 'brackets-13', pre: '【✦ ', post: ' ✦】', category: 'brackets' },
	{ id: 'brackets-14', pre: '「♡ ', post: ' ♡」', category: 'brackets' },
	{ id: 'brackets-15', pre: '『☆ ', post: ' ☆』', category: 'brackets' },

	// ARROWS
	{ id: 'arrows-1', pre: '➤ ', post: ' ➤', category: 'arrows' },
	{ id: 'arrows-2', pre: '➜ ', post: ' ➜', category: 'arrows' },
	{ id: 'arrows-3', pre: '➔ ', post: ' ➔', category: 'arrows' },
	{ id: 'arrows-4', pre: '➢ ', post: ' ➣', category: 'arrows' },
	{ id: 'arrows-5', pre: '→ ', post: ' ←', category: 'arrows' },
	{ id: 'arrows-6', pre: '⊰ ', post: ' ⊱', category: 'arrows' },
	{ id: 'arrows-7', pre: '〜 ', post: ' 〜', category: 'arrows' },
	{ id: 'arrows-8', pre: '⤳ ', post: ' ⤳', category: 'arrows' },
	{ id: 'arrows-9', pre: '⫷⫸ ', post: ' ⫷⫸', category: 'arrows' },
	{ id: 'arrows-10', pre: '➭ ', post: ' ➭', category: 'arrows' },

	// KAWAII
	{ id: 'kawaii-1', pre: '(◕‿◕) ', post: '', category: 'kawaii' },
	{ id: 'kawaii-2', pre: 'ʕ•ᴥ•ʔ ', post: '', category: 'kawaii' },
	{ id: 'kawaii-3', pre: '(=^•^=) ', post: '', category: 'kawaii' },
	{ id: 'kawaii-4', pre: '(◕ᴗ◕✿) ', post: '', category: 'kawaii' },
	{ id: 'kawaii-5', pre: '(´ ω `♡) ', post: '', category: 'kawaii' },
	{ id: 'kawaii-6', pre: '(｡♥‿♥｡) ', post: '', category: 'kawaii' },
	{ id: 'kawaii-7', pre: '✧(◍•㉦•◍)✧ ', post: '', category: 'kawaii' },
	{ id: 'kawaii-8', pre: '(づ｡◕‿‿◕｡)づ ', post: '', category: 'kawaii' },
	{ id: 'kawaii-9', pre: '(っ◔◡◔)っ ♥ ', post: ' ♥', category: 'kawaii' },
	{ id: 'kawaii-10', pre: 'ヾ(＾∇＾) ', post: '', category: 'kawaii' },
	{ id: 'kawaii-11', pre: '(╯°□°)╯ ', post: '', category: 'kawaii' },
	{ id: 'kawaii-12', pre: '┐(￣ヮ￣)┌ ', post: '', category: 'kawaii' },
	{ id: 'kawaii-13', pre: '✿*ﾟ‘ﾟ･ ', post: ' ･ﾟ‘ﾟ*✿', category: 'kawaii' },
	{ id: 'kawaii-14', pre: '⋆｡‧˚ʚ ', post: ' ɞ˚‧｡⋆', category: 'kawaii' },
	{ id: 'kawaii-15', pre: '꒰ ´͈ᵕ`͈ ꒱', post: '', category: 'kawaii' },

	// SYMBOLS / MISC
	{ id: 'symbols-1', pre: '☯ ', post: ' ☯', category: 'symbols' },
	{ id: 'symbols-2', pre: '☮ ', post: ' ☮', category: 'symbols' },
	{ id: 'symbols-3', pre: '⚓ ', post: ' ⚓', category: 'symbols' },
	{ id: 'symbols-4', pre: '☂ ', post: ' ☂', category: 'symbols' },
	{ id: 'symbols-5', pre: '☀ ', post: ' ☀', category: 'symbols' },
	{ id: 'symbols-6', pre: '❄ ', post: ' ❄', category: 'symbols' },
	{ id: 'symbols-7', pre: '☁ ', post: ' ☁', category: 'symbols' },
	{ id: 'symbols-8', pre: '⚡ ', post: ' ⚡', category: 'symbols' },
	{ id: 'symbols-9', pre: '∞ ', post: ' ∞', category: 'symbols' },
	{ id: 'symbols-10', pre: '⚛ ', post: ' ⚛', category: 'symbols' },
	{ id: 'symbols-11', pre: '☢ ', post: ' ☢', category: 'symbols' },
	{ id: 'symbols-12', pre: '☣ ', post: ' ☣', category: 'symbols' },
	{ id: 'symbols-13', pre: '⚙ ', post: ' ⚙', category: 'symbols' },
	{ id: 'symbols-14', pre: '☥ ', post: ' ☥', category: 'symbols' },
	{ id: 'symbols-15', pre: '⊙ ', post: ' ⊙', category: 'symbols' },

	// LINES / DIVIDERS
	{ id: 'lines-1', pre: '✧·˚ ｡ ', post: ' ｡ ˚·✧', category: 'lines' },
	{ id: 'lines-2', pre: '─━╤デ╦︻ ', post: ' ︻╦╤━─', category: 'lines' },
	{ id: 'lines-3', pre: '━━┓ ', post: ' ┏━━', category: 'lines' },
	{ id: 'lines-4', pre: '─=≡Σ ', post: ' Σ≡=─', category: 'lines' },
	{ id: 'lines-5', pre: '⌒ ', post: ' ⌒', category: 'lines' },
	{ id: 'lines-6', pre: '。⋆ ', post: ' ⋆。', category: 'lines' },
	{ id: 'lines-7', pre: '═════ ', post: ' ═════', category: 'lines' },
	{ id: 'lines-8', pre: '▬▬ι═══════ ', post: ' ═══════ι▬▬', category: 'lines' },
	{ id: 'lines-9', pre: '·:*¨༺ ', post: ' ༻¨*:·', category: 'lines' },
	{ id: 'lines-10', pre: '⌘ ', post: ' ⌘', category: 'lines' },

	// FIRE / DRAGON
	{ id: 'fire-1', pre: '🔥 ', post: ' 🔥', category: 'fire' },
	{ id: 'fire-2', pre: '🜲 ', post: ' 🜲', category: 'fire' },
	{ id: 'fire-3', pre: '🐉 ', post: ' 🐉', category: 'fire' },
	{ id: 'fire-4', pre: '🜲†🜲 ', post: ' 🜲†🜲', category: 'fire' },
	{ id: 'fire-5', pre: '⚡⚡ ', post: ' ⚡⚡', category: 'fire' },
	{ id: 'fire-6', pre: '☄ ', post: ' ☄', category: 'fire' },
	{ id: 'fire-7', pre: 'ϟ ', post: ' ϟ', category: 'fire' },
	{ id: 'fire-8', pre: '🦅 ', post: ' 🦅', category: 'fire' },

	// MSN CLASSIC — the early-2000s ones people put around their names
	{ id: 'msn-1', pre: '·.·★ ', post: ' ★·.·', category: 'msn' },
	{ id: 'msn-2', pre: '~*~ ', post: ' ~*~', category: 'msn' },
	{ id: 'msn-3', pre: '·:¨°*✲ ', post: ' ✲*°¨:·', category: 'msn' },
	{ id: 'msn-4', pre: ',.-~*°^°*~-., ', post: ' ,.-~*°^°*~-.,', category: 'msn' },
	{ id: 'msn-5', pre: '°•°•.★.•°•° ', post: ' °•°•.★.•°•°', category: 'msn' },
	{ id: 'msn-6', pre: '* ¨ * • ✰ ', post: ' ✰ • * ¨ *', category: 'msn' },
	{ id: 'msn-7', pre: '◦•●◉✿ ', post: ' ✿◉●•◦', category: 'msn' },
	{ id: 'msn-8', pre: '╰☆╮ ', post: ' ╰☆╮', category: 'msn' },
	{ id: 'msn-9', pre: '꧁•҉ ', post: ' ҉•꧂', category: 'msn' },
	{ id: 'msn-10', pre: '×÷·.·´¯`·)» ', post: ' «(·´¯`·.·÷×', category: 'msn' },
	{ id: 'msn-11', pre: '¸,ø¤º°`°º¤ø,¸¸,ø¤º° ', post: ' °º¤ø,¸¸,ø¤º°`°º¤ø,¸', category: 'msn' },
	{ id: 'msn-12', pre: '◢◤ ', post: ' ◥◣', category: 'msn' },
	{ id: 'msn-13', pre: '╭∩╮(︶︿︶)╭∩╮ ', post: '', category: 'msn' },
	{ id: 'msn-14', pre: '(¯`v´¯)-> ', post: ' <-(¯`v´¯)', category: 'msn' },
	{ id: 'msn-15', pre: '╔══ஓ๑♡๑ஓ══╗ ', post: ' ╚══ஓ๑♡๑ஓ══╝', category: 'msn' },
	{ id: 'msn-16', pre: '╭━━━━━━━━━━╮ ', post: ' ╰━━━━━━━━━━╯', category: 'msn' },
	{ id: 'msn-17', pre: '♕❀ ', post: ' ❀♕', category: 'msn' },
	{ id: 'msn-18', pre: '⊰⊹ஐ ', post: ' ஐ⊹⊱', category: 'msn' },
	{ id: 'msn-19', pre: 'ᕦ(ò_óˇ)ᕤ ', post: '', category: 'msn' },
	{ id: 'msn-20', pre: '★·.·´¯`·.·★ ', post: ' ★·.·´¯`·.·★', category: 'msn' }
];

export function applyDecoration(name: string, d: Decoration): string {
	return `${d.pre}${name}${d.post}`;
}
