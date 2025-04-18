# outtree

🗂️ Generate a project structure tree in multiple formats (`txt`, `markdown`, `html`, `json`), with interactive prompts for configuration.

## 📦 Installation

```bash
npm install -g .
```

## 🚀 Usage

```bash
outtree [path]
```

Examples:

```bash
outtree            # Prompts for format and ignore list, scans current directory
outtree ./src      # Prompts for format and ignore list, scans ./src
```

You'll be interactively asked:

1. **Output format** – choose from `html`, `json`, `markdown`, `text`, or `all`
2. **Ignore list** – comma-separated list of folders/files to skip (`node_modules`, `.git`, etc.)

## 📂 Output

All output files will be saved to a folder called `outtree/`:

- `tree.txt` – ASCII tree
- `tree.md` – Markdown tree
- `tree.html` – HTML list
- `tree.json` – JSON format

## 🔧 Configuration

- `3` The maximum depth for directory scanning is configurable. The default maximum depth is  When running the command, you'll be prompted to enter the maximum depth, or type `all` for unlimited depth.
- Default ignored directories are: `node_modules`, `.git`, `dist`, `build`. You can override them at runtime via prompt.

---

Feel free to fork and enhance! PRs welcome 🤝


[![npm version](https://img.shields.io/npm/v/outtree)](https://www.npmjs.com/package/outtree)