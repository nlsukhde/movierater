import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// utils.ts
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function renderStars(rating: number, interactive: boolean = false, size: 'sm' | 'md' | 'lg' = 'md') {
  // placeholder, import actual Star component where needed
  return null;
}