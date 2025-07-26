# RadGUI Class

## Overview

`RadGUI` is an extended version of the main `GUI` class that provides a more explicit, method-based API for creating controls. While the traditional `GUI` class uses a single `add()` method that auto-detects the control type, `RadGUI` offers specific methods for each control type.

## Key Differences

| Feature | Traditional GUI | RadGUI |
|---------|----------------|---------|
| **API Style** | Single `add()` method | Specific methods per control type |
| **Type Detection** | Automatic based on value type | Explicit method calls |
| **Button Creation** | `gui.add(obj, 'functionProperty')` | `radGui.addButton('title', callback)` |
| **Method Clarity** | Generic | Self-documenting |

## Available Methods

### Constructor
```typescript
const radGui = new RadGUI();           // With default options
const radGui = new RadGUI(options);    // With custom options
```

**Parameters:**
- `options` (object, optional): Configuration options - same as GUI class
  - `title` (string): Title of the GUI (default: 'Controls')
  - `width` (number): Width in pixels
  - `autoPlace` (boolean): Whether to automatically append to document.body (default: true)
  - `container` (HTMLElement): Custom container element
  - `closeFolders` (boolean): Whether folders should be closed by default
  - `injectStyles` (boolean): Whether to inject CSS styles (default: true)
  - `touchStyles` (boolean): Whether to include touch-friendly styles (default: true)

### Control Methods

#### `addButton(title: string, callback: () => void): FunctionControl`
Creates a button control that executes a callback when clicked.

```typescript
radGui.addButton('Reset', () => {
    console.log('Reset button clicked!');
});
```

#### `addText<T, K extends keyof T>(object: T, property: K): TextControl`
Creates a text input control for string properties.

```typescript
const settings = { username: 'player1' };
radGui.addText(settings, 'username');
```

#### `addNumber<T, K extends keyof T>(object: T, property: K, min: number, max: number, step: number): NumberControl`
Creates a number control with slider when min/max are provided.

```typescript
const settings = { volume: 0.5 };
radGui.addNumber(settings, 'volume', 0, 1, 0.1);
```

#### `addColor<T, K extends keyof T>(object: T, property: K, rgbScale?: number): ColorControl`
Creates a color picker control.

```typescript
const settings = { backgroundColor: '#ff0000' };
radGui.addColor(settings, 'backgroundColor');
```

#### `addOption<T, K extends keyof T>(object: T, property: K, options: T[K][] | Record<string, T[K]>): OptionControl`
Creates a dropdown control with predefined options.

```typescript
const settings = { difficulty: 'normal' };
radGui.addOption(settings, 'difficulty', ['easy', 'normal', 'hard']);
```

#### `addFolder(title: string): RadGUI`
Creates a nested folder (returns a RadGUI instance).

```typescript
const audioFolder = radGui.addFolder('Audio Settings');
audioFolder.addNumber(settings, 'volume', 0, 1, 0.1);
audioFolder.addNumber(settings, 'pitch', 0.5, 2, 0.1);
```

### Utility Methods

#### `remove(controller: BaseControl): void`
Removes a control from the GUI.

#### `reset(recursive?: boolean): this`
Resets all controls to their initial values.

## When to Use RadGUI vs GUI

### Use RadGUI when:
- You want **explicit, self-documenting API calls**
- You're building **component-based UIs** and want clear method names
- You need to create **buttons without object properties**
- You want **better TypeScript IntelliSense** for specific control types
- You're **migrating from component-based GUI libraries**

### Use traditional GUI when:
- You want the **most flexible API** (single `add()` method)
- You're working with **existing objects** and want automatic type detection
- You prefer **minimal API surface area**
- You want the **smallest bundle size** (traditional GUI is lighter)

## Migration Example

### From Traditional GUI:
```typescript
const settings = {
    volume: 0.5,
    resetAudio: () => { /* reset logic */ }
};

const gui = new GUI();
gui.add(settings, 'volume', 0, 1, 0.1).name('Volume');
gui.add(settings, 'resetAudio').name('Reset Audio');
```

### To RadGUI:
```typescript
const settings = { volume: 0.5 };

const radGui = new RadGUI();
radGui.addNumber(settings, 'volume', 0, 1, 0.1).name('Volume');
radGui.addButton('Reset Audio', () => { /* reset logic */ });
```

## Complete Example

```typescript
import { RadGUI } from 'rad-gui';

// Application state
const gameSettings = {
    playerName: 'Player 1',
    difficulty: 'normal',
    volume: 0.8,
    themeColor: '#4a90e2'
};

// Create RadGUI instance
const gui = new RadGUI({ title: 'Game Settings' });

// Add controls using explicit methods
gui.addText(gameSettings, 'playerName')
   .name('Player Name');

gui.addOption(gameSettings, 'difficulty', ['easy', 'normal', 'hard'])
   .name('Difficulty Level');

gui.addNumber(gameSettings, 'volume', 0, 1, 0.1)
   .name('Audio Volume');

gui.addColor(gameSettings, 'themeColor')
   .name('Theme Color');

// Add action buttons
const actionsFolder = gui.addFolder('Actions');
actionsFolder.addButton('Save Settings', () => {
    localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
    console.log('Settings saved!');
});

actionsFolder.addButton('Load Settings', () => {
    const saved = localStorage.getItem('gameSettings');
    if (saved) {
        Object.assign(gameSettings, JSON.parse(saved));
        gui.controllersRecursive().forEach(c => c.updateDisplay());
        console.log('Settings loaded!');
    }
});

// Listen for changes
gui.onChange((data) => {
    console.log(`${data.property} changed to:`, data.value);
});
```

## Type Safety

RadGUI maintains full TypeScript type safety:

```typescript
interface AppSettings {
    username: string;
    level: number;
    enabled: boolean;
}

const settings: AppSettings = {
    username: 'user',
    level: 1,
    enabled: true
};

const gui = new RadGUI();

// ✅ TypeScript knows these are valid properties
gui.addText(settings, 'username');
gui.addNumber(settings, 'level', 1, 100, 1);

// ❌ TypeScript will error on invalid properties
// gui.addText(settings, 'invalidProperty'); // Error!
```

## Compatibility

RadGUI extends the base GUI class, so it maintains full compatibility with:
- All existing GUI methods (`onChange`, `onFinishChange`, `save`, `load`, etc.)
- CSS styling and theming
- Event handling and callbacks
- Nested folder functionality

The only difference is the additional explicit methods for creating controls. 