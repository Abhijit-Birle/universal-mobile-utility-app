// ─── Task domains ─────────────────────────────────────────────────────────────
// Single source of truth for task domain enum values → color/icon/label.

export const TASK_DOMAINS = {
  study: {
    label: 'Study',
    color: '#5F7A5C',
    icon: 'school',
  },
  work: {
    label: 'Work / AI',
    color: '#6B5CA5',
    icon: 'briefcase',
  },
  money: {
    label: 'Money',
    color: '#A6763F',
    icon: 'coin',
  },
  relocation: {
    label: 'Relocation',
    color: '#7A8471',
    icon: 'home-move',
  },
  personal: {
    label: 'Personal',
    color: '#9498A4',
    icon: 'user',
  },
  shopping: {
    label: 'Shopping',
    color: '#8A7A9C',
    icon: 'shopping-cart',
  },
};

export const VALID_TASK_DOMAINS = Object.keys(TASK_DOMAINS);

// ─── Priority ─────────────────────────────────────────────────────────────────
export const TASK_PRIORITIES = {
  high: { label: 'High', color: '#A6577A', order: 0 },
  medium: { label: 'Medium', color: '#A6763F', order: 1 },
  low: { label: 'Low', color: '#6B7280', order: 2 },
};

export const VALID_TASK_PRIORITIES = Object.keys(TASK_PRIORITIES);
