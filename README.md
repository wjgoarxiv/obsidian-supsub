# SupSub

[![Obsidian Plugin](https://img.shields.io/badge/SupSub%20Plugin%20Link-%23483699.svg?style=for-the-badge&logo=obsidian&logoColor=white)](https://obsidian.md/plugins?id=supsub)

<img src="./demomovie.gif" width="65%"> </br>

**SupSub** is an Obsidian plugin that allows you to easily format selected text with `<sup>` and `<sub>` tags, enabling quick superscript and subscript formatting in your notes.

## What's New in Version 1.0.5 (@2025-05-19)

- **Bug Fixes**:
  - **Fixed Text Shifting Issue**: Resolved an issue where superscript and subscript text would shift positions when editing text in rows above.
  - **Fixed Disappearing Text**: Fixed a problem where letters would disappear when typing near superscript or subscript content.
  - **Improved Decoration Handling**: Enhanced the way hidden tags are managed to ensure consistent editing experience.

## What's New in Version 1.0.4 (@2024-12-03)

- **Bug Fixes**:
  - **Resolved Selection Error**: Fixed an issue where enabling the popup buttons and using the **Sup** or **Sub** buttons could cause a `TypeError` related to invalid selection points. The plugin now correctly validates selection ranges to prevent errors.
  
- **Improved Stability**:
  - Enhanced compatibility with the latest Obsidian updates by refining editor integrations and ensuring seamless functionality.

## What's New in Version 1.0.3 (@2024-12-01)

- **Enhanced Button Labels**: Updated the popup buttons to be more user-friendly:
  - **Sup (ⁿ)**: Wraps the selected text with `<sup>` tags.
  - **Sub (ₙ)**: Wraps the selected text with `<sub>` tags.
  - **Normal (n)**: Removes existing `<sup>` or `<sub>` tags from the selected text.
- **Conditional Button Display**: 
  - When the selected text is already wrapped in `<sup>` or `<sub>`, only the **Normal (n)** button is displayed to allow easy removal of the tags.
  - When the selected text is not wrapped, both **Sup (ⁿ)** and **Sub (ₙ)** buttons are available for formatting.

## Usage

- **Superscript**: 
  - **Hotkey**: `Option + Command + '='` on macOS or `Ctrl + Alt + '='` on Windows.
  - **Action**: Wraps the selected text with `<sup>` tags. If no text is selected, the cursor will be placed between the `<sup></sup>` tags.
  - **Button**: **Sup (ⁿ)**
  
- **Subscript**: 
  - **Hotkey**: `Option + Command + '-'` on macOS or `Ctrl + Alt + '-'` on Windows.
  - **Action**: Wraps the selected text with `<sub>` tags. If no text is selected, the cursor will be placed between the `<sub></sub>` tags.
  - **Button**: **Sub (ₙ)**
  
- **Remove Formatting**: 
  - **Action**: Removes existing `<sup>` or `<sub>` tags from the selected text.
  - **Button**: **Normal (n)**
  
- **Toggling**: 
  - If the selected text is already wrapped in `<sup>` or `<sub>`, using the respective button or hotkey will remove the tags.

## Example Workflow

1. **Add Superscript/Subscript**:
   - Select the text you want to format.
   - Click the **Sup (ⁿ)** or **Sub (ₙ)** button in the popup, or use the designated hotkeys.
   - The selected text will be wrapped with the corresponding tags, and the popup will disappear.

2. **Remove Superscript/Subscript**:
   - Select the text that is already formatted with `<sup>` or `<sub>` tags.
   - Click the **Normal (n)** button in the popup.
   - The tags will be removed, the text will be reverted to normal formatting, and the popup will disappear.

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, please open a new issue or submit a pull request in the [GitHub repository](https://github.com/wjgoarxiv/obsidian-supsub).

## License

This plugin is licensed under the [MIT License](https://github.com/wjgoarxiv/obsidian-supsub/blob/master/LICENSE).