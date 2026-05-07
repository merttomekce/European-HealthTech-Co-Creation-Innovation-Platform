const test = require('node:test');
const assert = require('node:assert/strict');

const { DEMO_LOGIN } = require('./demo-login');

test('demo login preset targets the shared demo account', () => {
  assert.equal(DEMO_LOGIN.email, 'demo@healthai.edu');
  assert.equal(DEMO_LOGIN.password, 'demo1234');
  assert.equal(DEMO_LOGIN.role, 'ENGINEER');
});
