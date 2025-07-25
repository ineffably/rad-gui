import { GUI } from '../../src/index';

// Type definitions for better TypeScript experience
interface ControlEventData<T = any> {
  object: Record<string, any>;
  property: string;
  value: T;
  controller: any;
}

// Demo object with various property types to showcase all control types
interface DemoObject {
  // Number controls
  boxSize: number;
  rotation: number;
  opacity: number;
  animationSpeed: number;
  
  // Boolean controls
  enableAnimation: boolean;
  showShadow: boolean;
  autoRotate: boolean;
  
  // String controls
  boxText: string;
  cssFilter: string;
  
  // Color controls
  backgroundColor: string;
  borderColor: string;
  
  // Option controls
  animationType: string;
  boxShape: string;
  
  // Function controls
  resetBox: () => void;
  randomizeColors: () => void;
  saveSettings: () => void;
  loadSettings: () => void;
}

class TypeScriptDemo {
  private gui!: GUI;
  private animationFolder!: GUI;
  private appearanceFolder!: GUI;
  private actionsFolder!: GUI;
  private box: HTMLElement;
  private status: HTMLElement;
  private animationId: number | null = null;
  
  // Demo object with all the properties we'll control
  private demoObject: DemoObject = {
    // Number properties
    boxSize: 100,
    rotation: 0,
    opacity: 1,
    animationSpeed: 1,
    
    // Boolean properties
    enableAnimation: false,
    showShadow: true,
    autoRotate: false,
    
    // String properties
    boxText: 'Box',
    cssFilter: 'none',
    
    // Color properties (various formats supported)
    backgroundColor: '#ff6b6b',
    borderColor: 'rgb(255, 255, 255)',
    
    // Option properties
    animationType: 'bounce',
    boxShape: 'square',
    
    // Function properties
    resetBox: () => this.resetBox(),
    randomizeColors: () => this.randomizeColors(),
    saveSettings: () => this.saveSettings(),
    loadSettings: () => this.loadSettings()
  };

  constructor() {
    this.box = document.getElementById('animated-box')!;
    this.status = document.getElementById('status')!;
    
    this.setupGUI();
    this.updateBox();
    this.startAnimation();
  }

  private setupGUI(): void {
    // Create main GUI instance
    this.gui = new GUI({
      title: 'Demo Controls',
      width: 300
    });

    // Basic controls demonstrating different input types
    this.gui.add(this.demoObject, 'boxSize', 50, 200, 1)
      .name('Box Size')
      .onChange(() => this.updateBox())
      .onFinishChange((data: ControlEventData<number>) => this.logChange('Box Size', data.value));

    this.gui.add(this.demoObject, 'rotation', 0, 360, 1)
      .name('Rotation (°)')
      .onChange(() => this.updateBox());

    this.gui.add(this.demoObject, 'opacity', 0, 1, 0.01)
      .name('Opacity')
      .onChange(() => this.updateBox());

    this.gui.add(this.demoObject, 'boxText')
      .name('Text Content')
      .onChange(() => this.updateBox());

    // Boolean controls
    this.gui.add(this.demoObject, 'enableAnimation')
      .name('Enable Animation')
      .onChange((data: ControlEventData<boolean>) => {
        if (data.value) {
          this.startAnimation();
        } else {
          this.stopAnimation();
        }
        this.logChange('Animation', data.value ? 'Started' : 'Stopped');
      });

    this.gui.add(this.demoObject, 'showShadow')
      .name('Show Shadow')
      .onChange(() => this.updateBox());

    // Color controls with different RGB scales
    this.gui.addColor(this.demoObject, 'backgroundColor', 1)
      .name('Background Color')
      .onChange(() => this.updateBox());

    this.gui.addColor(this.demoObject, 'borderColor', 1)
      .name('Border Color')
      .onChange(() => this.updateBox());

    // Option controls with arrays and objects
    this.gui.add(this.demoObject, 'animationType', ['bounce', 'pulse', 'shake', 'rotate'])
      .name('Animation Type')
      .onChange((data: ControlEventData<string>) => this.logChange('Animation Type', data.value));

    this.gui.add(this.demoObject, 'boxShape', {
      Square: 'square',
      Circle: 'circle',
      Diamond: 'diamond',
      Triangle: 'triangle'
    })
      .name('Shape')
      .onChange(() => this.updateBox());

    // Create folders to organize controls
    this.setupAnimationFolder();
    this.setupAppearanceFolder();
    this.setupActionsFolder();

    // Demonstrate event handlers with proper typing
    this.gui.onChange((event: ControlEventData) => {
      console.log('GUI Change Event:', event);
      this.logChange(`Global onChange: ${event.property}`, event.value);
    });

    this.gui.onFinishChange((event: ControlEventData) => {
      console.log('GUI Finish Change Event:', event);
      this.logChange(`Global onFinishChange: ${event.property}`, event.value);
    });

    this.gui.onOpenClose((gui: GUI) => {
      console.log('GUI Open/Close Event:', gui);
      const isOpen = !gui._closed;
      this.logChange('Folder State', isOpen ? 'Opened' : 'Closed');
    });
  }

  private setupAnimationFolder(): void {
    this.animationFolder = this.gui.addFolder('Animation Settings');
    
    this.animationFolder.add(this.demoObject, 'animationSpeed', 0.1, 3, 0.1)
      .name('Speed Multiplier')
      .onChange(() => this.updateAnimation());

    this.animationFolder.add(this.demoObject, 'autoRotate')
      .name('Auto Rotate')
      .onChange(() => this.updateAnimation());

    // Close folder by default to demonstrate folder functionality
    this.animationFolder.close();
  }

  private setupAppearanceFolder(): void {
    this.appearanceFolder = this.gui.addFolder('Advanced Appearance');
    
    this.appearanceFolder.add(this.demoObject, 'cssFilter', [
      'none',
      'blur(2px)',
      'brightness(1.5)',
      'contrast(1.5)',
      'grayscale(1)',
      'sepia(1)',
      'hue-rotate(90deg)'
    ])
      .name('CSS Filter')
      .onChange(() => this.updateBox());
  }

  private setupActionsFolder(): void {
    this.actionsFolder = this.gui.addFolder('Actions');
    
    // Function controls
    this.actionsFolder.add(this.demoObject, 'resetBox')
      .name('Reset to Defaults');

    this.actionsFolder.add(this.demoObject, 'randomizeColors')
      .name('Randomize Colors');

    this.actionsFolder.add(this.demoObject, 'saveSettings')
      .name('Save Settings');

    this.actionsFolder.add(this.demoObject, 'loadSettings')
      .name('Load Settings');
  }

  private updateBox(): void {
    const { 
      boxSize, 
      rotation, 
      opacity, 
      boxText, 
      backgroundColor, 
      borderColor, 
      showShadow, 
      boxShape, 
      cssFilter 
    } = this.demoObject;

    // Apply size and basic transforms
    this.box.style.width = `${boxSize}px`;
    this.box.style.height = `${boxSize}px`;
    this.box.style.transform = `rotate(${rotation}deg)`;
    this.box.style.opacity = opacity.toString();
    this.box.style.backgroundColor = backgroundColor;
    this.box.style.borderColor = borderColor;
    this.box.style.border = `2px solid ${borderColor}`;
    this.box.style.filter = cssFilter;
    this.box.textContent = boxText;

    // Apply shadow
    this.box.style.boxShadow = showShadow 
      ? '0 4px 8px rgba(0,0,0,0.2)' 
      : 'none';

    // Apply shape
    switch (boxShape) {
      case 'circle':
        this.box.style.borderRadius = '50%';
        break;
      case 'diamond':
        this.box.style.borderRadius = '0';
        this.box.style.transform = `rotate(${rotation + 45}deg)`;
        break;
      case 'triangle':
        this.box.style.borderRadius = '0';
        this.box.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        break;
      default:
        this.box.style.borderRadius = '8px';
        this.box.style.clipPath = 'none';
    }
  }

  private startAnimation(): void {
    if (this.animationId) return;
    
    let startTime = Date.now();
    
    const animate = () => {
      if (!this.demoObject.enableAnimation) return;
      
      const elapsed = Date.now() - startTime;
      const speed = this.demoObject.animationSpeed;
      
      switch (this.demoObject.animationType) {
        case 'bounce':
          this.box.style.transform += ` translateY(${Math.sin(elapsed * 0.005 * speed) * 10}px)`;
          break;
        case 'pulse':
          const scale = 1 + Math.sin(elapsed * 0.003 * speed) * 0.1;
          this.box.style.transform += ` scale(${scale})`;
          break;
        case 'shake':
          const shakeX = Math.sin(elapsed * 0.02 * speed) * 2;
          const shakeY = Math.cos(elapsed * 0.02 * speed) * 2;
          this.box.style.transform += ` translate(${shakeX}px, ${shakeY}px)`;
          break;
        case 'rotate':
          this.demoObject.rotation = (this.demoObject.rotation + speed) % 360;
          break;
      }
      
      if (this.demoObject.autoRotate) {
        this.demoObject.rotation = (this.demoObject.rotation + 0.5 * speed) % 360;
      }
      
      this.updateBox();
      this.animationId = requestAnimationFrame(animate);
    };
    
    this.animationId = requestAnimationFrame(animate);
  }

  private stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private updateAnimation(): void {
    if (this.demoObject.enableAnimation) {
      this.stopAnimation();
      this.startAnimation();
    }
  }

  private resetBox(): void {
    // Reset to default values
    Object.assign(this.demoObject, {
      boxSize: 100,
      rotation: 0,
      opacity: 1,
      animationSpeed: 1,
      enableAnimation: false,
      showShadow: true,
      autoRotate: false,
      boxText: 'Box',
      cssFilter: 'none',
      backgroundColor: '#ff6b6b',
      borderColor: 'rgb(255, 255, 255)',
      animationType: 'bounce',
      boxShape: 'square'
    });
    
    // Update all controllers to reflect the reset values
    this.gui.controllersRecursive().forEach(controller => {
      controller.updateDisplay();
    });
    
    this.updateBox();
    this.logChange('Settings', 'Reset to defaults');
  }

  private randomizeColors(): void {
    const randomColor = () => {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgb(${r}, ${g}, ${b})`;
    };
    
    this.demoObject.backgroundColor = randomColor();
    this.demoObject.borderColor = randomColor();
    
    // Update the color controllers to show the new values
    this.gui.controllersRecursive().forEach(controller => {
      if (controller.property === 'backgroundColor' || controller.property === 'borderColor') {
        controller.updateDisplay();
      }
    });
    
    this.updateBox();
    this.logChange('Colors', 'Randomized');
  }

  private saveSettings(): void {
    const settings = this.gui.save();
    localStorage.setItem('radGuiDemoSettings', JSON.stringify(settings));
    this.logChange('Settings', 'Saved to localStorage');
  }

  private loadSettings(): void {
    const savedSettings = localStorage.getItem('radGuiDemoSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        this.gui.load(settings);
        this.updateBox();
        this.logChange('Settings', 'Loaded from localStorage');
      } catch (error) {
        this.logChange('Settings', 'Error loading from localStorage');
        console.error('Error loading settings:', error);
      }
    } else {
      this.logChange('Settings', 'No saved settings found');
    }
  }

  private logChange(property: string, value: any): void {
    const timestamp = new Date().toLocaleTimeString();
    this.status.textContent = `${timestamp}: ${property} changed to ${value}`;
    console.log(`[${timestamp}] ${property}:`, value);
  }
}

// Initialize the demo when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TypeScriptDemo();
  
  console.log('🎛️ Rad GUI TypeScript Demo initialized!');
  console.log('This demo showcases:');
  console.log('• Number controls with min/max/step');
  console.log('• Boolean toggle controls');
  console.log('• Text input controls');
  console.log('• Color picker controls');
  console.log('• Option controls (dropdowns)');
  console.log('• Function button controls');
  console.log('• Organized folders');
  console.log('• Event handling');
  console.log('• Save/load functionality');
  console.log('• Proper TypeScript typing');
}); 