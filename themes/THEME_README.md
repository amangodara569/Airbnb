# Awesome Dark Theme

A custom VS Code theme based on your screenshot with cyan, teal, orange, and golden yellow accents.

## Color Palette

- **Background**: `#0d1219` (Deep Blue-Black)
- **Foreground**: `#e0e0e0` (Light Gray)
- **Keywords**: `#00d9ff` (Bright Cyan)
- **Strings**: `#4ec9b0` (Teal)
- **Numbers**: `#ce9178` (Orange)
- **Comments**: `#6a9955` (Muted Green)
- **Functions**: `#ffd700` (Golden Yellow)
- **Accents**: Yellow `#ffd700` for active elements

## Installation

### Option 1: Use Workspace Theme (Recommended)
The theme is already configured in `.vscode/settings.json`. Just reload VS Code and it will be applied automatically.

### Option 2: Install as Global Theme
1. Copy the `themes/awesome-dark.json` file to:
   - **Windows**: `%APPDATA%\Code\User\themes\`
   - **Mac**: `~/Library/Application Support/Code/User/themes/`
   - **Linux**: `~/.config/Code/User/themes/`

2. Restart VS Code

3. Go to Settings > Color Theme and select "Awesome Dark Theme"

### Option 3: Create VS Code Extension
If you want to share this theme or use it across projects:

1. Create a `package.json` entry in a new extension folder:
```json
{
  "name": "awesome-dark-theme",
  "version": "1.0.0",
  "contributes": {
    "themes": [{
      "label": "Awesome Dark Theme",
      "uiTheme": "vs-dark",
      "path": "./themes/awesome-dark.json"
    }]
  }
}
```

2. Install the extension locally using `code --install-extension`

## Features

- ✅ Dark background perfect for long coding sessions
- ✅ High contrast cyan keywords for readability
- ✅ Golden yellow function names and active elements
- ✅ Teal strings for visual distinction
- ✅ Optimized for JavaScript, TypeScript, and web development
- ✅ Terminal colors configured
- ✅ Bracket matching and selection highlighting

## Customization

To modify the theme, edit `themes/awesome-dark.json` and reload VS Code.

Enjoy your new theme! 🎨
