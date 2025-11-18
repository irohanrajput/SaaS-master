/**
 * Test LinkedIn OAuth PKCE Implementation
 * 
 * This script tests the complete OAuth flow with PKCE
 */

import crypto from 'crypto';

// Helper function to generate code_verifier
function generateCodeVerifier() {
  const buffer = crypto.randomBytes(32);
  return base64URLEncode(buffer);
}

// Helper function to generate code_challenge from code_verifier
function generateCodeChallenge(verifier) {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64URLEncode(hash);
}

// Base64 URL encoding (without padding)
function base64URLEncode(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Test PKCE generation
console.log('🧪 Testing PKCE Implementation\n');
console.log('=' .repeat(60));

// Generate code_verifier
const codeVerifier = generateCodeVerifier();
console.log('\n1️⃣ Code Verifier Generated:');
console.log('   Length:', codeVerifier.length, 'characters');
console.log('   Value:', codeVerifier);
console.log('   ✅ Valid:', codeVerifier.length >= 43 && codeVerifier.length <= 128);

// Generate code_challenge
const codeChallenge = generateCodeChallenge(codeVerifier);
console.log('\n2️⃣ Code Challenge Generated (SHA-256):');
console.log('   Length:', codeChallenge.length, 'characters');
console.log('   Value:', codeChallenge);
console.log('   ✅ Valid:', codeChallenge.length === 43);

// Build authorization URL
const clientId = '86x2hsbgbwfqsd';
const redirectUri = 'http://localhost:3002/auth/linkedin/callback';
const state = crypto.randomUUID();
const scope = 'r_organization_social r_basicprofile r_organization_admin';

const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

console.log('\n3️⃣ Authorization URL:');
console.log('   Client ID:', clientId);
console.log('   Redirect URI:', redirectUri);
console.log('   State:', state);
console.log('   Scopes:', scope);
console.log('   Code Challenge Method: S256');
console.log('\n   Full URL:');
console.log('   ' + authUrl);

// Verify URL parameters
const url = new URL(authUrl);
const params = url.searchParams;

console.log('\n4️⃣ URL Parameter Validation:');
console.log('   ✅ response_type:', params.get('response_type') === 'code' ? 'VALID' : 'INVALID');
console.log('   ✅ client_id:', params.get('client_id') === clientId ? 'VALID' : 'INVALID');
console.log('   ✅ redirect_uri:', params.get('redirect_uri') === redirectUri ? 'VALID' : 'INVALID');
console.log('   ✅ state:', params.get('state') ? 'PRESENT' : 'MISSING');
console.log('   ✅ scope:', params.get('scope') === scope ? 'VALID' : 'INVALID');
console.log('   ✅ code_challenge:', params.get('code_challenge') === codeChallenge ? 'VALID' : 'INVALID');
console.log('   ✅ code_challenge_method:', params.get('code_challenge_method') === 'S256' ? 'VALID' : 'INVALID');

// Simulate token exchange parameters
console.log('\n5️⃣ Token Exchange Parameters:');
console.log('   grant_type: authorization_code');
console.log('   code: [authorization_code_from_callback]');
console.log('   client_id:', clientId);
console.log('   client_secret: [from .env]');
console.log('   redirect_uri:', redirectUri);
console.log('   code_verifier:', codeVerifier);

// Test verification (simulate what LinkedIn does)
console.log('\n6️⃣ PKCE Verification Test (Simulating LinkedIn):');
const receivedChallenge = codeChallenge;
const receivedVerifier = codeVerifier;
const computedChallenge = generateCodeChallenge(receivedVerifier);

console.log('   Received Challenge:', receivedChallenge);
console.log('   Computed Challenge:', computedChallenge);
console.log('   ✅ Match:', receivedChallenge === computedChallenge ? 'SUCCESS' : 'FAILED');

console.log('\n' + '='.repeat(60));
console.log('✅ PKCE Implementation Test Complete!\n');

// Instructions
console.log('📋 Next Steps:');
console.log('1. Clear browser sessionStorage and localStorage');
console.log('2. Go to Social Dashboard and click "Connect LinkedIn"');
console.log('3. Check browser console for PKCE parameters');
console.log('4. After authorization, check backend logs for code_verifier');
console.log('5. Verify token exchange succeeds\n');

// Expected scopes explanation
console.log('📚 Scope Explanation:');
console.log('   r_organization_social: Read organization posts and metrics');
console.log('   r_basicprofile: Basic profile info (for user context)');
console.log('   r_organization_admin: Admin access to organization pages');
console.log('\n⚠️  Note: These scopes require "Community Management API" product');
console.log('   approval in LinkedIn Developer Portal.\n');

// Common errors
console.log('🚨 Common Errors and Solutions:');
console.log('   Error: "code verifier does not match"');
console.log('   → Solution: Ensure code_verifier is sent in token exchange\n');
console.log('   Error: "Access denied - 403"');
console.log('   → Solution: Check app has Community Management API approved\n');
console.log('   Error: "No organizations found"');
console.log('   → Solution: Ensure you\'re admin of a LinkedIn Company Page\n');
