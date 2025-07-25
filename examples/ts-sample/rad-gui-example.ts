import { RadGUI } from '../../src/index';

/**
 * Interface for the demo object showing RadGUI capabilities
 */
interface RadGUIDemoObject {
  // Visual properties
  boxSize: number;
  rotation: number;
  opacity: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  
  // Animation properties
  animationSpeed: number;
  enableAnimation: boolean;
  autoRotate: boolean;
  animationType: string;
  
  // Text and display
  boxText: string;
  showShadow: boolean;
  shadowIntensity: number;
  
  // Advanced styling
  cssFilter: string;
  transform3D: boolean;
  perspective: number;
  
  // Game-like properties
  health: number;
  level: number;
  playerName: string;
  difficulty: string;
  
  // UI state
  debugMode: boolean;
  showStats: boolean;
}

/**
 * RadGUI TypeScript Demo Class
 * Demonstrates the new RadGUI API with explicit method calls
 */
class RadGUITypeScriptDemo {
  private radGui!: RadGUI;
  private demoObject!: RadGUIDemoObject;
  private animationId: number | null = null;
  private box!: HTMLElement;
  private statusElement!: HTMLElement;

  constructor() {
    this.initializeDemoObject();
    this.initializeElements();
    this.setupRadGUI();
    this.startAnimation();
    this.setupEventListeners();
  }

  private initializeDemoObject(): void {
    this.demoObject = {
      // Visual properties
      boxSize: 120,
      rotation: 0,
      opacity: 1,
      backgroundColor: '#4ecdc4',
      borderColor: '#ff6b6b',
      borderWidth: 3,
      borderRadius: 8,
      
      // Animation properties
      animationSpeed: 1,
      enableAnimation: true,
      autoRotate: false,
      animationType: 'bounce',
      
      // Text and display
      boxText: 'RadGUI',
      showShadow: true,
      shadowIntensity: 0.3,
      
      // Advanced styling
      cssFilter: 'none',
      transform3D: false,
      perspective: 1000,
      
      // Game-like properties
      health: 100,
      level: 1,
      playerName: 'Player 1',
      difficulty: 'normal',
      
      // UI state
      debugMode: false,
      showStats: false
    };
  }

  private initializeElements(): void {
    this.box = document.getElementById('animated-box')!;
    this.statusElement = document.getElementById('status')!;
    
    if (!this.box || !this.statusElement) {
      throw new Error('Required DOM elements not found');
    }
  }

  private setupRadGUI(): void {
    // Create main RadGUI instance with explicit method calls
    this.radGui = new RadGUI({
      title: 'RadGUI Demo Controls',
      width: 300
    });

    // Basic appearance controls using explicit methods
    const appearanceFolder = this.radGui.addFolder('🎨 Appearance');
    
    appearanceFolder.addNumber(this.demoObject, 'boxSize', 50, 200, 5)
      .name('Box Size')
      .onChange(() => this.updateBox());

    appearanceFolder.addNumber(this.demoObject, 'opacity', 0, 1, 0.05)
      .name('Opacity')
      .onChange(() => this.updateBox());

    appearanceFolder.addColor(this.demoObject, 'backgroundColor')
      .name('Background Color')
      .onChange(() => this.updateBox());

    appearanceFolder.addColor(this.demoObject, 'borderColor')
      .name('Border Color')
      .onChange(() => this.updateBox());

    appearanceFolder.addNumber(this.demoObject, 'borderWidth', 0, 10, 1)
      .name('Border Width')
      .onChange(() => this.updateBox());

    appearanceFolder.addNumber(this.demoObject, 'borderRadius', 0, 50, 1)
      .name('Border Radius')
      .onChange(() => this.updateBox());

    // Animation controls
    const animationFolder = this.radGui.addFolder('🎬 Animation');
    
    animationFolder.addNumber(this.demoObject, 'rotation', 0, 360, 1)
      .name('Rotation (°)')
      .onChange(() => this.updateBox());

    animationFolder.addNumber(this.demoObject, 'animationSpeed', 0.1, 5, 0.1)
      .name('Animation Speed')
      .onChange(() => this.updateBox());

    animationFolder.addToggle(this.demoObject, 'enableAnimation')
      .name('Enable Animation')
      .onChange(() => this.toggleAnimation());

    animationFolder.addToggle(this.demoObject, 'autoRotate')
      .name('Auto Rotate')
      .onChange(() => this.updateBox());

    animationFolder.addOption(this.demoObject, 'animationType', {
      'Bounce': 'bounce',
      'Pulse': 'pulse', 
      'Swing': 'swing',
      'Wobble': 'wobble'
    })
      .name('Animation Type')
      .onChange(() => this.updateBox());

    // Text and effects
    const effectsFolder = this.radGui.addFolder('✨ Effects');
    
    effectsFolder.addText(this.demoObject, 'boxText')
      .name('Display Text')
      .onChange(() => this.updateBox());

    effectsFolder.addToggle(this.demoObject, 'showShadow')
      .name('Show Shadow')
      .onChange(() => this.updateBox());

    effectsFolder.addNumber(this.demoObject, 'shadowIntensity', 0, 1, 0.1)
      .name('Shadow Intensity')
      .onChange(() => this.updateBox());

    effectsFolder.addOption(this.demoObject, 'cssFilter', [
      'none',
      'blur(2px)',
      'brightness(1.5)',
      'contrast(1.5)',
      'grayscale(50%)',
      'hue-rotate(90deg)',
      'sepia(50%)'
    ])
      .name('CSS Filter')
      .onChange(() => this.updateBox());

    // Game properties demonstrating different control types
    const gameFolder = this.radGui.addFolder('🎮 Game Properties');
    
    gameFolder.addNumber(this.demoObject, 'health', 0, 100, 1)
      .name('Health Points')
      .onChange((data) => this.logChange('Health', data.value));

    gameFolder.addNumber(this.demoObject, 'level', 1, 50, 1)
      .name('Player Level')
      .onChange((data) => this.logChange('Level', data.value));

    gameFolder.addText(this.demoObject, 'playerName')
      .name('Player Name')
      .onChange((data) => this.logChange('Player Name', data.value));

    gameFolder.addOption(this.demoObject, 'difficulty', ['easy', 'normal', 'hard', 'expert'])
      .name('Difficulty')
      .onChange((data) => this.logChange('Difficulty', data.value));

    // Action buttons using RadGUI's addButton method
    const actionsFolder = this.radGui.addFolder('🚀 Actions');
    
    actionsFolder.addButton('Reset All Settings', () => this.resetSettings())
      .name('🔄 Reset Everything');

    actionsFolder.addButton('Randomize Colors', () => this.randomizeColors())
      .name('🎨 Random Colors');

    actionsFolder.addButton('Toggle Animation', () => this.toggleAnimation())
      .name('⏯️ Toggle Animation');

    actionsFolder.addButton('Save Settings', () => this.saveSettings())
      .name('💾 Save Settings');

    actionsFolder.addButton('Load Settings', () => this.loadSettings())
      .name('📁 Load Settings');

    actionsFolder.addButton('Export State', () => this.exportState())
      .name('📤 Export State');

    // Debug utilities
    const debugFolder = this.radGui.addFolder('🐛 Debug');
    
    debugFolder.addToggle(this.demoObject, 'debugMode')
      .name('Debug Mode')
      .onChange(() => this.toggleDebugMode());

    debugFolder.addToggle(this.demoObject, 'showStats')
      .name('Show Stats')
      .onChange(() => this.updateBox());

    debugFolder.addButton('Log Current State', () => this.logCurrentState())
      .name('📊 Log State');

    debugFolder.addButton('Test All Controls', () => this.testAllControls())
      .name('🧪 Test Controls');

    // Global event handlers
    this.radGui.onChange((data) => {
      this.updateStatus(`${data.property} → ${data.value}`);
    });

    this.radGui.onFinishChange((data) => {
      this.logChange('Final', `${data.property} = ${data.value}`);
    });

    this.radGui.onOpenClose((gui) => {
      console.log('Folder toggled:', gui._title);
    });
  }

  private updateBox(): void {
    if (!this.box) return;

    const {
      boxSize, rotation, opacity, backgroundColor, borderColor, 
      borderWidth, borderRadius, boxText, showShadow, shadowIntensity,
      cssFilter, transform3D, perspective
    } = this.demoObject;

    // Apply styles
    this.box.style.width = boxSize + 'px';
    this.box.style.height = boxSize + 'px';
    this.box.style.opacity = opacity.toString();
    this.box.style.backgroundColor = backgroundColor;
    this.box.style.borderColor = borderColor;
    this.box.style.borderWidth = borderWidth + 'px';
    this.box.style.borderStyle = 'solid';
    this.box.style.borderRadius = borderRadius + 'px';
    this.box.textContent = boxText;

    // Apply rotation
    let transform = `rotate(${rotation}deg)`;
    
    // Add 3D perspective if enabled
    const transform3DValue = String(transform3D).toLowerCase();
    if (transform3DValue === 'true') {
      transform += ` perspective(${perspective}px) rotateX(15deg)`;
    }

    this.box.style.transform = transform;

    // Apply shadow
    if (showShadow) {
      const shadowBlur = Math.round(shadowIntensity * 20);
      const shadowColor = `rgba(0, 0, 0, ${shadowIntensity})`;
      this.box.style.boxShadow = `0 ${shadowBlur}px ${shadowBlur * 2}px ${shadowColor}`;
    } else {
      this.box.style.boxShadow = 'none';
    }

    // Apply CSS filter
    this.box.style.filter = cssFilter === 'none' ? '' : cssFilter;

    // Apply animation class based on type
    this.box.className = `animated-box animation-${this.demoObject.animationType}`;
  }

  private startAnimation(): void {
    const animate = () => {
      if (this.demoObject.enableAnimation) {
        if (this.demoObject.autoRotate) {
          this.demoObject.rotation = (this.demoObject.rotation + this.demoObject.animationSpeed) % 360;
          this.radGui.controllersRecursive()
            .find(c => c.property === 'rotation')
            ?.updateDisplay();
          this.updateBox();
        }
      }
      
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  private toggleAnimation(): void {
    this.updateStatus(this.demoObject.enableAnimation ? 'Animation enabled' : 'Animation disabled');
  }

  private resetSettings(): void {
    // Reset to initial values
    Object.assign(this.demoObject, {
      boxSize: 120,
      rotation: 0,
      opacity: 1,
      backgroundColor: '#4ecdc4',
      borderColor: '#ff6b6b',
      borderWidth: 3,
      borderRadius: 8,
      animationSpeed: 1,
      enableAnimation: true,
      autoRotate: false,
      animationType: 'bounce',
      boxText: 'RadGUI',
      showShadow: true,
      shadowIntensity: 0.3,
      cssFilter: 'none',
      health: 100,
      level: 1,
      playerName: 'Player 1',
      difficulty: 'normal'
    });

    // Update all controls
    this.radGui.controllersRecursive().forEach(controller => {
      controller.updateDisplay();
    });

    this.updateBox();
    this.updateStatus('Settings reset to defaults');
  }

  private randomizeColors(): void {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
    
    this.demoObject.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    this.demoObject.borderColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Update color controls
    this.radGui.controllersRecursive()
      .filter(c => c.property === 'backgroundColor' || c.property === 'borderColor')
      .forEach(c => c.updateDisplay());
    
    this.updateBox();
    this.updateStatus('Colors randomized!');
  }

  private saveSettings(): void {
    const settings = { ...this.demoObject };
    localStorage.setItem('radgui-demo-settings', JSON.stringify(settings));
    this.updateStatus('Settings saved to localStorage');
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('radgui-demo-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        Object.assign(this.demoObject, settings);
        
        this.radGui.controllersRecursive().forEach(controller => {
          controller.updateDisplay();
        });
        
        this.updateBox();
        this.updateStatus('Settings loaded from localStorage');
      } catch (error) {
        this.updateStatus('Error loading settings');
      }
    } else {
      this.updateStatus('No saved settings found');
    }
  }

  private exportState(): void {
    const state = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      settings: { ...this.demoObject }
    };
    
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'radgui-demo-export.json';
    link.click();
    
    URL.revokeObjectURL(url);
    this.updateStatus('State exported as JSON file');
  }

  private toggleDebugMode(): void {
    if (this.demoObject.debugMode) {
      console.log('Debug mode enabled');
      console.log('Current state:', this.demoObject);
      this.box.style.outline = '2px dashed red';
    } else {
      console.log('Debug mode disabled');
      this.box.style.outline = 'none';
    }
    
    this.updateStatus(`Debug mode ${this.demoObject.debugMode ? 'enabled' : 'disabled'}`);
  }

  private logCurrentState(): void {
    console.group('🐛 RadGUI Demo State');
    console.log('Demo Object:', this.demoObject);
    console.log('GUI Controllers:', this.radGui.controllersRecursive().length);
    console.log('GUI Folders:', this.radGui.foldersRecursive().length);
    console.groupEnd();
    
    this.updateStatus('State logged to console');
  }

  private testAllControls(): void {
    const controllers = this.radGui.controllersRecursive();
    let tested = 0;
    
    controllers.forEach((controller, index) => {
      setTimeout(() => {
        if (controller.property === 'boxSize') {
          controller.setValue(Math.random() * 150 + 50);
        } else if (controller.property === 'rotation') {
          controller.setValue(Math.random() * 360);
        } else if (controller.property === 'opacity') {
          controller.setValue(Math.random() * 0.5 + 0.5);
        }
        
        tested++;
        this.updateStatus(`Testing controls... ${tested}/${controllers.length}`);
        
        if (tested === controllers.length) {
          setTimeout(() => {
            this.updateStatus('All controls tested!');
          }, 500);
        }
      }, index * 100);
    });
  }

  private setupEventListeners(): void {
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'r':
            event.preventDefault();
            this.resetSettings();
            break;
          case 's':
            event.preventDefault();
            this.saveSettings();
            break;
          case 'l':
            event.preventDefault();
            this.loadSettings();
            break;
        }
      }
    });

    // Box click interaction
    this.box.addEventListener('click', () => {
      this.randomizeColors();
    });
  }

  private updateStatus(message: string): void {
    if (this.statusElement) {
      this.statusElement.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    }
  }

  private logChange(property: string, value: any): void {
    console.log(`🎛️ ${property} changed:`, value);
  }

  // Public method to get the RadGUI instance for external access
  public getRadGUI(): RadGUI {
    return this.radGui;
  }

  // Cleanup method
  public destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.radGui.destroy();
  }
}

// Initialize the demo when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const demo = new RadGUITypeScriptDemo();
  
  // Make demo available globally for debugging
  (window as any).radGuiDemo = demo;
  
  console.log('🎛️ RadGUI TypeScript Demo initialized!');
  console.log('Available methods: resetSettings(), randomizeColors(), saveSettings(), loadSettings()');
  console.log('Keyboard shortcuts: Ctrl+R (reset), Ctrl+S (save), Ctrl+L (load)');
}); 