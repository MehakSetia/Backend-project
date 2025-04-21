import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export const DATA_DIR = join(__dirname, "data");
export const USERS_FILE = join(DATA_DIR, "users.json");
export const BOOKINGS_FILE = join(DATA_DIR, "bookings.json");
export const POSTS_FILE = join(DATA_DIR, "posts.json");
export const PACKAGES_FILE = join(DATA_DIR, "packages.json");

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

export function readJsonFile(filePath: string): any {
  if (!existsSync(filePath)) {
    return [];
  }
  const data = readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

export function writeJsonFile(filePath: string, data: any): void {
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
} 