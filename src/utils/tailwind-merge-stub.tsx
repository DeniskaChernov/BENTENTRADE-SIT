// Заглушка для tailwind-merge
export function twMerge(...classLists: string[]): string {
  const classList = classLists.filter(Boolean).join(' ');
  
  // Простая реализация: удаляем дубликаты классов
  const classes = classList.split(' ').filter(Boolean);
  const seen = new Set<string>();
  const result: string[] = [];
  
  // Проходим справа налево, чтобы последние классы имели приоритет
  for (let i = classes.length - 1; i >= 0; i--) {
    const cls = classes[i];
    if (!seen.has(cls)) {
      seen.add(cls);
      result.unshift(cls);
    }
  }
  
  return result.join(' ');
}
