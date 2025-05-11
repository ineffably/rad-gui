import normalizeColorString from './normalize-color-string';

// Shared helper functions
const hexToRgb = (hex: string) => {
	const int = parseInt(hex.substring(1), 16);
	return {
		r: (int >> 16) & 255,
		g: (int >> 8) & 255,
		b: int & 255
	};
};

const rgbToInt = (r: number, g: number, b: number) => 
	((r & 255) << 16) | ((g & 255) << 8) | (b & 255);

// Format definitions
const STRING = {
	isPrimitive: true,
	match: (v: any) => typeof v === 'string',
	fromHexString: normalizeColorString,
	toHexString: normalizeColorString
};

const INT = {
	isPrimitive: true,
	match: (v: any) => typeof v === 'number',
	fromHexString: (string: string) => parseInt(string.substring(1), 16),
	toHexString: (value: number) => '#' + value.toString(16).padStart(6, '0')
};

const ARRAY = {
	isPrimitive: false,
	match: (v: any) => Array.isArray(v),
	fromHexString(string: string, target: number[], rgbScale = 1) {
		const rgb = hexToRgb(string);
		const scale = rgbScale / 255;
		target[0] = rgb.r * scale;
		target[1] = rgb.g * scale;
		target[2] = rgb.b * scale;
	},
	toHexString([r, g, b]: number[], rgbScale = 1) {
		const scale = 255 / rgbScale;
		const int = rgbToInt(r * scale, g * scale, b * scale);
		return INT.toHexString(int);
	}
};

const OBJECT = {
	isPrimitive: false,
	match: (v: any) => Object(v) === v && !Array.isArray(v),
	fromHexString(string: string, target: { r: number, g: number, b: number }, rgbScale = 1) {
		const rgb = hexToRgb(string);
		const scale = rgbScale / 255;
		target.r = rgb.r * scale;
		target.g = rgb.g * scale;
		target.b = rgb.b * scale;
	},
	toHexString({ r, g, b }: { r: number, g: number, b: number }, rgbScale = 1) {
		const scale = 255 / rgbScale;
		const int = rgbToInt(r * scale, g * scale, b * scale);
		return INT.toHexString(int);
	}
};

// Format finder
const FORMATS = [STRING, INT, ARRAY, OBJECT];
export const getColorFormat = (value: any) => FORMATS.find(format => format.match(value));
export default getColorFormat;

