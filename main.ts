import { Plugin, MarkdownView, Editor, Notice, PluginSettingTab, Setting } from "obsidian";
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";

interface SupSubSettings {
    enablePopup: boolean;
    hideTags: boolean;
}

const DEFAULT_SETTINGS: SupSubSettings = {
    enablePopup: true,
    hideTags: true
};

const tagDecoration = Decoration.mark({
    attributes: {
        style: "display: none;"
    }
});

const supDecoration = Decoration.mark({
    attributes: {
        class: "cm-sup"
    }
});

const subDecoration = Decoration.mark({
    attributes: {
        class: "cm-sub"
    }
});

// Improved decoration plugin with better update handling
const supSubDecorationPlugin = ViewPlugin.define((view: EditorView) => {
    return {
        decorations: computeDecorations(view),
        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged) {
                this.decorations = computeDecorations(view);
            }
        }
    };
}, {
    decorations: (v) => v.decorations
});

function computeDecorations(view: EditorView) {
    const builder = new RangeSetBuilder<Decoration>();
    const doc = view.state.doc.toString();
    const regex = /<(sup|sub)>(.*?)<\/\1>/g;
    let match: RegExpExecArray | null;
    
    while ((match = regex.exec(doc)) !== null) {
        const tag = match[1];
        const content = match[2];
        const from = match.index;
        const to = from + match[0].length;
        const openTagStart = from;
        const openTagEnd = from + `<${tag}>`.length;
        const closeTagStart = to - `</${tag}>`.length;
        const closeTagEnd = to;
        
        // Add decorations for tags and content
        builder.add(openTagStart, openTagEnd, tagDecoration);
        builder.add(closeTagStart, closeTagEnd, tagDecoration);
        
        if (tag === "sup") {
            builder.add(openTagEnd, closeTagStart, supDecoration);
        } else if (tag === "sub") {
            builder.add(openTagEnd, closeTagStart, subDecoration);
        }
    }
    
    return builder.finish();
}

// Rest of the class remains unchanged
class SupSubSettingTab extends PluginSettingTab {
    plugin: SupSubPlugin;

    constructor(app: App, plugin: SupSubPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "SupSub Settings" });
        new Setting(containerEl)
            .setName("Enable Popup Buttons")
            .setDesc("Toggle the visibility of the SupSub popup buttons when text is selected.")
            .addToggle(toggle => toggle.setValue(this.plugin.settings.enablePopup).onChange(async (value) => {
                this.plugin.settings.enablePopup = value;
                await this.plugin.saveSettings();
                new Notice(`Popup Buttons ${value ? "Enabled" : "Disabled"}`);
                if (!value) {
                    this.plugin.hideSupSubButtons();
                    this.plugin.selectionStart = null;
                    this.plugin.selectionEnd = null;
                }
            }));
        new Setting(containerEl)
            .setName("Hide Sup/Sub Tags")
            .setDesc("Instantly hide the <sup> and <sub> tags in Editor Mode after wrapping.")
            .addToggle(toggle => toggle.setValue(this.plugin.settings.hideTags).onChange(async (value) => {
                this.plugin.settings.hideTags = value;
                await this.plugin.saveSettings();
                new Notice(`Hide Tags ${value ? "Enabled" : "Disabled"}`);
                this.plugin.refreshDecorations();
            }));
    }
}

export default class SupSubPlugin extends Plugin {
    styleEl: HTMLElement | null = null;
    isWrapping: boolean = false;
    selectionStart: { line: number; ch: number } | null = null;
    selectionEnd: { line: number; ch: number } | null = null;
    settings: SupSubSettings;
    supSubDecorations: any = null;

    async onload() {
        console.log("SupSub Plugin loaded");
        await this.loadSettings();
        this.addSettingTab(new SupSubSettingTab(this.app, this));
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
        const style = `
            .supsub-popup {
                position: absolute;
                background: var(--background-primary);
                border: 1px solid var(--border);
                padding: 5px;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                z-index: 10000;
                display: flex;
                gap: 5px;
                transition: opacity 0.1s ease;
                opacity: 0;
                pointer-events: none;
            }
            .supsub-popup.visible {
                opacity: 1;
                pointer-events: auto;
            }
            .supsub-popup button {
                background: var(--background-modifier-hover);
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background 0.2s ease;
            }
            .supsub-popup button:hover {
                background: var(--background-modifier-hover-active);
            }
            .cm-sup {
                vertical-align: super;
                font-size: smaller;
                position: relative; /* Improved positioning */
                display: inline-block; /* Better layout handling */
            }
            .cm-sub {
                vertical-align: sub;
                font-size: smaller;
                position: relative; /* Improved positioning */
                display: inline-block; /* Better layout handling */
            }
        `;
        this.styleEl = document.createElement("style");
        this.styleEl.innerText = style;
        document.head.appendChild(this.styleEl);
        this.register(() => {
            if (this.styleEl) {
                this.styleEl.remove();
            }
        });
        this.registerEvent(this.app.workspace.on("editor-selection-change", (editor: Editor) => {
            if (this.isWrapping)
                return;
            const selection = editor.getSelection();
            if (selection && this.settings.enablePopup) {
                this.showSupSubButtons(editor);
            } else {
                this.hideSupSubButtons();
            }
        }));
        this.registerDomEvent(document, "click", (evt) => {
            const target = evt.target as HTMLElement;
            if (!target.closest(".supsub-popup")) {
                this.hideSupSubButtons();
            }
        });
        if (this.settings.hideTags) {
            this.supSubDecorations = this.registerEditorExtension(supSubDecorationPlugin);
        }
    }

    onunload() {
        console.log("SupSub Plugin unloaded");
        this.hideSupSubButtons();
        if (this.styleEl) {
            this.styleEl.remove();
        }
        if (this.supSubDecorations) {
            this.supSubDecorations = null;
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    refreshDecorations() {
        if (this.settings.hideTags) {
            if (!this.supSubDecorations) {
                this.supSubDecorations = this.registerEditorExtension(supSubDecorationPlugin);
            }
        } else {
            if (this.supSubDecorations) {
                this.supSubDecorations = null;
            }
        }
    }

    showSupSubButtons(editor: Editor) {
        if (!this.settings.enablePopup)
            return;
        this.hideSupSubButtons();
        const selection = editor.getSelection();
        if (!selection)
            return;
        const cursorStart = editor.getCursor("from");
        const cursorEnd = editor.getCursor("to");
        this.selectionStart = { ...cursorStart };
        this.selectionEnd = { ...cursorEnd };
        const currentTag = this.getCurrentTag(selection);
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "supsub-popup";
        if (currentTag === "sup" || currentTag === "sub") {
            const normalButton = document.createElement("button");
            normalButton.innerText = "Normal (n)";
            normalButton.setAttribute("aria-label", "Remove superscript/subscript");
            normalButton.addEventListener("mousedown", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.wrapSelection(currentTag, editor);
            });
            buttonContainer.appendChild(normalButton);
        } else {
            const supButton = document.createElement("button");
            supButton.innerText = "Sup (\u207F)";
            supButton.setAttribute("aria-label", "Wrap selected text with superscript");
            supButton.addEventListener("mousedown", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.wrapSelection("sup", editor);
            });
            const subButton = document.createElement("button");
            subButton.innerText = "Sub (\u2099)"; // Ensure we're using correct Unicode for subscript n
            subButton.setAttribute("aria-label", "Wrap selected text with subscript");
            subButton.addEventListener("mousedown", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.wrapSelection("sub", editor);
            });
            buttonContainer.appendChild(supButton);
            buttonContainer.appendChild(subButton);
        }
        buttonContainer.style.position = "absolute";
        document.body.appendChild(buttonContainer);
        this.positionPopup(buttonContainer, editor);
        requestAnimationFrame(() => {
            buttonContainer.classList.add("visible");
        });
    }

    hideSupSubButtons() {
        const buttonContainers = document.querySelectorAll(".supsub-popup");
        buttonContainers.forEach((buttonContainer) => {
            buttonContainer.classList.remove("visible");
            setTimeout(() => {
                buttonContainer.remove();
            }, 100);
        });
    }

    positionPopup(popup: HTMLElement, editor: Editor) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const top = rect.bottom + window.scrollY + 5;
            const left = rect.left + (rect.width / 2) - (popup.offsetWidth / 2);
            const maxLeft = window.innerWidth - popup.offsetWidth - 10;
            const calculatedLeft = Math.max(10, Math.min(left, maxLeft));
            popup.style.top = `${top}px`;
            popup.style.left = `${calculatedLeft}px`;
            console.log(`Popup positioned at top: ${top}px, left: ${calculatedLeft}px`);
        }
    }

    wrapSelection(tag: string, editor: Editor) {
        this.isWrapping = true;
        try {
            if (this.selectionStart && this.selectionEnd) {
                const docLines = editor.lineCount();
                const isValidStart = this.selectionStart.line >= 0 && this.selectionStart.line < docLines &&
                    this.selectionStart.ch >= 0 && this.selectionStart.ch <= editor.getLine(this.selectionStart.line).length;
                const isValidEnd = this.selectionEnd.line >= 0 && this.selectionEnd.line < docLines &&
                    this.selectionEnd.ch >= 0 && this.selectionEnd.ch <= editor.getLine(this.selectionEnd.line).length;
                if (isValidStart && isValidEnd) {
                    editor.setSelection(this.selectionStart, this.selectionEnd);
                } else {
                    console.warn("Invalid selection points. Clearing selectionStart and selectionEnd.");
                    this.selectionStart = null;
                    this.selectionEnd = null;
                }
            }
            editor.focus();
            setTimeout(() => {
                const selection = editor.getSelection();
                console.log(`Wrapping selection: "${selection}" with tag: <${tag}>`);
                if (selection) {
                    const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, "s");
                    const matches = regex.exec(selection);
                    if (matches) {
                        const debracketedSelection = matches[1];
                        editor.replaceSelection(debracketedSelection);
                        new Notice(`${tag} tags removed`);
                    } else {
                        const wrappedSelection = `<${tag}>${selection}</${tag}>`;
                        editor.replaceSelection(wrappedSelection);
                        new Notice(`${tag} tags added`);
                    }
                    this.hideSupSubButtons();
                    if (this.settings.hideTags) {
                        const cursor = editor.getCursor();
                        const lineContent = editor.getLine(cursor.line);
                        const optimizedLine = this.optimizeTags(lineContent, tag);
                        editor.setLine(cursor.line, optimizedLine);
                    }
                    const newCursor = editor.getCursor("to");
                    editor.setSelection(newCursor, newCursor);
                    editor.scrollIntoView({
                        from: editor.getCursor('from'),
                        to: editor.getCursor('to'),
                        center: true
                    });
                }
            }, 50);
        } catch (error) {
            console.error("Error in wrapSelection:", error);
            new Notice("An error occurred while wrapping selection.");
        } finally {
            this.isWrapping = false;
        }
    }

    optimizeTags(line: string, tag: string): string {
        const openTag = `<${tag}>`;
        const closeTag = `</${tag}>`;
        let optimizedLine = line.replace(new RegExp(`(${closeTag})(${openTag})`, "g"), "");
        optimizedLine = optimizedLine.replace(new RegExp(`\\${openTag}\\s*\\${closeTag}`, "g"), "");
        return optimizedLine;
    }

    private getCurrentTag(selection: string): string | null {
        const supRegex = /^<sup>([\s\S]+)<\/sup>$/i;
        const subRegex = /^<sub>([\s\S]+)<\/sub>$/i;
        if (supRegex.test(selection)) {
            return "sup";
        } else if (subRegex.test(selection)) {
            return "sub";
        } else {
            return null;
        }
    }
}