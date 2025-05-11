import { el } from "./el";

export function injectStyles( cssContent ) {
	const injected = el( 'style', { innerHTML: cssContent })

  const before = document.querySelector( 'head link[rel=stylesheet], head style' );
	if ( before ) {
		document.head.insertBefore( injected, before );
	} else {
		document.head.appendChild( injected );
	}
}

export default injectStyles;
