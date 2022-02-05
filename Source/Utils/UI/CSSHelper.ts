/*
Todo items
==========
1) Add system that hoists static style props into a css-class (in a <style> element). ("static" style props are those not wrapped in `dyn(...)`)
2) Extract this system into a separate package. (at some point)
*/

import React from "react";
import {ES} from "./Styles.js";

/**
 * Example usage:
 * ```
 * const {key, css, dyn} = cssFor(this);
 * return (
 * 	<nav className={key("root", "clickThrough")} style={css({
 * 		position: "absolute", zIndex: dyn(manager.zIndexes.subNavBar), top: 0, width: "100%", textAlign: "center",
 * 	})}>
 * 		<div className={key("sub1")} style={css(
 * 			{display: "inline-block", background: "rgba(0,0,0,.7)", boxShadow: dyn(manager.colors.navBarBoxShadow.css())},
 * 			dyn(fullWidth ? {width: "100%"} : {borderRadius: "0 0 10px 10px"}),
 * 		)}>
 * 			{children}
 * 		</div>
 * 	</nav>
 * );
 * ```
 */
export function cssFor(compInstance: React.ReactInstance, cloneInputsForHooks = true) {
	const compClass = compInstance.constructor as CompClass;

	let keyCallIndex = 0;
	let liveKey: string | null;
	const key = (...classNames: any[])=>{
		let classNames_final = classNames;

		const keyHooks = compClassHookSets.get(compClass)?.key ?? [];
		if (cloneInputsForHooks && keyHooks.length) classNames_final = classNames_final.slice();
		for (const hook of keyHooks) {
			const ctx = new KeyHook_Context({
				self: compInstance,
				callIndex: keyCallIndex++,
				classNames_orig: classNames,
				classNames: classNames_final,
			});
			hook(ctx);
		}

		liveKey = classNames_final[0];
		return classNames_final.filter(a=>a).join(" ");
	};

	let cssCallIndex = 0;
	const css = (...styles: StyleOrFalsy[])=>{
		let styles_final = styles;

		const cssHooks = compClassHookSets.get(compClass)?.css ?? [];
		if (cloneInputsForHooks && cssHooks.length) styles_final = styles_final.slice();
		for (const hook of cssHooks) {
			const ctx = new CSSHook_Context({
				self: compInstance,
				key: liveKey,
				callIndex: cssCallIndex++,
				styleArgs_orig: styles,
				styleArgs: styles_final,
			});
			hook(ctx);
		}

		liveKey = null;
		return ES(...styles_final) as React.CSSProperties;
	};

	const dyn = <T>(val: T)=>{
		return val;
	};

	return {key, css, dyn};
}

// Style is a "loosened" CSSProperties, which accepts "null" for any style-prop that accepts "undefined"
export type Style = ConvertType_ConvertFields_UndefToUndefOrNull<React.CSSProperties>;
export type ConvertType_ConvertFields_UndefToUndefOrNull<T extends object> = {
	[K in keyof T]: ConvertType_UndefToUndefOrNull<T[K]>;
}
export type ConvertType_UndefToUndefOrNull<T> = T extends undefined ? (undefined | null) : T;

export type StyleOrFalsy = Style | "" | 0 | false | null | undefined;
export type CompClass = new(..._)=>React.Component;
export const compClassHookSets = new Map<CompClass, CompClassHookSet>();
export class CompClassHookSet {
	key: KeyHook[] = [];
	css: CSSHook[] = [];
}

/**
 * Example usage:
 * ```
 * addHook_key(CompFromLib, ctx=>{
 * 	if (ctx.classNames[0] == "root") {
 * 		ctx.classNames.push("selectable");
 * 	}
 * })
 * ```
 */
export function addHook_key(compClass: CompClass, hook: KeyHook) {
	if (!compClassHookSets.has(compClass)) {
		compClassHookSets.set(compClass, new CompClassHookSet());
	}
	compClassHookSets.get(compClass)!.key.push(hook);
}
export type KeyHook = (ctx: KeyHook_Context)=>void;
export class KeyHook_Context {
	constructor(data?: Partial<KeyHook_Context>) { Object.assign(this, data); }
	self: React.ReactInstance;
	callIndex: number;
	classNames_orig: any[];
	classNames: any[];
}

/**
 * Example usage:
 * ```
 * addHook_css(CompFromLib, ctx=>{
 * 	if (ctx.key == "sub1") {
 * 		ctx.styleArgs.push({color: ctx.self.props.useDarkTheme ? "black" : "white"});
 * 	}
 * })
 * ```
 */
export function addHook_css(compClass: CompClass, hook: CSSHook) {
	if (!compClassHookSets.has(compClass)) {
		compClassHookSets.set(compClass, new CompClassHookSet());
	}
	compClassHookSets.get(compClass)!.css.push(hook);
}
export type CSSHook = (ctx: CSSHook_Context)=>void;
export class CSSHook_Context {
	constructor(data?: Partial<CSSHook_Context>) { Object.assign(this, data); }
	self: React.ReactInstance;
	key: string | null;
	callIndex: number;
	styleArgs_orig: StyleOrFalsy[];
	styleArgs: StyleOrFalsy[];
}