import {BailHandler_loadingUI_default_Set, BailError} from "mobx-graphlink";
import React from "react";
import {Row, Text} from "react-vcomponents";
import {BaseComponent, BaseComponentPlus} from "react-vextensions";
import {cssHelper} from "../UI/CSSHelper.js";
import {ES} from "../UI/Styles.js";
import {InfoButton} from "./InfoButton.js";

BailHandler_loadingUI_default_Set(info=>{
	return <DefaultLoadingUI comp={info.comp} bailMessage={info.bailMessage}/>;
});

export class DefaultLoadingUI extends BaseComponentPlus({} as {comp: BaseComponent<any>, bailMessage: BailError}, {}) {
	render() {
		const {comp, bailMessage} = this.props;
		const compProps_neededPropsOnly = comp.props.Pairs().filter(a=>{
			// allow attachment of react-beautiful-dnd's drag-handle props, otherwise a prominent warning is generated (in dev mode)
			if (a.key.startsWith("data-rbd-drag-handle-")) return true;
			return false;
		}).ToMapObj(a=>a.key, a=>a.value);
		//console.log(`Comp:${comp.constructor.name} @CompProps:`, compProps_neededPropsOnly);
		const {css} = cssHelper(this);
		return (
			<div {...compProps_neededPropsOnly} style={css({
				display: "flex", alignItems: "center", justifyContent: "center", flex: 1, //fontSize: 25,
				//textShadow: "#000 0px 0px 1px,   #000 0px 0px 1px,   #000 0px 0px 1px, #000 0px 0px 1px,   #000 0px 0px 1px,   #000 0px 0px 1px",
				color: "white",
				textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
				zIndex: 11, // needed to show above sub-nav-bar
			})}>
				<Row center>
					<Text>Loading...</Text>
					<InfoButton ml={5} mt={2} // dunno why mt:2 needed, but wouldn't center fully otherwise
						sel text={`Details (comp: ${comp.constructor.name}): ${bailMessage.message}`}/>
				</Row>
			</div>
		);
	}
}

// ugly fix for useXXX call-count sometimes increasing, due to mobx-graphlink's bail-system being used (eg. first render bails, so 0 useXXX calls, followed by successful render, with X calls)
export const valueForPrevInputSlotsNotYetInitialized = Symbol("valueForPrevInputSlotsNotYetInitialized");
// eslint-disable-next-line
Object.defineProperty(Object.prototype, "prevInputs", {
	//configurable: true, // already defaults to true
	get() {
		// if this getter is being called, it means that the first render of a comp was interrupted by a mobx-graphlink "bail", and react-class-hooks is now running, assuming a prevInputs array was set for the current useXXX hook
		// so, pretend a "prevInputs" array exists (and of the same length as "inputs" is now), but with all values "undefined" (so react-class-hooks detects the array-values as changing)
		if (this.inputs instanceof Array) {
			//return this.inputs;
			return this.inputs.map(a=>valueForPrevInputSlotsNotYetInitialized);
		}
		return undefined;
	},
	set(value: any) {
		/*delete this["prevInputs"];
		this.prevInputs = value;*/
		// property on instance overrides propery on prototype
		Object.defineProperty(this, "prevInputs", {
			writable: true,
			value,
		});
	},
});