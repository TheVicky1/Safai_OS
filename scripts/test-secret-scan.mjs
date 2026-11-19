// SafaiOS Secret Scanner Test Suite
// Verifies detection of credential families and acceptance of documented placeholders.

import assert from 'assert';
import { scanLine, isAllowlisted } from './secret-scan.mjs';

console.log('Running SafaiOS Secret Scanner unit & fixture tests...');

// 1. Verify Rejection of Unallowlisted Credentials
const REJECTION_FIXTURES = [
  {
    name: 'AWS Access Key',
    line: 'AWS_ACCESS_KEY_ID=' + 'AKIA' + '1234567890ABCDEF',
    expectedCategory: 'AWS Access Key'
  },
  {
    name: 'OpenSSH Private Key Header',
    line: '-----BEGIN OPENSSH PRIVATE KEY-----',
    expectedCategory: 'Private Key Block'
  },
  {
    name: 'RSA Private Key Header',
    line: '-----BEGIN RSA PRIVATE KEY-----',
    expectedCategory: 'Private Key Block'
  },
  {
    name: 'EC Private Key Header',
    line: '-----BEGIN EC PRIVATE KEY-----',
    expectedCategory: 'Private Key Block'
  },
  {
    name: 'Generic Private Key Header',
    line: '-----BEGIN PRIVATE KEY-----',
    expectedCategory: 'Private Key Block'
  },
  {
    name: 'PGP Private Key Block',
    line: '-----BEGIN PGP PRIVATE KEY BLOCK-----',
    expectedCategory: 'Private Key Block'
  },
  {
    name: 'GitHub Personal Token',
    line: 'GH_TOKEN=' + 'ghp_' + 'abcdefghijklmnopqrstuvwxyz0123456789',
    expectedCategory: 'GitHub Personal Token'
  },
  {
    name: 'Slack Token',
    line: 'SLACK_TOKEN=' + 'xoxb-' + '1234567890-abcdefghij',
    expectedCategory: 'Slack Token'
  },
  {
    name: 'Google API Key',
    line: 'GOOGLE_KEY=' + 'AIzaSy' + '0123456789abcdefghijklmnopqrstuvw',
    expectedCategory: 'Google API Key'
  },
  {
    name: 'Supabase Service Role Key Assignment',
    line: 'SUPABASE_SERVICE_ROLE_KEY="' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.xyz123' + '"',
    expectedCategory: 'Supabase Service Role Key'
  },
  {
    name: 'Supabase Personal Access Token',
    line: 'TOKEN=' + 'sbp_' + '0123456789abcdef0123456789abcdef01234567',
    expectedCategory: 'Supabase Personal Access Token'
  },
  {
    name: 'Hugging Face Token',
    line: 'HF_TOKEN=' + 'hf_' + '0123456789abcdefghijklmnopqrstuvwxyza',
    expectedCategory: 'Hugging Face Token'
  },
  {
    name: 'Roboflow Token',
    line: 'ROBOFLOW_KEY=' + 'rf_' + '0123456789abcdef0123456789abcdef',
    expectedCategory: 'Roboflow Token'
  },
  {
    name: 'Plaintext Database URL with password',
    line: 'DATABASE_URL="postgresql://postgres:production_live_secret_pass_123@db.prod.internal:5432/safai"',
    expectedCategory: 'Database Connection String'
  }
];

let rejectedCount = 0;
for (const fixture of REJECTION_FIXTURES) {
  const matches = scanLine(fixture.line);
  assert.ok(
    matches.length > 0,
    `Failed to reject credential fixture: ${fixture.name} (line: ${fixture.line})`
  );
  assert.strictEqual(
    matches[0].name,
    fixture.expectedCategory,
    `Unexpected category for ${fixture.name}: got ${matches[0].name}, expected ${fixture.expectedCategory}`
  );
  rejectedCount++;
}
console.log(`[PASS] Verified ${rejectedCount}/${REJECTION_FIXTURES.length} credential rejections.`);

// 2. Verify Acceptance of Documented Placeholders
const ACCEPTANCE_FIXTURES = [
  {
    name: 'Supabase Service Role Placeholder',
    line: 'SUPABASE_SERVICE_ROLE_KEY="your-super-secret-service-role-key-here"'
  },
  {
    name: 'Supabase Anon Public Key Placeholder',
    line: 'SUPABASE_ANON_KEY="your-anon-public-key-here"'
  },
  {
    name: 'Supabase Project URL Placeholder',
    line: 'SUPABASE_URL="your_supabase_project_url_here"'
  },
  {
    name: 'Database URL with postgres_password_here',
    line: 'DATABASE_URL="postgresql://postgres:postgres_password_here@localhost:54322/postgres"'
  },
  {
    name: 'Database URL with template variable',
    line: 'DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@localhost:54322/postgres"'
  },
  {
    name: 'Database URL with bracket placeholder',
    line: 'DATABASE_URL="postgresql://postgres:[password]@localhost:54322/postgres"'
  },
  {
    name: 'Database URL with angle bracket placeholder',
    line: 'DATABASE_URL="postgresql://postgres:<password>@localhost:54322/postgres"'
  },
  {
    name: 'Database URL with local dev default postgres user/pass',
    line: 'DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"'
  }
];

let acceptedCount = 0;
for (const fixture of ACCEPTANCE_FIXTURES) {
  const matches = scanLine(fixture.line);
  assert.strictEqual(
    matches.length,
    0,
    `Fixture should be accepted but was flagged: ${fixture.name} (line: ${fixture.line})`
  );
  acceptedCount++;
}
console.log(`[PASS] Verified ${acceptedCount}/${ACCEPTANCE_FIXTURES.length} documented placeholder acceptances.`);

console.log('\nAll secret scanner fixture tests passed successfully!');
