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

		if (selection) {
			// Check if the selection is already wrapped with the tag
			const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`);
			const matches = regex.exec(selection);

			if (matches) {
				// If the selection is already wrapped, unwrap it
				const debracketedSelection = matches[1];
				editor.replaceSelection(debracketedSelection);
			} else {
				// If not wrapped, wrap the selection with the tags
				const wrappedSelection = `<${tag}>${selection}</${tag}>`;
				editor.replaceSelection(wrappedSelection);
			}
		} else {
			// No selection, insert the tags and position cursor in between
			const cursor = editor.getCursor();
			const wrappedTag = `<${tag}></${tag}>`;

			editor.replaceRange(wrappedTag, cursor);

			// Move the cursor to between the tags
			const newCursorPos = {
				line: cursor.line,
				ch: cursor.ch + tag.length + 2, // position after opening tag
			};
			editor.setCursor(newCursorPos);
		}
	}
}
