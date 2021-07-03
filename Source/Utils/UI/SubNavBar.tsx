import {E} from "js-vextensions";
import {BaseComponent, BaseComponentPlus} from "react-vextensions";
import React from "react";
import {Page} from "../../Utils/URL/URLs.js";
import {manager} from "../../Manager.js";
import {ActionFunc, Observer} from "../Store/MobX.js";
import {Link} from "../ReactComponents/Link.js";
import {RootStore} from "web-vcore_UserTypes";

export class SubNavBar_Auto extends BaseComponent<{page: string, fullWidth?: boolean, filter?: (subpage: Page)=>boolean}, {}> {
	render() {
		const {page, filter, ...rest} = this.props;
		const subpages = manager.pageTree.children[page]?.children.VValues() ?? [];
		return (
			<SubNavBar>
				{subpages.filter(filter ?? (page=>true)).map(subpage=>{
					return <SubNavBarButton key={subpage.key} {...{page}} subpage={subpage.key} text={subpage.title}/>;
				})}
			</SubNavBar>
		);
	}
}

@Observer // in case manager.useExpandedNavBar() uses mobx-getters
export class SubNavBar extends BaseComponent<{fullWidth?: boolean}, {}> {
	render() {
		const {fullWidth, children} = this.props;
		if (!manager.useExpandedNavBar()) return null; // if sub-nav-bar hidden, subpage selection is handled in project's NavBar.tsx

		return (
			<nav className="clickThrough" style={{
				position: "absolute", zIndex: manager.zIndexes.subNavBar, top: 0, width: "100%", textAlign: "center",
				// background: "#000 url('/Images/Tiling/TopMenu.png') repeat-x scroll",
				// background: "rgba(0,0,0,.5)", boxShadow: "3px 3px 7px rgba(0,0,0,.07)",
			}}>
				<div style={E(
					{display: "inline-block", background: "rgba(0,0,0,.7)", boxShadow: manager.colors.navBarBoxShadow},
					fullWidth ? {width: "100%"} : {borderRadius: "0 0 10px 10px"},
				)}>
					{children}
				</div>
			</nav>
		);
	}
}

@Observer
export class SubNavBarButton extends BaseComponentPlus({} as {page: string, subpage: string, text: string, actionFuncIfAlreadyActive?: ActionFunc<RootStore>}, {}) {
	render() {
		const {page, subpage, text, actionFuncIfAlreadyActive} = this.props;
		const currentSubpage = manager.store.main[page].subpage ?? manager.pageTree.children[page]?.DefaultChild;
		const active = subpage == currentSubpage;

		let actionFunc: ActionFunc<RootStore>|undefined;
		if (!active) {
			actionFunc = s=>s["main"][page].subpage = subpage;
		} else if (actionFuncIfAlreadyActive) {
			actionFunc = actionFuncIfAlreadyActive;
		}

		return (
			<Link actionFunc={actionFunc} text={text} style={E(
				{
					display: "inline-block", cursor: "pointer", verticalAlign: "middle",
					lineHeight: "30px", color: "#FFF", padding: "0 15px", fontSize: 12, textDecoration: "none", opacity: 0.9,
					":hover": {color: "rgba(100,255,100,1)"},
				},
				active && {color: "rgba(100,255,100,1)"},
			)}/>
		);
	}
}