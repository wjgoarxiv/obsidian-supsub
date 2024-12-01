// main.ts
import { Plugin, MarkdownView, Editor, Notice } from "obsidian";

export default class SupSubPlugin extends Plugin {
    styleEl: HTMLElement | null = null;
    isWrapping: boolean = false; // Flag to prevent re-triggering
    selectionStart: { line: number; ch: number } | null = null;
    selectionEnd: { line: number; ch: number } | null = null;

    onload() {
        console.log('SupSub Plugin loaded');

        // Register commands
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

        // Inject CSS
        const style = `
            .supsub-popup {
                position: absolute;
                background: var(--background-primary);
                border: 1px solid var(--border);
                padding: 5px;
                border-radius: 8px; /* Enhanced rounding */
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                z-index: 10000; /* Increased z-index */
                display: flex;
                gap: 5px;
                transition: opacity 0.1s ease; /* Shorter transition */
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
                border-radius: 4px; /* Enhanced rounding */
                cursor: pointer;
                font-size: 12px;
                transition: background 0.2s ease;
            }
            .supsub-popup button:hover {
                background: var(--background-modifier-hover-active);
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

        // Register selection change event
        this.registerEvent(this.app.workspace.on('editor-selection-change', (editor: Editor) => {
            if (this.isWrapping) return; // Prevent if wrapping is in progress
            const selection = editor.getSelection();
            if (selection) {
                this.showSupSubButtons(editor);
            } else {
                this.hideSupSubButtons();
            }
        }));

        // Hide popup on external click
        this.registerDomEvent(document, "click", (evt) => {
            const target = evt.target as HTMLElement;
            if (!target.closest(".supsub-popup")) {
                this.hideSupSubButtons();
            }
        });
    }

    onunload() {
        console.log("SupSub Plugin unloaded");
        this.hideSupSubButtons();
        if (this.styleEl) {
            this.styleEl.remove();
        }
    }

    showSupSubButtons(editor: Editor) {
        this.hideSupSubButtons(); // Remove all existing buttons

        const selection = editor.getSelection();
        if (!selection) return;

        const cursorStart = editor.getCursor('from');
        const cursorEnd = editor.getCursor('to');
        this.selectionStart = { ...cursorStart };
        this.selectionEnd = { ...cursorEnd };

        const currentTag = this.getCurrentTag(selection);

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "supsub-popup";

        if (currentTag === "sup" || currentTag === "sub") {
            // Only show 'Normal (n)' button to remove the tag
            const normalButton = document.createElement("button");
            normalButton.innerText = "Normal (n)"; // You can consider "Clear (n)" or "Plain (n)"
            normalButton.setAttribute("aria-label", "Remove superscript/subscript");
            normalButton.addEventListener("mousedown", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.wrapSelection(currentTag, editor); // This will remove the tag
            });
            buttonContainer.appendChild(normalButton);
        } else {
            // Show both 'Sup (ⁿ)' and 'Sub (ₙ)' buttons
            const supButton = document.createElement("button");
            supButton.innerText = "Sup (ⁿ)"; // Updated label with superscript n
            supButton.setAttribute("aria-label", "Wrap selected text with superscript");
            supButton.addEventListener("mousedown", (e) => { // Changed to mousedown
                e.preventDefault();
                e.stopPropagation();
                this.wrapSelection("sup", editor);
            });

            const subButton = document.createElement("button");
            subButton.innerText = "Sub (ₙ)"; // Updated label with subscript n
            subButton.setAttribute("aria-label", "Wrap selected text with subscript");
            subButton.addEventListener("mousedown", (e) => { // Changed to mousedown
                e.preventDefault();
                e.stopPropagation();
                this.wrapSelection("sub", editor);
            });

            buttonContainer.appendChild(supButton);
            buttonContainer.appendChild(subButton);
        }

        // Append to document.body to avoid CSS constraints
        buttonContainer.style.position = "absolute";
        document.body.appendChild(buttonContainer);

        this.positionPopup(buttonContainer, editor);

        // Make the popup visible by adding the 'visible' class after positioning
        requestAnimationFrame(() => {
            buttonContainer.classList.add("visible");
        });
    }

    hideSupSubButtons() {
        const buttonContainers = document.querySelectorAll(".supsub-popup");
        buttonContainers.forEach((buttonContainer) => {
            // Add transition for fading out
            buttonContainer.classList.remove("visible");
            // Remove the popup after a short delay to allow transition
            setTimeout(() => {
                buttonContainer.remove();
            }, 100); // Match the CSS transition duration (0.1s)
        });
    }

    positionPopup(popup: HTMLElement, editor: Editor) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            const top = rect.bottom + window.scrollY + 5; // 5px offset
            const left = rect.left + (rect.width / 2) - (popup.offsetWidth / 2);

            // Prevent the popup from going outside the viewport's boundaries
            const maxLeft = window.innerWidth - popup.offsetWidth - 10; // 10px padding
            const calculatedLeft = Math.max(10, Math.min(left, maxLeft));

            popup.style.top = `${top}px`;
            popup.style.left = `${calculatedLeft}px`;

            console.log(`Popup positioned at top: ${top}px, left: ${calculatedLeft}px`);
        }
    }

    wrapSelection(tag: string, editor: Editor) {
        this.isWrapping = true; // Indicate that wrapping is in progress

        // Restore the original selection
        if (this.selectionStart && this.selectionEnd) {
            editor.setSelection(this.selectionStart, this.selectionEnd);
        }

        // Focus the editor to ensure it's ready
        editor.focus();

        // Perform wrapping after a short delay to ensure selection is restored
        setTimeout(() => {
            const selection = editor.getSelection();
            console.log(`Wrapping selection: "${selection}" with tag: <${tag}>`);

            if (selection) {
                const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`, "s"); // 's' flag for multiline
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

                // Hide the popup after wrapping
                this.hideSupSubButtons();
            } else {
                // No selection, do not hide the popup
            }

            // Clear the selection by setting both start and end to the new cursor position
            const currentCursor = editor.getCursor();
            editor.setSelection(currentCursor, currentCursor);

            this.isWrapping = false; // Reset the wrapping flag
        }, 50); // Increased delay to 50ms for better reliability
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