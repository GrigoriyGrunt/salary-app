const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, "docs", "project-structure.md");

const IGNORE = new Set([
  ".git",
  ".next",
  "node_modules",
  ".vercel",
  "dist",
  "build",
  ".idea",
  ".vscode"
]);

function tree(dir, prefix = "") {
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(e => !IGNORE.has(e.name))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  let result = "";

  entries.forEach((entry, index) => {
    const last = index === entries.length - 1;
    const branch = last ? "└── " : "├── ";

    result += `${prefix}${branch}${entry.name}\n`;

    if (entry.isDirectory()) {
      result += tree(
        path.join(dir, entry.name),
        prefix + (last ? "    " : "│   ")
      );
    }
  });

  return result;
}

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

const content =
`# Структура проекта

\`\`\`
${path.basename(ROOT)}
${tree(ROOT)}
\`\`\`
`;

fs.writeFileSync(OUTPUT, content);

console.log("✅ project-structure.md обновлен");