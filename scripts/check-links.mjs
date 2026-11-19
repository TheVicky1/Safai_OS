// SafaiOS Markdown Link Validator
// Validates relative file links, anchors, and wiki references across repository documentation.

import fs from 'fs';
import path from 'path';

const DOC_PATHS = [
  'README.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'SECURITY.md',
  'SUPPORT.md'
];

const SCAN_DIRS = ['wiki', 'docs'];

function collectMarkdownFiles() {
  const mdFiles = [];
  for (const doc of DOC_PATHS) {
    if (fs.existsSync(doc)) {
      mdFiles.push(path.resolve(doc));
    }
  }

  for (const dir of SCAN_DIRS) {
    if (!fs.existsSync(dir)) continue;
    function walk(current) {
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          mdFiles.push(path.resolve(full));
        }
      }
    }
    walk(dir);
  }
  return mdFiles;
}

const files = collectMarkdownFiles();
let brokenCount = 0;

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileDir = path.dirname(filePath);
  const isWikiFile = filePath.includes(path.sep + 'wiki' + path.sep) || filePath.endsWith(path.sep + 'wiki');

  // Match [text](target) excluding images ![text](target)
  const linkRegex = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
