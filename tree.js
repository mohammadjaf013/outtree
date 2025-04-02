const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DEFAULT_IGNORE = ['node_modules', '.git', 'dist', 'build'];
const root = process.argv[2] || '.';
const OUT_DIR = path.resolve(process.cwd(), 'outtree');

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer));
    });
}

async function main() {
    let format = await prompt("Enter output format (html, json, markdown, text, all): ");
    format = format.trim().toLowerCase();
    const validFormats = ['html', 'json', 'markdown', 'text', 'all'];
    if (!validFormats.includes(format)) {
        console.log("Invalid format. Using 'all' as default.");
        format = 'all';
    }

    // Prompt for maximum depth
    let depthInput = await prompt("Enter maximum depth (or 'all' for unlimited): ");
    let maxDepth;
    if (depthInput.trim().toLowerCase() === 'all') {
        maxDepth = Infinity;
    } else {
        maxDepth = parseInt(depthInput.trim(), 10);
        if (isNaN(maxDepth)) {
            console.log("Invalid depth input. Using default depth of 3.");
            maxDepth = 3;
        }
    }

    // Prompt for ignore list
    let ignoreInput = await prompt(
        "Enter comma separated list of directories/files to ignore (default: node_modules, .git, dist, build): "
    );
    let IGNORE;
    if (ignoreInput.trim() === "") {
        IGNORE = DEFAULT_IGNORE;
    } else {
        IGNORE = ignoreInput.split(",").map((s) => s.trim());
    }

    generateOutput(format, IGNORE, maxDepth);
    rl.close();
}

function generateOutput(format, IGNORE, maxDepth) {
    if (format === 'all') {
        generateJSONOutput(IGNORE, maxDepth);
        generateHTMLOutput(IGNORE, maxDepth);
        generateMarkdownOutput(IGNORE, maxDepth);
        generateTextOutput(IGNORE, maxDepth);
    } else if (format === 'json') {
        generateJSONOutput(IGNORE, maxDepth);
    } else if (format === 'html') {
        generateHTMLOutput(IGNORE, maxDepth);
    } else if (format === 'markdown') {
        generateMarkdownOutput(IGNORE, maxDepth);
    } else {
        generateTextOutput(IGNORE, maxDepth);
    }
}

function generateJSONOutput(IGNORE, maxDepth) {
    const output = generateJSON(root, 0, maxDepth, IGNORE);
    fs.writeFileSync(path.join(OUT_DIR, 'tree.json'), JSON.stringify(output, null, 2));
    console.log(`✅ json output written to ${OUT_DIR}/tree.json`);
}

function generateHTMLOutput(IGNORE, maxDepth) {
    const output = generateHTML(root, 0, maxDepth, IGNORE);
    fs.writeFileSync(path.join(OUT_DIR, 'tree.html'), output);
    console.log(`✅ html output written to ${OUT_DIR}/tree.html`);
}

function generateMarkdownOutput(IGNORE, maxDepth) {
    const output = generateMarkdown(root, 0, maxDepth, IGNORE);
    fs.writeFileSync(path.join(OUT_DIR, 'tree.md'), output);
    console.log(`✅ markdown output written to ${OUT_DIR}/tree.md`);
}

function generateTextOutput(IGNORE, maxDepth) {
    const output = generateText(root, 0, maxDepth, IGNORE);
    fs.writeFileSync(path.join(OUT_DIR, 'tree.txt'), output);
    console.log(`✅ text output written to ${OUT_DIR}/tree.txt`);
}

// JSON generator function
function generateJSON(dir, depth, maxDepth, IGNORE) {
    if (depth > maxDepth) return [];
    let items;
    try {
        items = fs.readdirSync(dir).filter((item) => !IGNORE.includes(item));
    } catch (err) {
        return [];
    }
    return items.map((item) => {
        const fullPath = path.join(dir, item);
        let stats;
        try {
            stats = fs.statSync(fullPath);
        } catch (err) {
            return { name: item };
        }
        const node = { name: item };
        if (stats.isDirectory()) {
            node.children = generateJSON(fullPath, depth + 1, maxDepth, IGNORE);
        }
        return node;
    });
}

// HTML generator function (fixed nested structure)
function generateHTML(dir, depth, maxDepth, IGNORE) {
    if (depth > maxDepth) return "";
    let items;
    try {
        items = fs.readdirSync(dir).filter((item) => !IGNORE.includes(item));
    } catch (err) {
        return "";
    }
    let html = "<ul>\n";
    items.forEach((item) => {
        const fullPath = path.join(dir, item);
        let stats;
        try {
            stats = fs.statSync(fullPath);
        } catch (err) {
            stats = null;
        }
        if (stats && stats.isDirectory()) {
            html += `<li>${item}\n`;
            html += generateHTML(fullPath, depth + 1, maxDepth, IGNORE);
            html += `</li>\n`;
        } else {
            html += `<li>${item}</li>\n`;
        }
    });
    html += "</ul>\n";
    return html;
}

// Markdown generator function
function generateMarkdown(dir, depth, maxDepth, IGNORE) {
    if (depth > maxDepth) return "";
    let items;
    try {
        items = fs.readdirSync(dir).filter((item) => !IGNORE.includes(item));
    } catch (err) {
        return "";
    }
    let md = "";
    items.forEach((item) => {
        const fullPath = path.join(dir, item);
        let stats;
        try {
            stats = fs.statSync(fullPath);
        } catch (err) {
            stats = null;
        }
        md += `${"  ".repeat(depth)}- ${item}\n`;
        if (stats && stats.isDirectory()) {
            md += generateMarkdown(fullPath, depth + 1, maxDepth, IGNORE);
        }
    });
    return md;
}

// Text generator function
function generateText(dir, depth, maxDepth, IGNORE) {
    if (depth > maxDepth) return "";
    let items;
    try {
        items = fs.readdirSync(dir).filter((item) => !IGNORE.includes(item));
    } catch (err) {
        return "";
    }
    let text = "";
    items.forEach((item, index) => {
        const fullPath = path.join(dir, item);
        let stats;
        try {
            stats = fs.statSync(fullPath);
        } catch (err) {
            stats = null;
        }
        const isLast = index === items.length - 1;
        const connector = isLast ? "└── " : "├── ";
        text += `${"  ".repeat(depth)}${connector}${item}\n`;
        if (stats && stats.isDirectory()) {
            text += generateText(fullPath, depth + 1, maxDepth, IGNORE);
        }
    });
    return text;
}

main();
