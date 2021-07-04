import {BailHandler_loadingUI_default_Set, BailMessage} from "mobx-graphlink";
import React from "react";
import {Row, Text} from "react-vcomponents";
import {BaseComponentPlus} from "react-vextensions";
import {ES} from "../UI/Styles.js";
import {InfoButton} from "./InfoButton.js";

BailHandler_loadingUI_default_Set(bailMessage=>{
	return <DefaultLoadingUI bailMessage={bailMessage}/>;
});

export class DefaultLoadingUI extends BaseComponentPlus({} as {bailMessage: BailMessage}, {}) {
	render() {
		let {bailMessage} = this.props;
		return (
			<div style={ES({
				display: "flex", alignItems: "center", justifyContent: "center", flex: 1, //fontSize: 25,
				//textShadow: "#000 0px 0px 1px,   #000 0px 0px 1px,   #000 0px 0px 1px, #000 0px 0px 1px,   #000 0px 0px 1px,   #000 0px 0px 1px",
				color: "white",
				textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
			})}>
				<Row>
					<Text>Loading...</Text>
					<InfoButton ml={5} text={`Details: ${bailMessage.message}`}/>
				</Row>
			</div>
		);
	}
}