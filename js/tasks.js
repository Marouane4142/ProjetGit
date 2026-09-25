const PRIORITY_ORDER = { high: 0, normal: 1, low: 2 };

export function createTask(title, id = crypto.randomUUID(), priority = 'normal') {
  const cleanTitle = title.trim();

  if (!cleanTitle) {
    throw new Error('Le titre de la tâche est obligatoire.');
  }

  return {
    id,
    title: cleanTitle,
    done: false,
    priority,
  };
}

export function toggleTask(tasks, id) {
  return tasks.map((task) =>
    task.id === id ? { ...task, done: !task.done } : task,
  );
}

export function removeTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}

export function taskSummary(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.done).length;
  return { total, completed, remaining: total - completed };
}

export function sortTasksByPriority(tasks) {
  return [...tasks].sort(
    (first, second) =>
      (PRIORITY_ORDER[first.priority] ?? PRIORITY_ORDER.normal)
      - (PRIORITY_ORDER[second.priority] ?? PRIORITY_ORDER.normal),
  );
}

