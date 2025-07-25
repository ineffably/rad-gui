import { GUI } from './gui';
import { el } from './library/el';
import injectStyles, { hasInjectedStyles } from './library/inject-styles';
import './rad-gui.css';

// Enhanced TypeScript interfaces for better developer experience
export interface GuiOptions {
  parent?: GUI;
  autoPlace?: boolean;
  container?: HTMLElement;
  width?: number;
  title?: string;
  closeFolders?: boolean;
  injectStyles?: boolean;
  touchStyles?: boolean;
}

export interface ControlEventData<T = any> {
  object: Record<string, any>;
  property: string;
  value: T;
  controller: any;
}

export type ChangeCallback<T = any> = (data: ControlEventData<T>) => void;
export type FinishChangeCallback<T = any> = (data: ControlEventData<T>) => void;
export type OpenCloseCallback = (gui: GUI) => void;

export interface SavedState {
  controllers: Record<string, any>;
  folders: Record<string, SavedState>;
}

export default GUI;
export { GUI, el, injectStyles, hasInjectedStyles };
