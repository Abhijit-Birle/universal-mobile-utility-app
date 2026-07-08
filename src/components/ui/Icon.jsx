import React from 'react';
import * as Lucide from 'lucide-react';

const iconMap = {
  plus: Lucide.Plus,
  check: Lucide.Check,
  x: Lucide.X,
  chevronRight: Lucide.ChevronRight,
  chevronDown: Lucide.ChevronDown,
  chevronLeft: Lucide.ChevronLeft,
  arrowLeft: Lucide.ArrowLeft,
  gear: Lucide.Settings,
  upload: Lucide.Upload,
  download: Lucide.Download,
  share: Lucide.Share2,
  link: Lucide.Link,
  trash: Lucide.Trash2,
  edit: Lucide.Edit2,
  undo: Lucide.Undo,
  home: Lucide.Home,
  list: Lucide.List,
  chart: Lucide.BarChart3,
  calendar: Lucide.Calendar,
  clock: Lucide.Clock,
  flame: Lucide.Flame,
  repeat: Lucide.Repeat,
  dots: Lucide.MoreHorizontal,
  'dots-circle-horizontal': Lucide.MoreHorizontal,
  fork: Lucide.Utensils,
  bus: Lucide.Bus,
  'file-invoice': Lucide.FileText,
  book: Lucide.Book,
  'shopping-bag': Lucide.ShoppingBag,
  plane: Lucide.Plane,
  heart: Lucide.Heart,
  'home-move': Lucide.Home,
  coin: Lucide.Coins,
  school: Lucide.School,
  briefcase: Lucide.Briefcase,
  code: Lucide.Code,
  monitor: Lucide.Monitor,
  play: Lucide.Play,
  pause: Lucide.Pause,
  stop: Lucide.Square,
  moon: Lucide.Moon,
  sun: Lucide.Sun,
  bell: Lucide.Bell,
  'trash-2': Lucide.Trash2,
  'git-commit': Lucide.GitCommit,
  'file-text': Lucide.FileText,
  star: Lucide.Star,
  'star-fill': Lucide.Star,
  'list-plus': Lucide.ListPlus,
  'sliders': Lucide.SlidersHorizontal,
};

export default function Icon({ name, size = 20, color = 'currentColor', className = '' }) {
  const LucideIcon = iconMap[name] || Lucide.CircleDashed;
  const isFill = name && name.endsWith('-fill');
  
  return (
    <LucideIcon
      width={size}
      height={size}
      color={color}
      fill={isFill ? color : 'none'}
      className={className}
      strokeWidth={1.6}
    />
  );
}
