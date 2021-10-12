import Moment from "moment";
import {Assert, emptyArray, emptyArray_forLoading, WaitXThenRun} from "js-vextensions";
import {DeepMap} from "mobx-graphlink/Dist/Utils/General/DeepMap";
import chroma from "chroma-js";

G({Moment});

G({Debugger}); declare global { function Debugger(); }
export function Debugger(ifCondition = true, returnVal = null) {
	if (ifCondition) {
		debugger;
	}
	return returnVal;
}

// class/function tags
// ==========

export function Grab(grabFunc) {
	return target=>grabFunc(target);
}

// polyfills for constants
// ==========

//var quickIncrementValues = {};
//export function QuickIncrement(name = new Error().stack.split("\n")[2]) { // this doesn't always work, fsr
export function QuickIncrement(name = "default") {
	QuickIncrement["values"][name] = (QuickIncrement["values"][name] ?? 0) + 1;
	return QuickIncrement["values"][name];
}
QuickIncrement["values"] = [];
G({QuickIncrement});

// methods: url writing/parsing
// ==================

export var inFirefox = navigator.userAgent.toLowerCase().includes("firefox");

// others
// ==================

export var loadTime = Date.now();
export function GetTimeSinceLoad() {
	return (Date.now() - loadTime) / 1000;
}

export function GetCookie(name: string) {
	var match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
	if (match) return match[2];
}

export function CopyText(text) {
	/*
	//var note = $(`<input type="text">`).appendTo("body");
	var note = document.createElement("textarea");
	document.body.appendChild(note);
	note.innerHTML = text;

	note.focus();
	var range = document.createRange();
	range.setStart(note, 0);
	range.setEnd(note, 1);
	//range.setEnd(note2, 0);

	//range.setEnd(e("notesEnder"), 0); // adds one extra new-line; that's okay, right?
	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);

	document.execCommand("copy");*/

	(document as any).oncopy = function(event) {
		event.clipboardData.setData("text/plain", text);
		event.preventDefault();
		(document as any).oncopy = null;
	};
	(document as any).execCommand("copy", false, null);
}

export type ReadAsString_FuncName = "readAsBinaryString" | "readAsDataURL" | "readAsText";
export function BlobToString(blob: Blob, readAsFuncName = "readAsText" as ReadAsString_FuncName) {
	return new Promise((resolve, reject)=>{
		const reader = new FileReader();
		//reader.addEventListener("loadend", e=>resolve(e.srcElement["result"]));
		reader.addEventListener("loadend", e=>resolve(reader.result as string));
		reader[readAsFuncName](blob);
	}) as Promise<string>;
}
export function BlobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
	return new Promise((resolve, reject)=>{
		const reader = new FileReader();
		/*reader.onloadend = e=>resolve(reader.result as ArrayBuffer);
		reader.onerror = e=>reject(e["error"]);*/
		reader.addEventListener("loadend", e=>resolve(reader.result as ArrayBuffer));
		reader.addEventListener("error", e=>reject(e["error"]));
		reader.readAsArrayBuffer(blob);
	});
}

function IsPrimitive(val) {
    return val == null || (typeof val != "object" && typeof val != "function");
}
const weakIDsMap = new WeakMap<any, string>();
let nextWeakID = 1; // start at 1, so that even the first id is "truthy"
export function WeakID(obj: any) {
	if (IsPrimitive(obj)) {
		// this is kinda verbose, but I don't expect to hit this case anyway
		return JSON.stringify({type: typeof obj, valAsStr: obj + ""});
	}

	if (!weakIDsMap.has(obj)) {
		weakIDsMap.set(obj, nextWeakID + "");
		nextWeakID++;
	}
	return weakIDsMap.get(obj);
}

/*export function WaitXThenRun_Deduped(flagSetter: (val: boolean)=>any, flagGetter: ()=>boolean, delayInMS: number, func: Function) {
	if (flagGetter()) return false;
	flagSetter(true);
	WaitXThenRun(delayInMS, ()=>{
		func();
		flagSetter(false);
	});
	return true;
}*/
/*export const WaitXThenRun_Deduped_funcBufferedState = new DeepMap<boolean>();
export function WaitXThenRun_Deduped(flagPath: any[], delayInMS: number, func: Function) {
	// since we don't call entry.delete(), the deep-map permanently stores any objects passed into deepMap.entry(...);
	//		thus, we replace any non-primitives with an id generated for it (ie. `WeakID(obj)`)
	for (const [i, item] of flagPath.entries()) {
		if (!IsPrimitive(item)) {
			flagPath[i] = WeakID(item);
		}
	}
	const funcBuffered_entry = WaitXThenRun_Deduped_funcBufferedState.entry(flagPath);

	if (funcBuffered_entry.get()) return false;
	funcBuffered_entry.set(true);
	WaitXThenRun(delayInMS, ()=>{
		func();
		funcBuffered_entry.set(false);
	});
	return true;
}*/
export const WaitXThenRun_Deduped_funcBufferedState = new WeakMap<any, Map<string, boolean>>();
export function WaitXThenRun_Deduped(host: any, key: string, delayInMS: number, func: Function) {
	const setOfMaps = WaitXThenRun_Deduped_funcBufferedState;
	if (!setOfMaps.has(host)) {
		setOfMaps.set(host, new Map<string, boolean>());
	}
	const map = setOfMaps.get(host)!;
	if (!map.has(key)) {
		map.set(key, false);
	}
	
	// if func-call is already buffered for this host+key combination, don't schedule another func-call
	if (map.get(key)) return false;

	map.set(key, true);
	WaitXThenRun(delayInMS, ()=>{
		func();
		map.delete(key);
	});
	return true;
}

export function Chroma_Safe(input: any, fallbackInput = [0, 0, 0, 0]) {
	try {
		return chroma(input);
	} catch (ex) {
		// if parsing failed, return the fallback color
		return chroma(fallbackInput);
	}
}