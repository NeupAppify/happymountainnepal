// Edge runtime compatible version - NO Node.js modules
import managers from "@base/manager.json";

interface Manager {
    username: string;
    password: string;
}

/**
 * Fetches manager data from the local file.
 * This function is safe to use in Edge runtime.
 */
export async function getManagerData(): Promise<Manager[]> {
    return managers as Manager[];
}
