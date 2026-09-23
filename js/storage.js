const STORAGE_KEY = 'taskboard.tasks';

export function loadTasks(storage = localStorage) {
  try {
    const payload = JSON.parse(storage.getItem(STORAGE_KEY));

    if (Array.isArray(payload)) return payload;
    return payload?.tasks ?? [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks, storage = localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, tasks }));
}
