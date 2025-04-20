/**
 * Normalizes various color string formats to a standard '#rrggbb' hex format
 */
export function normalizeColorString(string: string): string | false {
	// Pattern matching for common color formats
	const patterns = [
		// Full hex: '#rrggbb' or '0xrrggbb'
		{ regex: /(#|0x)?([a-f0-9]{6})/i, format: (m) => m[2] },
		
		// RGB format: 'rgb(r, g, b)'
		{ 
			regex: /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/,
			format: (m) => [1, 2, 3].map(i => parseInt(m[i]).toString(16).padStart(2, '0')).join('')
		},
		
		// Short hex: '#rgb'
		{ 
			regex: /^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i,
			format: (m) => `${m[1]}${m[1]}${m[2]}${m[2]}${m[3]}${m[3]}`
		}
	];

	// Try each pattern in sequence
	for (const pattern of patterns) {
		const match = string.match(pattern.regex);
		if (match) {
			return '#' + pattern.format(match);
		}
	}

	return false;
}

export default normalizeColorString;