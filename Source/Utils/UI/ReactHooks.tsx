import {UseState, ShallowEquals} from "react-vextensions";
import {VRect, ToJSON, E} from "js-vextensions";
import {useRef, useLayoutEffect, MutableRefObject, useState, useCallback, Component} from "react";
import ReactDOM from "react-dom";
import {GetSize, GetSize_Method, Size, SizeComp} from "./Sizes.js";

// general
// ==========

// will try to finish this once I have more experience with react-hooks
/* export function UseCheckStillHoveredTimer() {
	let checkStillHoveredTimer;
	useEffect(()=>{
		checkStillHoveredTimer = new Timer(100, ()=>{
			const dom = GetDOM(this.root);
			if (dom == null) {
				checkStillHoveredTimer.Stop();
				return;
			}
			const mainRect = VRect.FromLTWH(dom.getBoundingClientRect());

			const leftBoxDOM = dom.querySelector(".NodeUI_LeftBox");
			const leftBoxRect = leftBoxDOM ? VRect.FromLTWH(leftBoxDOM.getBoundingClientRect()) : null;

			const mouseRect = new VRect(mousePos, new Vector2(1, 1));
			const intersectsOne = mouseRect.Intersects(mainRect) || (leftBoxRect && mouseRect.Intersects(leftBoxRect));
			// Log(`Main: ${mainRect} Mouse:${mousePos} Intersects one?:${intersectsOne}`);
			setHovered(intersectsOne);
		});
		return ()=>checkStillHoveredTimer.Stop(); // cleanup func
	}, []);
	return checkStillHoveredTimer;
} */

export class UseSize_Options {
	method = GetSize_Method.OffsetSize;
	method_custom_sizeComps?: SizeComp[];
}

/**
 * Note that this does not update on window/css-only resizes; to detect a resize, the component calling UseSize must get re-rendered.
 * To detect resizes of any sort, try using/wrapping: https://github.com/ZeeCoder/use-resize-observer (or: https://github.com/jaredLunde/react-hook/tree/master/packages/size, or: https://github.com/rehooks/component-size)
 */
export function UseSize(options?: Partial<UseSize_Options>): [(node: Component | Element)=>any, Size] {
	options = E(new UseSize_Options(), options);
	const [size, setSize] = UseState({width: null, height: null} as Size, ShallowEquals);

	//const [node, setNode] = UseState(null);
	const nodeRef = useRef<Element>(); // use ref, so that we don't trigger render just by storing newNode (setSize runs later than it anyway)
	const ref = useCallback(compOrNode=>{
		if (compOrNode == null) return; // if element was unmounted, just ignore (ie. wait till remounted to call setSize)
		let newNode: Element = compOrNode;
		if (compOrNode instanceof Component) newNode = ReactDOM.findDOMNode(compOrNode) as Element; // eslint-disable-line
		//setNode(newNode);
		nodeRef.current = newNode;
	}, []);

	useLayoutEffect(()=>{
		if (nodeRef.current == null) return;
		window.requestAnimationFrame(()=>{
			//const el = ref.current as HTMLElement;
			const newSize = GetSize(nodeRef.current as any, options.method, options.method_custom_sizeComps);
			setSize(newSize);
		});
	//}, [nodeRef.current]);
	});
	return [ref, size];
}