import {BaseComponent} from "react-vextensions";
import React, {HTMLProps} from "react";
import {cssFor} from "../UI/CSSHelper.js";
//import "rc-tooltip/assets/bootstrap.css";

export type InTooltipProps = {style?: any} & Partial<HTMLProps<HTMLDivElement>>;

export class InTooltip extends BaseComponent<InTooltipProps, {}> {
	render() {
		const {style, children, ...rest} = this.props;
		const {css} = cssFor(this);
		return (
			<div {...rest} style={css({whiteSpace: "pre"}, style)}>
				{children}
			</div>
		);
	}
}