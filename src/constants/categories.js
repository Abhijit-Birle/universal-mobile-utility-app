// ─── Expense categories ───────────────────────────────────────────────────────
// Single source of truth. Never use free-text strings inline — always import
// from here so category-based views never silently break.

export const EXPENSE_CATEGORIES = {
  food: {
    label: 'Food',
    color: '#C97B4A',
    icon: 'fork',
  },
  transport: {
    label: 'Transport',
    color: '#4F86A6',
    icon: 'bus',
  },
  bills: {
    label: 'Bills',
    color: '#A6763F',
    icon: 'file-invoice',
  },
  learning: {
    label: 'Learning',
    color: '#5F7A5C',
    icon: 'book',
  },
  shopping: {
    label: 'Shopping',
    color: '#9498A4',
    icon: 'shopping-bag',
  },
  travel: {
    label: 'Travel',
    color: '#4F86A6',
    icon: 'plane',
  },
  health: {
    label: 'Health',
    color: '#A6577A',
    icon: 'heart',
  },
  relocation: {
    label: 'Relocation',
    color: '#7A8471',
    icon: 'home-move',
  },
  other: {
    label: 'Other',
    color: '#6B7280',
    icon: 'dots-circle-horizontal',
  },
};

// Ordered for the 3×3 grid display
export const CATEGORY_GRID_ORDER = [
  'food',
  'transport',
  'bills',
  'learning',
  'shopping',
  'travel',
  'health',
  'relocation',
  'other',
];

// Valid enum values (for validation)
export const VALID_EXPENSE_CATEGORIES = Object.keys(EXPENSE_CATEGORIES);
