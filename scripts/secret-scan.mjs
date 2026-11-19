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
  'reports',
  '.temp',
  '.branches'
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
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g },
  { name: 'Private Key Block', regex: /-----BEGIN (?:(?:RSA|EC|DSA|OPENSSH|ENCRYPTED|PGP) )?PRIVATE KEY(?: BLOCK)?-----/g },
  { name: 'GitHub Personal Token', regex: /gh[pous]_[A-Za-z0-9_]{36,255}/g },
  { name: 'Slack Token', regex: /xox[baprs]-[0-9a-zA-Z]{10,48}/g },
  { name: 'Google API Key', regex: /AIzaSy[0-9A-Za-z_-]{33}/g },
  { name: 'Supabase Service Role Key', regex: /(?:SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_KEY)\s*[:=]\s*["']?([A-Za-z0-9_\-\.]{30,})["']?/gi },
  { name: 'Supabase Personal Access Token', regex: /sbp_[a-zA-Z0-9]{40}/g },
  { name: 'Hugging Face Token', regex: /hf_[A-Za-z0-9]{34,}/g },
  { name: 'Roboflow Token', regex: /rf_[A-Za-z0-9]{32,}|(?:ROBOFLOW_API_KEY|ROBOFLOW_KEY)\s*[:=]\s*["']?([A-Za-z0-9]{20,})["']?/gi },
  { name: 'Database Connection String', regex: /(?:postgres|postgresql):\/\/[^:\s'"]+:([^@\s'"]+)@([^/:\s'"]+)(?::\d+)?\/[^\s'"]*/gi },
  { name: 'Generic Secret Token', regex: /(?:secret|password|bearer|api[_-]?key)\s*[:=]\s*["']([A-Za-z0-9\-_]{32,})["']/gi }
];

export const EXPLICIT_PLACEHOLDERS = new Set([
  'your-super-secret-service-role-key-here',
  'your-anon-public-key-here',
  'your_supabase_project_url_here',
  'postgres_password_here',
  '[password]',
  '<password>',
  '***redacted_uri_password***'
]);

export const LOCAL_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '[::1]'
]);

export const DEV_DEFAULT_PASSWORDS = new Set([
  'postgres',
  'password',
  'your-password',
  'your_password'
]);

export function isAllowlisted(captured) {
  if (!captured) return false;
  const lower = captured.toLowerCase().trim();
  if (EXPLICIT_PLACEHOLDERS.has(lower)) return true;
  // Template placeholders: ${VAR}, <placeholder>, [placeholder], ***
  if (/^(\$\{[^}]+\}|<[^>]+>|\[[^\]]+\]|\*{3,})$/.test(lower)) return true;
  return false;
}

export function isDatabaseConnectionAllowed(password, host) {
  const lowerPass = (password || '').toLowerCase().trim();
  const lowerHost = (host || '').toLowerCase().trim();

  // 1. Explicit placeholder or template is allowed anywhere
  if (isAllowlisted(lowerPass)) return true;

  // 2. Development default passwords are only allowed for local targets
  if (DEV_DEFAULT_PASSWORDS.has(lowerPass)) {
    return LOCAL_HOSTS.has(lowerHost);
  }

  return false;
}

export function getLineNumber(content, index) {
  return content.slice(0, index).split('\n').length;
}

export function scanContent(content, filePath = '') {
  const violations = [];
  for (const pattern of SECRET_PATTERNS) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (pattern.name === 'Database Connection String') {
        const password = match[1];
        const host = match[2];
        if (isDatabaseConnectionAllowed(password, host)) {
          continue;
        }
      } else {
        const captured = match[1] || match[0];
        if (isAllowlisted(captured)) {
          continue;
        }
      }

      const lineNumber = getLineNumber(content, match.index);
      violations.push({
        name: pattern.name,
        filePath,
        lineNumber,
        match: match[0],
        captured: match[1] || match[0]
      });
    }
  }
  return violations;
}

export function scanLine(line) {
  return scanContent(line);
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

    const relPath = path.relative(rootDir, file);
    const foundViolations = scanContent(content, relPath);
    for (const v of foundViolations) {
      console.error(`[SECRET SCAN VIOLATION] ${v.name} found in ${v.filePath}:${v.lineNumber}`);
      violations++;
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
