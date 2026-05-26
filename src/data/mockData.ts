import { Product, Category } from '@/types';

export const categories: Category[] = [];

export const products: Product[] = [];

export const featuredProducts = products.filter((p) => p.featured);
export const newProducts = products.filter((p) => p.isNew);
