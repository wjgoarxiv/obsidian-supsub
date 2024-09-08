"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var obsidian_1 = require("obsidian");
var SupSubPlugin = /** @class */ (function (_super) {
    __extends(SupSubPlugin, _super);
    function SupSubPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SupSubPlugin.prototype.onload = function () {
        var _this = this;
        this.addCommand({
            id: "wrap-sup",
            name: "Wrap with <sup> tags",
            editorCallback: function (editor, view) { return _this.wrapSelection("sup", editor); },
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
            editorCallback: function (editor, view) { return _this.wrapSelection("sub", editor); },
            hotkeys: [
                {
                    modifiers: ["Mod", "Alt"],
                    key: "-",
                },
            ],
        });
    };
    SupSubPlugin.prototype.wrapSelection = function (tag, editor) {
        var selection = editor.getSelection();
        if (selection) {
            // Check if the selection is already wrapped with the tag
            var regex = new RegExp("<".concat(tag, ">(.*?)</").concat(tag, ">"));
            var matches = regex.exec(selection);
            if (matches) {
                // If the selection is already wrapped, unwrap it
                var debracketedSelection = matches[1];
                editor.replaceSelection(debracketedSelection);
            }
            else {
                // If not wrapped, wrap the selection with the tags
                var wrappedSelection = "<".concat(tag, ">").concat(selection, "</").concat(tag, ">");
                editor.replaceSelection(wrappedSelection);
            }
        }
        else {
            // No selection, insert the tags and position cursor in between
            var cursor = editor.getCursor();
            var wrappedTag = "<".concat(tag, "></").concat(tag, ">");
            editor.replaceRange(wrappedTag, cursor);
            // Move the cursor to between the tags
            var newCursorPos = {
                line: cursor.line,
                ch: cursor.ch + tag.length + 2, // position after opening tag
            };
            editor.setCursor(newCursorPos);
        }
    };
    return SupSubPlugin;
}(obsidian_1.Plugin));
exports.default = SupSubPlugin;