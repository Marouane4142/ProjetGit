import assert from 'node:assert/strict';
import test from 'node:test';

import { loadTasks, saveTasks } from '../js/storage.js';

function createMemoryStorage(initialValue = null) {
  let value = initialValue;
  return {
    getItem: () => value,
    setItem: (_key, nextValue) => {
      value = nextValue;
    },
    read: () => value,
  };
}

test('saveTasks et loadTasks conservent les tâches', () => {
  const storage = createMemoryStorage();
  const tasks = [{ id: '1', title: 'Tester', done: false }];

  saveTasks(tasks, storage);

  assert.deepEqual(loadTasks(storage), tasks);
});

test('loadTasks renvoie une liste vide si les données sont invalides', () => {
  const storage = createMemoryStorage('{json invalide');
  assert.deepEqual(loadTasks(storage), []);
});
