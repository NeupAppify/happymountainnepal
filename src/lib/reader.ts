import fs from 'fs';
import path from 'path';

/**
 * Reads a file from the /@base directory relative to the project root.
 * This ensures files are read from the filesystem at runtime, allowing live updates.
 * 
 * @param fileName The name of the file to read (e.g., 'navigation.json', 'config.txt')
 * @returns The file content as a string or null if reading fails
 */
export function readBaseFile(fileName: string): string | null {
  try {
    const filePath = path.join(process.cwd(), '@base', fileName);

    if (!fs.existsSync(filePath)) {
      console.warn(`[Reader] File not found: ${filePath}`);
      return null;
    }

    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`[Reader] Error reading file ${fileName}:`, error);
    return null;
  }
}

/**
 * Reads a JSON file from the /@base directory and parses it.
 * 
 * @param fileName The name of the JSON file to read
 * @returns The parsed JSON content or null if reading/parsing fails
 */
export function readBaseJson<T = any>(fileName: string): T | null {
  const content = readBaseFile(fileName);
  if (!content) return null;

  try {
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`[Reader] Error parsing JSON file ${fileName}:`, error);
    return null;
  }
}

/**
 * Writes content to a file in the /@base directory.
 * 
 * @param fileName The name of the file to write
 * @param content The content to write (string)
 */
export function writeBaseFile(fileName: string, content: string): boolean {
  try {
    const baseDir = path.join(process.cwd(), '@base');
    const filePath = path.join(baseDir, fileName);

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`[Reader] Error writing file ${fileName}:`, error);
    return false;
  }
}

/**
 * Writes a JSON object to a file in the /@base directory.
 * 
 * @param fileName The name of the file to write
 * @param data The data to write
 */
export function writeBaseJson(fileName: string, data: any): boolean {
  try {
    return writeBaseFile(fileName, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`[Reader] Error writing JSON file ${fileName}:`, error);
    return false;
  }
}
