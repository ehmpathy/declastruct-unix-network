import { homedir } from 'node:os';
import { join } from 'node:path';

/**
 * .what = default directory that holds ssh keypairs
 * .why = centralized constant for sdk operations
 */
export const DEFAULT_SSH_KEYS_DIR = join(homedir(), '.ssh');
