const STORAGE_KEY = 'taskboard.tasks';

export function loadTasks(storage = localStorage) {
  try {
    return JSON.parse(storage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks, storage = localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

