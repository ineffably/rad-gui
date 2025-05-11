import getColorFormat from '../../src/library/color-formats';
import normalizeColorString from '../../src/library/normalize-color-string';

// Add type safety for the color formats
interface ColorFormat {
  isPrimitive: boolean;
  match: (value: any) => boolean;
  fromHexString: (hex: string, target?: any, rgbScale?: number) => any;
  toHexString: (value: any, rgbScale?: number) => string;
}

// Mock the normalize-color-string module if needed
jest.mock('../../src/library/normalize-color-string', () => {
  return jest.fn(str => {
    // Simple implementation for testing
    if (!str.startsWith('#')) {
      return `#${str}`;
    }
    return str;
  });
});

describe('color-formats utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getColorFormat function', () => {
    it('should return the correct format for string values', () => {
      const format = getColorFormat('red') as ColorFormat;
      expect(format).toBeDefined();
      expect(format.isPrimitive).toBe(true);
      expect(format.match('red')).toBe(true);
    });

    it('should return the correct format for number values', () => {
      const format = getColorFormat(0xff0000) as ColorFormat;
      expect(format).toBeDefined();
      expect(format.isPrimitive).toBe(true);
      expect(format.match(0xff0000)).toBe(true);
    });

    it('should return the correct format for array values', () => {
      const format = getColorFormat([1, 0, 0]) as ColorFormat;
      expect(format).toBeDefined();
      expect(format.isPrimitive).toBe(false);
      expect(format.match([1, 0, 0])).toBe(true);
    });

    it('should return the correct format for object values', () => {
      const format = getColorFormat({ r: 1, g: 0, b: 0 }) as ColorFormat;
      expect(format).toBeDefined();
      expect(format.isPrimitive).toBe(false);
      expect(format.match({ r: 1, g: 0, b: 0 })).toBe(true);
    });

    it('should return undefined for unsupported values', () => {
      const format = getColorFormat(null);
      expect(format).toBeUndefined();
    });
  });

  describe('STRING format', () => {
    it('should convert to and from hex strings', () => {
      const format = getColorFormat('red') as ColorFormat;
      
      // String format uses normalizeColorString directly
      expect(format.fromHexString('#ff0000')).toBe('#ff0000');
      expect(format.toHexString('#ff0000')).toBe('#ff0000');
      
      // Check if normalization is called
      expect(normalizeColorString).toHaveBeenCalled();
    });
  });

  describe('INT format', () => {
    it('should convert hex string to integer', () => {
      const format = getColorFormat(0xff0000) as ColorFormat;
      
      expect(format.fromHexString('#ff0000')).toBe(16711680); // 0xff0000
      expect(format.fromHexString('#00ff00')).toBe(65280); // 0x00ff00
      expect(format.fromHexString('#0000ff')).toBe(255); // 0x0000ff
    });

    it('should convert integer to hex string', () => {
      const format = getColorFormat(0xff0000) as ColorFormat;
      
      expect(format.toHexString(16711680)).toBe('#ff0000');
      expect(format.toHexString(65280)).toBe('#00ff00');
      expect(format.toHexString(255)).toBe('#0000ff');
    });

    it('should pad hex strings correctly', () => {
      const format = getColorFormat(0xff0000) as ColorFormat;
      
      expect(format.toHexString(0)).toBe('#000000');
      expect(format.toHexString(1)).toBe('#000001');
    });
  });

  describe('ARRAY format', () => {
    it('should convert hex string to RGB array', () => {
      const format = getColorFormat([0, 0, 0]) as ColorFormat;
      
      const target = [0, 0, 0];
      format.fromHexString('#ff0000', target);
      expect(target).toEqual([1, 0, 0]);
      
      const target2 = [0, 0, 0];
      format.fromHexString('#00ff00', target2);
      expect(target2).toEqual([0, 1, 0]);
      
      const target3 = [0, 0, 0];
      format.fromHexString('#0000ff', target3);
      expect(target3).toEqual([0, 0, 1]);
    });

    it('should convert RGB array to hex string', () => {
      const format = getColorFormat([0, 0, 0]) as ColorFormat;
      
      expect(format.toHexString([1, 0, 0])).toBe('#ff0000');
      expect(format.toHexString([0, 1, 0])).toBe('#00ff00');
      expect(format.toHexString([0, 0, 1])).toBe('#0000ff');
    });
    
    it('should handle different RGB scales', () => {
      const format = getColorFormat([0, 0, 0]) as ColorFormat;
      
      // Test with scale of 255
      const target = [0, 0, 0];
      format.fromHexString('#ff0000', target, 255);
      expect(target).toEqual([255, 0, 0]);
      
      expect(format.toHexString([255, 0, 0], 255)).toBe('#ff0000');
    });
  });

  describe('OBJECT format', () => {
    it('should convert hex string to RGB object', () => {
      const format = getColorFormat({ r: 0, g: 0, b: 0 }) as ColorFormat;
      
      const target = { r: 0, g: 0, b: 0 };
      format.fromHexString('#ff0000', target);
      expect(target).toEqual({ r: 1, g: 0, b: 0 });
      
      const target2 = { r: 0, g: 0, b: 0 };
      format.fromHexString('#00ff00', target2);
      expect(target2).toEqual({ r: 0, g: 1, b: 0 });
      
      const target3 = { r: 0, g: 0, b: 0 };
      format.fromHexString('#0000ff', target3);
      expect(target3).toEqual({ r: 0, g: 0, b: 1 });
    });

    it('should convert RGB object to hex string', () => {
      const format = getColorFormat({ r: 0, g: 0, b: 0 }) as ColorFormat;
      
      expect(format.toHexString({ r: 1, g: 0, b: 0 })).toBe('#ff0000');
      expect(format.toHexString({ r: 0, g: 1, b: 0 })).toBe('#00ff00');
      expect(format.toHexString({ r: 0, g: 0, b: 1 })).toBe('#0000ff');
    });
    
    it('should handle different RGB scales', () => {
      const format = getColorFormat({ r: 0, g: 0, b: 0 }) as ColorFormat;
      
      // Test with scale of 255
      const target = { r: 0, g: 0, b: 0 };
      format.fromHexString('#ff0000', target, 255);
      expect(target).toEqual({ r: 255, g: 0, b: 0 });
      
      expect(format.toHexString({ r: 255, g: 0, b: 0 }, 255)).toBe('#ff0000');
    });
  });
}); 