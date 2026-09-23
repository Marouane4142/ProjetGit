export function createTask(title, id = crypto.randomUUID()) {
  const cleanTitle = title.trim();

  if (!cleanTitle) {
    throw new Error('Le titre de la tâche est obligatoire.');
  }

  return {
    id,
    title: cleanTitle,
    done: false,
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

export function filterTasks(tasks, query) {
  const normalizedQuery = query.trim().toLocaleLowerCase('fr');

  if (!normalizedQuery) return tasks;

  return tasks.filter((task) =>
    task.title.toLocaleLowerCase('fr').includes(normalizedQuery),
  );
}
