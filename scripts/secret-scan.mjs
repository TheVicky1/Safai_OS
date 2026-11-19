// SafaiOS Secret Scanner
// Scans repository files for high-entropy secrets, cloud tokens, and private keys.

import fs from 'fs';
import path from 'path';

const IGNORED_DIRS = new Set([
  '.git',
  '.venv',
  '.venv_e002',
  'node_modules',
  '__pycache__',
  '.pytest_cache',
  'data',
  'weights',
  'runs',
  'reports'
]);

const IGNORED_FILES = new Set([
  '.env.example',
  'yolo11s.pt',
  'yolo26n.pt'
]);

const BINARY_EXTENSIONS = new Set([
  '.pt', '.pth', '.onnx', '.engine', '.png', '.jpg', '.jpeg', '.webp', '.ico',
  '.pdf', '.zip', '.tar', '.gz', '.pyc', '.so', '.dll', '.exe', '.lock'
]);

const SECRET_PATTERNS = [
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'Private Key Block', regex: /-----BEGIN (?:RSA|EC|OPENSSH|PGP|PRIVATE) KEY-----/ },
  { name: 'GitHub Personal Token', regex: /gh[pous]_[A-Za-z0-9_]{36,255}/ },
  { name: 'Slack Token', regex: /xox[baprs]-[0-9a-zA-Z]{10,48}/ },
  { name: 'Google API Key', regex: /AIzaSy[0-9A-Za-z_-]{33}/ },
  { name: 'Generic Secret Token', regex: /(?:secret|password|bearer|api[_-]?key)\s*[:=]\s*["']([A-Za-z0-9\-_]{32,})["']/i }
];

const ALLOWLIST_VALUES = new Set([
  'your-super-secret-service-role-key-here',
  'your-anon-public-key-here',
  'your_supabase_project_url_here',
  'postgres_password_here'
]);

function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, results);
    } else {
      if (!IGNORED_FILES.has(entry.name) && !BINARY_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

let violations = 0;
const rootDir = process.cwd();
const files = walk(rootDir);

for (const file of files) {
  let content = '';
  try {
    content = fs.readFileSync(file, 'utf-8');
  } catch (err) {
    continue;
  }

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of SECRET_PATTERNS) {
      const match = pattern.regex.exec(line);
      if (match) {
        const captured = match[1] || match[0];
        if (ALLOWLIST_VALUES.has(captured.toLowerCase())) {
          continue;
        }
        console.error(`[SECRET SCAN VIOLATION] ${pattern.name} found in ${path.relative(rootDir, file)}:${i + 1}`);
        violations++;
      }
    }
  }
}

if (violations > 0) {
  console.error(`\nSecret scan failed: ${violations} potential credentials detected.`);
  process.exit(1);
} else {
  console.log(`Secret scan passed: Clean repository (${files.length} files scanned).`);
  process.exit(0);
}
