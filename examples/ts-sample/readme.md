# Rad GUI TypeScript Examples

This directory contains comprehensive TypeScript examples demonstrating all the features and capabilities of the rad-gui library, including both the traditional `GUI` class and the new `RadGUI` class.

## Features Demonstrated

### Control Types
- **Number Controls**: Size, rotation, opacity with min/max/step values
- **Boolean Controls**: Animation toggles, shadow visibility
- **Text Controls**: Editable text content
- **Color Controls**: Background and border colors with RGB scaling
- **Option Controls**: Dropdown selections (arrays and objects)
- **Function Controls**: Action buttons for various operations

### Advanced Features
- **Folders**: Organized control groups with expand/collapse
- **Event Handling**: onChange, onFinishChange, and onOpenClose callbacks
- **Save/Load**: Persistent settings using localStorage
- **Method Chaining**: Fluent API for control configuration
- **TypeScript Support**: Full type safety and IntelliSense

### Interactive Demo
The example includes an animated box that responds to all control changes in real-time, demonstrating:
- Visual feedback for all parameter changes
- Animation system with multiple animation types
- CSS transform and styling modifications
- Shape morphing (square, circle, diamond, triangle)
- CSS filter effects

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Available Examples

1. **Examples Home** (`examples-home.html`)
   - Landing page with easy navigation between examples
   - Side-by-side API comparison
   - Feature overview and selection guide

2. **Traditional GUI Example** (`index.html` + `main.ts`)
   - Demonstrates the classic rad-gui API with property-based controls
   - Uses the `GUI` class with automatic type detection
   - Comprehensive feature showcase

3. **RadGUI Example** (`rad-gui-example.html` + `rad-gui-example.ts`)
   - Showcases the new `RadGUI` class with explicit method-based API
   - Features `addButton()`, `addNumber()`, `addText()`, etc.
   - Component-friendly approach for easier migration

**🧭 Easy Navigation:** Each example includes a navigation bar at the top for quick switching between examples.

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to:
   - `http://localhost:3000/examples-home.html` for the landing page with navigation
   - `http://localhost:3000` for the traditional GUI example
   - `http://localhost:3000/rad-gui-example.html` for the RadGUI example

### Building for Production

```bash
npm run build
```

## Code Structure

### `main.ts`
The main TypeScript file containing:
- `DemoObject` interface defining all controllable properties
- `TypeScriptDemo` class managing the GUI and interactions
- Comprehensive examples of all control types
- Animation system implementation
- Event handling demonstrations

### `index.html`
HTML structure with modern styling and the animated demo element.

### Configuration Files
- `tsconfig.json`: TypeScript configuration with strict settings
- `vite.config.ts`: Vite bundler configuration
- `package.json`: Dependencies and scripts

## Usage Examples

### Traditional GUI Control Creation
```typescript
// Auto-detecting add method
gui.add(object, 'property', 0, 100, 1); // Number with range
gui.add(object, 'enabled');              // Boolean toggle
gui.add(object, 'text');                 // Text input
gui.addColor(object, 'color');           // Color picker
gui.add(object, 'mode', ['opt1', 'opt2']); // Dropdown
gui.add(object, 'action');               // Button (function property)
```

### RadGUI Explicit Control Creation
```typescript
// Create RadGUI with or without options
const radGui = new RadGUI();                    // Default options
const radGui = new RadGUI({ title: 'My GUI' }); // Custom options

// Explicit method calls
radGui.addNumber(object, 'property', 0, 100, 1);
radGui.addToggle(object, 'enabled');      // Proper boolean control
radGui.addText(object, 'text');
radGui.addColor(object, 'color');
radGui.addOption(object, 'mode', ['opt1', 'opt2']);
radGui.addButton('Action Name', () => { /* callback */ });
```

### Folder Organization
```typescript
const folder = gui.addFolder('Settings');
folder.add(object, 'property');
folder.close(); // Start collapsed
```

### Event Handling
```typescript
gui.onChange((event) => {
  console.log('Changed:', event);
});

gui.onFinishChange((event) => {
  console.log('Finished changing:', event);
});
```

### Save/Load State
```typescript
// Save current state
const state = gui.save();
localStorage.setItem('settings', JSON.stringify(state));

// Load saved state
const saved = JSON.parse(localStorage.getItem('settings'));
gui.load(saved);
```

## TypeScript Benefits

This example showcases TypeScript's advantages:
- **Type Safety**: Compile-time error checking
- **IntelliSense**: Auto-completion and documentation
- **Interface Definitions**: Clear contracts for data structures
- **Generic Support**: Type-safe method overloads
- **Refactoring Support**: Safe renaming and restructuring

## Browser Compatibility

- Modern browsers supporting ES2020
- CSS Grid and Flexbox support
- requestAnimationFrame API
- localStorage API

## Learn More

- [Rad GUI Documentation](../../readme.md)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/) 