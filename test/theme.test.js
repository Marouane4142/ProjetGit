import assert from 'node:assert/strict';
import test from 'node:test';

import { nextTheme, resolveInitialTheme } from '../js/theme.js';

test('nextTheme alterne entre les thèmes clair et sombre', () => {
  assert.equal(nextTheme('light'), 'dark');
  assert.equal(nextTheme('dark'), 'light');
});

test('resolveInitialTheme respecte le choix enregistré', () => {
  assert.equal(resolveInitialTheme('light', true), 'light');
  assert.equal(resolveInitialTheme('dark', false), 'dark');
});

test('resolveInitialTheme utilise la préférence système par défaut', () => {
  assert.equal(resolveInitialTheme(null, true), 'dark');
  assert.equal(resolveInitialTheme(null, false), 'light');
});
