import { Plugin, MarkdownView, Editor } from "obsidian";

export default class SupSubPlugin extends Plugin {
	onload() {
		this.addCommand({
			id: "wrap-sup",
			name: "Wrap with <sup> tags",
			editorCallback: (editor, view) => this.wrapSelection("sup", editor),
			hotkeys: [
				{
					modifiers: ["Mod", "Alt"],
					key: "=",
				},
			],
		});
		this.addCommand({
			id: "wrap-sub",
			name: "Wrap with <sub> tags",
			editorCallback: (editor, view) => this.wrapSelection("sub", editor),
			hotkeys: [
				{
					modifiers: ["Mod", "Alt"],
					key: "-",
				},
			],
		});
	}

	wrapSelection(tag: string, editor: Editor) {
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
