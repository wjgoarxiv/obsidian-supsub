var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
	for (var name in all)
		__defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
	if ((from && typeof from === "object") || typeof from === "function") {
		for (let key of __getOwnPropNames(from))
			if (!__hasOwnProp.call(to, key) && key !== except)
				__defProp(to, key, {
					get: () => from[key],
					enumerable:
						!(desc = __getOwnPropDesc(from, key)) ||
						desc.enumerable,
				});
	}
	return to;
};
var __toCommonJS = (mod) =>
	__copyProps(__defProp({}, "__esModule", { value: true }), mod);

var main_exports = {};
__export(main_exports, {
	default: () => SupSubPlugin,
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

var SupSubPlugin = class extends import_obsidian.Plugin {
	async onload() {
		this.addCommand({
			id: "wrap-sup",
			name: "Wrap with <sup> tags",
			editorCallback: (editor, view) => this.wrapSelection("sup", editor),
		});
		this.addCommand({
			id: "wrap-sub",
			name: "Wrap with <sub> tags",
			editorCallback: (editor, view) => this.wrapSelection("sub", editor),
		});
	}

	wrapSelection(tag, editor) {
		const selection = editor.getSelection();

		// Check if the selected text is wrapped with the specified tag
		const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`);
		const matches = regex.exec(selection);

		if (matches) {
			// If the selected text is already wrapped, de-bracket the text
			const debracketedSelection = matches[1];
			editor.replaceSelection(debracketedSelection);
		} else {
			// If the selected text is not wrapped, wrap the text with the specified tag
			const wrappedSelection = `<${tag}>${selection}</${tag}>`;
			editor.replaceSelection(wrappedSelection);
		}
	}
};

module.exports = SupSubPlugin;
