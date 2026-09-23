import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createTask,
  filterTasks,
  removeTask,
  taskSummary,
  toggleTask,
} from '../js/tasks.js';

test('createTask nettoie le titre', () => {
  assert.deepEqual(createTask('  Lire la documentation  ', 'task-1'), {
    id: 'task-1',
    title: 'Lire la documentation',
    done: false,
  });
});

test('createTask refuse un titre vide', () => {
  assert.throws(() => createTask('   ', 'task-1'));
});

test('toggleTask inverse uniquement la tâche ciblée', () => {
  const tasks = [
    { id: '1', title: 'Une', done: false },
    { id: '2', title: 'Deux', done: false },
  ];

  assert.deepEqual(toggleTask(tasks, '2'), [
    tasks[0],
    { id: '2', title: 'Deux', done: true },
  ]);
});

test('removeTask supprime uniquement la tâche ciblée', () => {
  const tasks = [
    { id: '1', title: 'Une', done: false },
    { id: '2', title: 'Deux', done: true },
  ];

  assert.deepEqual(removeTask(tasks, '1'), [tasks[1]]);
});

test('taskSummary calcule les tâches restantes', () => {
  const tasks = [
    { id: '1', done: false },
    { id: '2', done: true },
    { id: '3', done: false },
  ];

  assert.deepEqual(taskSummary(tasks), {
    total: 3,
    completed: 1,
    remaining: 2,
  });
});

test('filterTasks cherche sans tenir compte de la casse', () => {
  const tasks = [
    { id: '1', title: 'Préparer le cours', done: false },
    { id: '2', title: 'Relire le README', done: false },
  ];

  assert.deepEqual(filterTasks(tasks, 'COURS'), [tasks[0]]);
  assert.equal(filterTasks(tasks, ''), tasks);
});
