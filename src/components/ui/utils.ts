import { clsx, type ClassValue } from "../../utils/clsx-stub";
import { twMerge } from "../../utils/tailwind-merge-stub";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
