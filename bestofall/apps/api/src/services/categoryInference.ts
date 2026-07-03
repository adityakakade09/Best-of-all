import { Category } from '@bestofall/shared';

const KEYWORDS: Record<Category, string[]> = {
  food: ['pizza', 'burger', 'biryani', 'noodles', 'cake', 'sushi', 'dosa', 'thali', 'sandwich', 'coffee', 'shake'],
  groceries: ['milk', 'bread', 'eggs', 'rice', 'atta', 'vegetables', 'fruits', 'oil', 'sugar', 'tea', 'dal'],
  medicines: ['tablet', 'syrup', 'medicine', 'paracetamol', 'bandage', 'thermometer', 'vitamin', 'insulin'],
  electronics: ['iphone', 'samsung', 'laptop', 'headphone', 'earbuds', 'charger', 'tv', 'smartwatch', 'mobile', 'phone'],
  fashion: ['shoes', 'shirt', 'jeans', 'dress', 'jacket', 'sneakers', 'kurta', 'saree', 'nike', 'adidas'],
  gifts: ['gift', 'bouquet', 'flowers', 'chocolate box', 'greeting card', 'birthday'],
  other: [],
};

export function inferCategory(query: string): Category {
  const q = query.toLowerCase();
  for (const [category, words] of Object.entries(KEYWORDS) as [Category, string[]][]) {
    if (words.some((w) => q.includes(w))) return category;
  }
  return 'other';
}
