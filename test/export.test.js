import assert from 'node:assert/strict';
import test from 'node:test';

import { serializeTasks } from '../js/export.js';

test('serializeTasks produit un CSV et échappe les guillemets', () => {
  const tasks = [
    { title: 'Relire "Git"', done: true },
    { title: 'Préparer le merge', done: false },
  ];

  assert.equal(
    serializeTasks(tasks),
    '"titre","terminee"\n"Relire ""Git""","oui"\n"Préparer le merge","non"',
  );
});
