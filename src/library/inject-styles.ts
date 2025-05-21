import { el } from "./el";
import { DEFAULT_CSS_CONTENT } from "./css-content";

// CSS content is provided by webpack DefinePlugin
declare const CSS_CONTENT: string;

let stylesInjected = false;

/**
 * Injects the CSS styles into the document head
 * This is called automatically when the first GUI instance is created
 * unless injectStyles is set to false
 */
export function injectStyles() {
	if (stylesInjected) return;
	
	// Use CSS_CONTENT from webpack if available, otherwise use fallback
	const cssContent = typeof CSS_CONTENT !== 'undefined' ? CSS_CONTENT : DEFAULT_CSS_CONTENT;
	
	const injected = el('style', { 
		id: 'rad-gui-styles',
		innerHTML: cssContent
	});

	const before = document.querySelector('head link[rel=stylesheet], head style');
	if (before) {
		document.head.insertBefore(injected, before);
	} else {
		document.head.appendChild(injected);
	}
	
	stylesInjected = true;
}

export function hasInjectedStyles() {
	return stylesInjected;
}

export default injectStyles;
