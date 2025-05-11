import normalizeColorString from './normalize-color-string';
export declare const getColorFormat: (value: any) => {
    isPrimitive: boolean;
    match: (v: any) => v is string;
    fromHexString: typeof normalizeColorString;
    toHexString: typeof normalizeColorString;
} | {
    isPrimitive: boolean;
    match: (v: any) => v is number;
    fromHexString: (string: string) => number;
    toHexString: (value: number) => string;
} | {
    isPrimitive: boolean;
    match: (v: any) => v is any[];
    fromHexString(string: string, target: number[], rgbScale?: number): void;
    toHexString([r, g, b]: number[], rgbScale?: number): string;
} | {
    isPrimitive: boolean;
    match: (v: any) => boolean;
    fromHexString(string: string, target: {
        r: number;
        g: number;
        b: number;
    }, rgbScale?: number): void;
    toHexString({ r, g, b }: {
        r: number;
        g: number;
        b: number;
    }, rgbScale?: number): string;
};
export default getColorFormat;
