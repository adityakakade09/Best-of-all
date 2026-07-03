'use client';

import { Category } from '@bestofall/shared';
import { CATEGORY_LABELS } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Pizza, ShoppingBasket, Pill, Smartphone, Shirt, Gift, Sparkles } from 'lucide-react';

const CATEGORY_ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  food: Pizza,
  groceries: ShoppingBasket,
  medicines: Pill,
  electronics: Smartphone,
  fashion: Shirt,
  gifts: Gift,
  other: Sparkles,
};

const CATEGORIES: Category[] = ['food', 'groceries', 'medicines', 'electronics', 'fashion', 'gifts'];

export function CategoryChips({
  active,
  onSelect,
}: {
  active?: Category;
  onSelect: (category: Category | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      <button onClick={() => onSelect(undefined)} className={cn('chip', !active && 'chip-active')}>
        <Sparkles className="h-3.5 w-3.5" /> Everything
      </button>
      {CATEGORIES.map((cat) => {
        const Icon = CATEGORY_ICONS[cat];
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={cn('chip', active === cat && 'chip-active')}
          >
            <Icon className="h-3.5 w-3.5" />
            {CATEGORY_LABELS[cat]}
          </button>
        );
      })}
    </div>
  );
}
