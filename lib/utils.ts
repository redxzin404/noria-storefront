export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function parseJsonArray<T = unknown>(value: string | string[] | null | undefined): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}

export function parseJsonObject<T extends Record<string, unknown>>(value: string | null | undefined): T {
  if (!value) return {} as T;

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed as T : {} as T;
  } catch {
    return {} as T;
  }
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value / 100);
}

export function getRangeFromSearchParams(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}
