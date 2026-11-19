// SafaiOS Secret Scanner
// Scans repository files for high-entropy secrets, cloud tokens, and private keys.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  'yolo26n.pt',
  'test-secret-scan.mjs'
]);

const BINARY_EXTENSIONS = new Set([
  '.pt', '.pth', '.onnx', '.engine', '.png', '.jpg', '.jpeg', '.webp', '.ico',
  '.pdf', '.zip', '.tar', '.gz', '.pyc', '.so', '.dll', '.exe', '.lock'
]);

export const SECRET_PATTERNS = [
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'Private Key Block', regex: /-----BEGIN (?:(?:RSA|EC|DSA|OPENSSH|ENCRYPTED|PGP) )?PRIVATE KEY(?: BLOCK)?-----/ },
  { name: 'GitHub Personal Token', regex: /gh[pous]_[A-Za-z0-9_]{36,255}/ },
  { name: 'Slack Token', regex: /xox[baprs]-[0-9a-zA-Z]{10,48}/ },
  { name: 'Google API Key', regex: /AIzaSy[0-9A-Za-z_-]{33}/ },
  { name: 'Supabase Service Role Key', regex: /(?:SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_KEY)\s*[:=]\s*["']?([A-Za-z0-9_\-\.]{30,})["']?/i },
  { name: 'Supabase Personal Access Token', regex: /sbp_[a-zA-Z0-9]{40}/ },
  { name: 'Hugging Face Token', regex: /hf_[A-Za-z0-9]{34,}/ },
  { name: 'Roboflow Token', regex: /rf_[A-Za-z0-9]{32,}|(?:ROBOFLOW_API_KEY|ROBOFLOW_KEY)\s*[:=]\s*["']?([A-Za-z0-9]{20,})["']?/i },
  { name: 'Database Connection String', regex: /(?:postgres|postgresql):\/\/[^:\s'"]+:([^@\s'"]+)@[^/\s'"]+\/[^\s'"]+/i },
  { name: 'Generic Secret Token', regex: /(?:secret|password|bearer|api[_-]?key)\s*[:=]\s*["']([A-Za-z0-9\-_]{32,})["']/i }
];

export const ALLOWLIST_VALUES = new Set([
  'your-super-secret-service-role-key-here',
  'your-anon-public-key-here',
  'your_supabase_project_url_here',
  'postgres_password_here',
  'password',
  '[password]',
  '<password>',
  'your-password',
  'your_password',
  'postgres',
  '***redacted_uri_password***'
]);

export function isAllowlisted(captured) {
  if (!captured) return false;
  const lower = captured.toLowerCase().trim();
  if (ALLOWLIST_VALUES.has(lower)) return true;
  // Template placeholders: ${VAR}, <placeholder>, [placeholder], ***
  if (/^(\$\{[^}]+\}|<[^>]+>|\[[^\]]+\]|\*{3,})$/.test(lower)) return true;
  return false;
}

export function scanLine(line) {
  const matches = [];
  for (const pattern of SECRET_PATTERNS) {
    const match = pattern.regex.exec(line);
    if (match) {
      const captured = match[1] || match[0];
      if (isAllowlisted(captured)) {
        continue;
      }
      matches.push({ name: pattern.name, match: match[0], captured });
    }
  }
  return matches;
}

export function walk(dir, results = []) {
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

export function scanRepository(rootDir = process.cwd()) {
  let violations = 0;
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
      const matches = scanLine(line);
      for (const match of matches) {
        console.error(`[SECRET SCAN VIOLATION] ${match.name} found in ${path.relative(rootDir, file)}:${i + 1}`);
        violations++;
      }
    }
  }

  return { violations, totalFiles: files.length };
}

// Execute scan when run as CLI script
const currentFile = fileURLToPath(import.meta.url).toLowerCase();
const scriptFile = process.argv[1] ? path.resolve(process.argv[1]).toLowerCase() : '';
const isMainModule = currentFile === scriptFile;

if (isMainModule) {
  const { violations, totalFiles } = scanRepository();
  if (violations > 0) {
    console.error(`\nSecret scan failed: ${violations} potential credentials detected.`);
    process.exit(1);
  } else {
    console.log(`Secret scan passed: Clean repository (${totalFiles} files scanned).`);
    process.exit(0);
  }
}
