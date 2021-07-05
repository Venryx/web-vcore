import {BailHandler_loadingUI_default_Set, BailMessage} from "mobx-graphlink";
import React from "react";
import {Row, Text} from "react-vcomponents";
import {BaseComponent, BaseComponentPlus} from "react-vextensions";
import {ES} from "../UI/Styles.js";
import {InfoButton} from "./InfoButton.js";

BailHandler_loadingUI_default_Set(info=>{
	return <DefaultLoadingUI comp={info.comp} bailMessage={info.bailMessage}/>;
});

export class DefaultLoadingUI extends BaseComponentPlus({} as {comp: BaseComponent<any>, bailMessage: BailMessage}, {}) {
	render() {
		let {comp, bailMessage} = this.props;
		return (
			<div style={ES({
				display: "flex", alignItems: "center", justifyContent: "center", flex: 1, //fontSize: 25,
				//textShadow: "#000 0px 0px 1px,   #000 0px 0px 1px,   #000 0px 0px 1px, #000 0px 0px 1px,   #000 0px 0px 1px,   #000 0px 0px 1px",
				color: "white",
				textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
				zIndex: 11, // needed to show above sub-nav-bar
			})}>
				<Row center>
					<Text>Loading...</Text>
					<InfoButton ml={5} mt={2} // dunno why mt:2 needed, but wouldn't center fully otherwise
						text={`Details (comp: ${comp.constructor.name}): ${bailMessage.message}`}/>
				</Row>
			</div>
		);
	}
}