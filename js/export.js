export function serializeTasks(tasks) {
  const escapeCell = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = tasks.map((task) => [task.title, task.done ? 'oui' : 'non']);

  return [
    ['titre', 'terminee'],
    ...rows,
  ].map((row) => row.map(escapeCell).join(',')).join('\n');
}

export function downloadTasks(tasks) {
  const blob = new Blob([serializeTasks(tasks)], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'taskboard.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}
