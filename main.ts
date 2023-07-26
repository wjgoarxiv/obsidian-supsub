import { Plugin } from "obsidian";

export default class SupSubPlugin extends Plugin {
	onload() {
		this.addCommand({
			id: "wrap-sup",
			name: "Wrap with <sup> tags",
			callback: () => this.wrapSelection("sup"),
		});
		this.addCommand({
			id: "wrap-sub",
			name: "Wrap with <sub> tags",
			callback: () => this.wrapSelection("sub"),
		});
	}

	wrapSelection(tag: string) {
		const editor = this.app.workspace.activeLeaf.view.sourceMode.cmEditor;
		const selection = editor.getSelection();

		const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`);
		const matches = regex.exec(selection);

		if (matches) {
			const debracketedSelection = matches[1];
			editor.replaceSelection(debracketedSelection);
		} else {
			const wrappedSelection = `<${tag}>${selection}</${tag}>`;
			editor.replaceSelection(wrappedSelection);
		}
	}
}