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
    const rawTarget = match[2].trim();

    // Skip web URLs and mailto
    if (
      rawTarget.startsWith('http://') ||
      rawTarget.startsWith('https://') ||
      rawTarget.startsWith('mailto:') ||
      rawTarget.startsWith('ftp://')
    ) {
      continue;
    }

    // Skip standalone hash anchors
    if (rawTarget.startsWith('#')) {
      continue;
    }

    const [targetPath] = rawTarget.split('#');
    if (!targetPath) continue;

    // Direct path relative to current markdown file
    const resolvedPath = path.resolve(fileDir, targetPath);

    // If inside wiki, also check target as a wiki page name (e.g. "Home" -> "wiki/Home.md")
    let exists = fs.existsSync(resolvedPath);
    if (!exists && isWikiFile) {
      const wikiSibling = path.resolve(fileDir, `${targetPath}.md`);
      if (fs.existsSync(wikiSibling)) {
        exists = true;
      }
    }

    // Also check relative to workspace root
    if (!exists) {
      const rootRelative = path.resolve(process.cwd(), targetPath);
      if (fs.existsSync(rootRelative)) {
        exists = true;
      }
    }

    if (!exists) {
      console.error(`[BROKEN LINK] in ${path.relative(process.cwd(), filePath)}: target "${rawTarget}" not found.`);
      brokenCount++;
    }
  }
}

if (brokenCount > 0) {
  console.error(`\nLink verification failed: ${brokenCount} broken link(s) found.`);
  process.exit(1);
} else {
  console.log(`Link verification passed: All markdown references valid (${files.length} documents audited).`);
  process.exit(0);
}

