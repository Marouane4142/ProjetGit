import assert from 'node:assert/strict';
import test from 'node:test';

import { nextTheme } from '../js/theme.js';

test('nextTheme alterne entre les thèmes clair et sombre', () => {
  assert.equal(nextTheme('light'), 'dark');
  assert.equal(nextTheme('dark'), 'light');
});
