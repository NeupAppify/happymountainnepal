// This file is no longer used for redirects. Keeping for other base functions.
// Node.js runtime only - uses fs and path modules
// For API routes, Server Components, etc.

import fs from 'fs/promises';
import path from 'path';

// Paths for different file types
const SRC_BASE_PATH = path.join(process.cwd(), 'src', 'base'); // For credentials
const BASE_PATH = path.join(process.cwd(), '@base'); // For configuration

// Read/write functions for credential files (in /src/base)
export async function readCredentialFile<T>(file: string): Promise<T> {
    const filePath = path.join(SRC_BASE_PATH, file);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
}

export async function writeCredentialFile(file: string, data: any): Promise<void> {
    const filePath = path.join(SRC_BASE_PATH, file);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Read/write functions for configuration files (in /@base)
export async function readBaseFile<T>(file: string): Promise<T> {
    const filePath = path.join(BASE_PATH, file);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
}

export async function writeBaseFile(file: string, data: any): Promise<void> {
    const filePath = path.join(BASE_PATH, file);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function baseFileExists(file: string): Promise<boolean> {
    try {
        const filePath = path.join(BASE_PATH, file);
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// Functions to get configuration data (Node.js runtime only)
// These use fs to read from /@base
export async function getNavigationComponentsData() {
    return readBaseFile('navigation-components.json');
}

// getRedirectsData is no longer needed as redirects are fetched from an API
/*
export async function getRedirectsData() {
    return readBaseFile('redirects.json');
}
*/
