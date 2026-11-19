// SafaiOS Secret Scanner Test Suite
// Verifies detection of credential families, multiline handling, and host-aware placeholder rules.

import assert from 'assert';
import { scanContent, scanLine, isAllowlisted } from './secret-scan.mjs';

console.log('Running SafaiOS Secret Scanner unit & fixture tests...');

// 1. Verify Rejection of Unallowlisted Credentials
const REJECTION_FIXTURES = [
  {
    name: 'AWS Access Key',
    input: 'AWS_ACCESS_KEY_ID=' + 'AKIA' + '1234567890ABCDEF',
    expectedCategory: 'AWS Access Key'
  },
  {
    name: 'OpenSSH Private Key Header',
    input: '-----BEGIN OPENSSH PRIVATE KEY-----',
    expectedCategory: 'Private Key Block'
  },
  {
    name: 'RSA Private Key Header',
    input: '-----BEGIN RSA PRIVATE KEY-----',
    expectedCategory: 'Private Key Block'
  },
  {
    name: 'EC Private Key Header',
    input: '-----BEGIN EC PRIVATE KEY-----',
    expectedCategory: 'Private Key Block'
  },
  {
    name: 'Generic Private Key Header',
    input: '-----BEGIN PRIVATE KEY-----',
    expectedCategory: 'Private Key Block'
  },
  {
    name: 'PGP Private Key Block',
    input: '-----BEGIN PGP PRIVATE KEY BLOCK-----',
    expectedCategory: 'Private Key Block'
  },
  {
    name: 'GitHub Personal Token',
    input: 'GH_TOKEN=' + 'ghp_' + 'abcdefghijklmnopqrstuvwxyz0123456789',
    expectedCategory: 'GitHub Personal Token'
  },
  {
    name: 'Slack Token',
    input: 'SLACK_TOKEN=' + 'xoxb-' + '1234567890-abcdefghij',
    expectedCategory: 'Slack Token'
  },
  {
    name: 'Google API Key',
    input: 'GOOGLE_KEY=' + 'AIzaSy' + '0123456789abcdefghijklmnopqrstuvw',
    expectedCategory: 'Google API Key'
  },
  {
    name: 'Supabase Service Role Key Assignment',
    input: 'SUPABASE_SERVICE_ROLE_KEY="' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.xyz123' + '"',
    expectedCategory: 'Supabase Service Role Key'
  },
  {
    name: 'Supabase Personal Access Token',
    input: 'TOKEN=' + 'sbp_' + '0123456789abcdef0123456789abcdef01234567',
    expectedCategory: 'Supabase Personal Access Token'
  },
  {
    name: 'Hugging Face Token',
    input: 'HF_TOKEN=' + 'hf_' + '0123456789abcdefghijklmnopqrstuvwxyza',
    expectedCategory: 'Hugging Face Token'
  },
  {
    name: 'Roboflow Token',
    input: 'ROBOFLOW_KEY=' + 'rf_' + '0123456789abcdef0123456789abcdef',
    expectedCategory: 'Roboflow Token'
  },
  {
    name: 'Plaintext Database URL with password',
    input: 'DATABASE_URL="postgresql://postgres:production_live_secret_pass_123@db.prod.internal:5432/safai"',
    expectedCategory: 'Database Connection String'
  },
  {
    name: 'Remote Database URL using development default password',
    input: 'DATABASE_URL="postgresql://app:postgres@db.example.org/app"',
    expectedCategory: 'Database Connection String'
  },
  {
    name: 'Multiline YAML assignment of Service Role Key',
    input: 'SUPABASE_SERVICE_ROLE_KEY:\n  "' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.xyz123' + '"',
    expectedCategory: 'Supabase Service Role Key'
  },
  {
    name: 'Multiple occurrences with allowed localhost followed by remote credential',
    input: 'LOCAL="postgresql://postgres:postgres@localhost:54322/postgres" REMOTE="postgresql://app:live_secret_key@db.remote.com/prod"',
    expectedCategory: 'Database Connection String'
  }
];

let rejectedCount = 0;
for (const fixture of REJECTION_FIXTURES) {
  const matches = scanContent(fixture.input, 'test-fixture');
  assert.ok(
    matches.length > 0,
    `Failed to reject credential fixture: ${fixture.name} (input: ${fixture.input})`
  );
  const foundExpected = matches.some(m => m.name === fixture.expectedCategory);
  assert.ok(
    foundExpected,
    `Expected category ${fixture.expectedCategory} not found in matches for ${fixture.name}: got ${matches.map(m => m.name).join(', ')}`
  );
  rejectedCount++;
}
console.log(`[PASS] Verified ${rejectedCount}/${REJECTION_FIXTURES.length} credential rejections.`);

// 2. Verify Acceptance of Documented Placeholders
const ACCEPTANCE_FIXTURES = [
  {
    name: 'Supabase Service Role Placeholder',
    input: 'SUPABASE_SERVICE_ROLE_KEY="your-super-secret-service-role-key-here"'
  },
  {
    name: 'Supabase Anon Public Key Placeholder',
    input: 'SUPABASE_ANON_KEY="your-anon-public-key-here"'
  },
  {
    name: 'Supabase Project URL Placeholder',
    input: 'SUPABASE_URL="your_supabase_project_url_here"'
  },
  {
    name: 'Database URL with postgres_password_here',
    input: 'DATABASE_URL="postgresql://postgres:postgres_password_here@localhost:54322/postgres"'
  },
  {
    name: 'Database URL with template variable',
    input: 'DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@localhost:54322/postgres"'
  },
  {
    name: 'Database URL with bracket placeholder',
    input: 'DATABASE_URL="postgresql://postgres:[password]@localhost:54322/postgres"'
  },
  {
    name: 'Database URL with angle bracket placeholder',
    input: 'DATABASE_URL="postgresql://postgres:<password>@localhost:54322/postgres"'
  },
  {
    name: 'Database URL with local dev default postgres user/pass on localhost',
    input: 'DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"'
  },
  {
    name: 'Database URL with local dev default postgres user/pass on 127.0.0.1',
    input: 'DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"'
  }
];

let acceptedCount = 0;
for (const fixture of ACCEPTANCE_FIXTURES) {
  const matches = scanContent(fixture.input, 'test-fixture');
  assert.strictEqual(
    matches.length,
    0,
    `Fixture should be accepted but was flagged: ${fixture.name} (input: ${fixture.input})`
  );
  acceptedCount++;
}
console.log(`[PASS] Verified ${acceptedCount}/${ACCEPTANCE_FIXTURES.length} documented placeholder acceptances.`);

console.log('\nAll secret scanner fixture tests passed successfully!');
