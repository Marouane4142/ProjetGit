import {
  createTask,
  filterTasks,
  removeTask,
  taskSummary,
  toggleTask,
} from './tasks.js';
import { loadTasks, saveTasks } from './storage.js';
import { initializeTheme } from './theme.js';

const form = document.querySelector('#task-form');
const input = document.querySelector('#task-title');
const list = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const counter = document.querySelector('#task-counter');
const template = document.querySelector('#task-template');
const themeToggle = document.querySelector('#theme-toggle');
const searchInput = document.querySelector('#task-search');

let tasks = loadTasks();

initializeTheme(themeToggle);

function persistAndRender() {
  saveTasks(tasks);
  render();
}

function render() {
  list.replaceChildren();

  const visibleTasks = filterTasks(tasks, searchInput.value);

  for (const task of visibleTasks) {
    const item = template.content.firstElementChild.cloneNode(true);
    item.dataset.id = task.id;
    item.classList.toggle('is-done', task.done);
    item.querySelector('.task-label').textContent = task.title;
    list.append(item);
  }

  const { total, remaining } = taskSummary(tasks);
  counter.textContent = `${remaining} restante${remaining > 1 ? 's' : ''}`;
  emptyState.textContent = total === 0
    ? 'Aucune tâche pour le moment.'
    : 'Aucune tâche ne correspond à la recherche.';
  emptyState.hidden = visibleTasks.length > 0;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  tasks = [...tasks, createTask(input.value)];
  input.value = '';
  input.focus();
  persistAndRender();
});

list.addEventListener('click', (event) => {
  const item = event.target.closest('.task-item');
  if (!item) return;

  if (event.target.matches('.toggle-task')) {
    tasks = toggleTask(tasks, item.dataset.id);
  }

  if (event.target.matches('.delete-task')) {
    tasks = removeTask(tasks, item.dataset.id);
  }

  persistAndRender();
});

searchInput.addEventListener('input', render);

render();
