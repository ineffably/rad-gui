# Rad-GUI Usage Guide

This guide demonstrates how to use the Rad-GUI library to create interactive UI controls for your web applications based on the examples in the kitchen-sink demos.

## Basic Setup

### JavaScript (Browser)
```javascript
// Import the GUI class
const { GUI } = rad;

// Create a new GUI instance
const gui = new GUI();
```

### JavaScript (ES Modules)
```javascript
import { GUI } from 'rad-gui';
import 'rad-gui/lib/rad-gui.css';

const gui = new GUI();
```

### TypeScript
```typescript
import { GUI, ControlEventData, GuiOptions } from 'rad-gui';
import 'rad-gui/lib/rad-gui.css';

// Define your parameter interface for type safety
interface AppParams {
  rotation: number;
  scale: number;
  color: string;
  visible: boolean;
  mode: string;
  reset: () => void;
}

// Create GUI with typed options
const options: GuiOptions = {
  title: 'App Controls',
  width: 300,
  closeFolders: false
};

const gui = new GUI(options);
```

## Creating Basic Controls

### Number Controls

```javascript
// Basic number input without parameters
gui.add({ x: 0 }, 'x').name('No Parameters');

// Number input with minimum value
gui.add({ x: 0 }, 'x', 0).name('Min');

// Number input with maximum value
gui.add({ x: 0 }, 'x').max(0).name('Max');

// Number input with step
gui.add({ x: 0 }, 'x').step(0.01).name('Step 0.01');
gui.add({ x: 0 }, 'x').step(0.1).name('Step 0.1');
gui.add({ x: 0 }, 'x').step(1).name('Step 1');
```

### Range Sliders

```javascript
// Number input with min and max (creates a slider)
gui.add({ x: 0 }, 'x', 0, 1).name('Range [0,1]');

// Number input with min, max, and step
gui.add({ x: 0 }, 'x', 0, 100, 1).name('Range [0,100] with step 1');
gui.add({ x: 0 }, 'x', -1, 1, 0.25).name('Range [-1,1] with step 0.25');
```

### Decimal Precision

```javascript
// Control the number of decimal places displayed
gui.add({ x: 5 }, 'x', 0, 10).decimals(0).name('No decimals');
gui.add({ x: 5 }, 'x', 0, 10).decimals(1).name('1 decimal place');
gui.add({ x: 5 }, 'x', 0, 10).decimals(2).name('2 decimal places');
```

## Option Controls

```javascript
// Dropdown with array options
gui.add({ x: 0 }, 'x', [0, 1, 2]).name('Array Options');

// Dropdown with object options (label-value pairs)
gui.add({ x: 0 }, 'x', { Label1: 0, Label2: 1, Label3: 2 }).name('Object Options');

// Dynamically change options
const control = gui.add({ x: 1 }, 'x', [0, 1, 2]).name('Dynamic Options');
// Later update the options:
control.options([3, 4, 5]);
```

## Color Controls

```javascript
// Color input with various formats
gui.addColor({ color: '#aa00ff' }, 'color').name('Hex String');
gui.addColor({ color: 'aa00ff' }, 'color').name('Hex String (no #)');
gui.addColor({ color: '0xaa00ff' }, 'color').name('Hex String (0x prefix)');
gui.addColor({ color: '#a0f' }, 'color').name('Short Hex');
gui.addColor({ color: 'rgb(170, 0, 255)' }, 'color').name('RGB String');

// Color as hex integer
gui.addColor({ color: 0xaa00ff }, 'color').name('Hex Integer');

// Color as RGB object (0-1 scale)
gui.addColor({ color: { r: 2/3, g: 0, b: 1 } }, 'color').name('RGB Object (0-1)');

// Color as RGB array (0-1 scale)
gui.addColor({ color: [2/3, 0, 1] }, 'color').name('RGB Array (0-1)');

// Color with RGB scale (0-255)
gui.addColor({ color: [170, 0, 255] }, 'color', 255).name('RGB Array (0-255)');
gui.addColor({ color: { r: 170, g: 0, b: 255 } }, 'color', 255).name('RGB Object (0-255)');
```

## Boolean Controls

```javascript
// Checkbox
gui.add({ enabled: true }, 'enabled').name('Boolean Control');
```

## String Controls

```javascript
// Text input
gui.add({ name: 'rad-gui' }, 'name').name('Text Input');
```

## Button Controls

```javascript
// Button (function control)
gui.add({ 
  saveFunction() { 
    console.log('Button clicked!'); 
  } 
}, 'saveFunction').name('Click Me');
```

## Folders

```javascript
// Create a folder
const folder = gui.addFolder('Settings');

// Add controls to the folder
folder.add({ x: 0.5 }, 'x', 0, 1).name('Slider in Folder');
folder.add({ enabled: true }, 'enabled').name('Boolean in Folder');

// Nested folders
const nestedFolder = folder.addFolder('Advanced');
nestedFolder.add({ y: 0 }, 'y', 0, 10).name('Nested Control');

// Open/close folders
folder.open(); // Open a folder
folder.close(); // Close a folder

// Create a closed folder by default
const closedFolder = gui.addFolder('Closed by Default').close();
```

## Control State Management

### Disable/Enable Controls

```javascript
// Disable a control
const control = gui.add({ x: 0 }, 'x', 0, 1).name('Can be disabled');
control.disable(); // Disable
control.enable();  // Enable

// Chaining disable/enable
gui.add({ x: 0 }, 'x').disable().enable();
```

### Hide/Show Controls

```javascript
// Hide a GUI
gui.hide();

// Show a GUI
gui.show();
```

## Event Handling

```javascript
// Listen for changes
const params = { x: 0 };
const controller = gui.add(params, 'x', 0, 1);

// Called during interaction
controller.onChange((value) => {
  console.log('Value changed:', value);
});

// Called after interaction ends
controller.onFinishChange((value) => {
  console.log('Finished changing:', value);
});

// Global change handlers for all controllers in a GUI
gui.onChange((event) => {
  console.log('Any value changed:', event.property, event.value);
});

gui.onFinishChange((event) => {
  console.log('Any value finished changing:', event.property, event.value);
});
```

### TypeScript Event Handling
```typescript
// Type-safe event handling with structured data
gui.onChange((data: ControlEventData) => {
  console.log(`Property ${data.property} changed to:`, data.value);
  console.log('Object:', data.object);
  console.log('Controller:', data.controller);
});

// Specific control event handling with type inference
gui.add(params, 'rotation', 0, 360)
  .onChange((data: ControlEventData<number>) => {
    // data.value is typed as number
    console.log('Rotation changed to:', data.value);
  })
  .onFinishChange((data: ControlEventData<number>) => {
    // Called when user stops dragging/typing
    console.log('Final rotation:', data.value);
  });

// Open/close events with GUI typing
gui.onOpenClose((changedGui: GUI) => {
  const isOpen = !changedGui._closed;
  console.log(`Folder "${changedGui._title}" is now ${isOpen ? 'open' : 'closed'}`);
});
```

## Live Updates (Listen)

```javascript
// Create an object to control
const params = { animate: false, value: 0 };

// Add controls
gui.add(params, 'animate');
gui.add(params, 'value', 0, 100).listen();

// Update the value elsewhere in your code
function animate() {
  if (params.animate) {
    params.value = (params.value + 1) % 100;
  }
  requestAnimationFrame(animate);
}
animate();
```

## GUI Configuration

```javascript
// Create a GUI with custom options
const gui = new GUI({
  title: 'My Controls',          // Set title
  width: 300,                    // Set width
  autoPlace: true,               // Auto place in document
  closeFolders: true,            // Folders closed by default
  container: document.getElementById('custom-container'), // Custom container
  injectStyles: true,            // Inject CSS styles
  touchStyles: true              // Add touch-specific styles
});
```

## Customizing the GUI Appearance

Rad-GUI uses CSS variables for styling, which can be customized to match your application's design.

### Using Themes

```javascript
// Create predefined themes
const themes = {
  Default: {},
  Light: {
    '--background-color': '#f6f6f6',
    '--text-color': '#3d3d3d',
    '--title-background-color': '#efefef',
    '--title-text-color': '#3d3d3d',
    '--widget-color': '#eaeaea',
    '--hover-color': '#f0f0f0',
    '--focus-color': '#fafafa',
    '--number-color': '#07aacf',
    '--string-color': '#8da300'
  },
  Dark: {
    '--background-color': '#002b36',
    '--text-color': '#b2c2c2',
    '--title-background-color': '#001f27',
    '--title-text-color': '#b2c2c2',
    '--widget-color': '#094e5f',
    '--hover-color': '#0a6277',
    '--focus-color': '#0b6c84',
    '--number-color': '#2aa0f2',
    '--string-color': '#97ad00'
  }
};

// Create a GUI for theme selection
const gui = new GUI({ title: 'Appearance' });
const themeController = gui.add({ theme: themes.Default }, 'theme', themes)
  .name('Themes')
  .onChange(theme => {
    applyTheme(theme);
  });

// Function to apply theme CSS variables
function applyTheme(theme) {
  if (Object.keys(theme).length === 0) {
    // Reset to default
    document.documentElement.style.removeProperty('--rad-gui-style');
  } else {
    // Apply custom theme
    let customStyle = '';
    for (const [property, value] of Object.entries(theme)) {
      customStyle += `${property}: ${value};\n`;
    }
    
    // Create or update custom style element
    let styleEl = document.getElementById('rad-gui-custom-theme');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'rad-gui-custom-theme';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `.rad-gui {\n${customStyle}}`;
  }
}
```

### Available CSS Variables

The following CSS variables can be customized:

```css
.rad-gui {
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: 32px;
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
}
```

## Saving and Loading State

```javascript
// Save the current state of all controllers
const savedState = gui.save();
console.log('Saved state:', savedState);

// Load a previously saved state
gui.load(savedState);

// Save with the remember method (more convenient)
gui.remember(objectWithProperties);
```

## Open/Close Animation

```javascript
// Animate opening/closing
gui.openAnimated(); // Open with animation
gui.openAnimated(false); // Close with animation

// Register callbacks for open/close events
gui.onOpenClose((gui) => {
  console.log('GUI open state changed:', !gui._closed);
});
```

## Destroying a GUI

```javascript
// Remove the GUI and clean up
gui.destroy();
```

## Complete Example

```javascript
// Create an object to store our parameters
const params = {
  color: '#aa00ff',
  x: 50,
  y: 25,
  radius: 10,
  enabled: true,
  option: 'A',
  draw() {
    console.log('Drawing with:', params);
  }
};

// Create a new GUI
const gui = new GUI({ title: 'My App' });

// Add controllers
gui.addColor(params, 'color').name('Color');
gui.add(params, 'x', 0, 100).name('X Position');
gui.add(params, 'y', 0, 100).name('Y Position');

// Create a folder
const sizeFolder = gui.addFolder('Size');
sizeFolder.add(params, 'radius', 1, 50).name('Radius');
sizeFolder.add(params, 'enabled').name('Enabled');

// Add options
gui.add(params, 'option', ['A', 'B', 'C']).name('Option');

// Add a button
gui.add(params, 'draw').name('Draw Now');

// Setup change handlers
gui.onChange((event) => {
  console.log('Value changed:', event);
  // Update your application here
});
``` 