import { homedir } from 'node:os';
import { join } from 'node:path';

/**
 * .what = default path to the ssh config file on unix systems
 * .why = centralized constant for sdk operations
 */
export const DEFAULT_SSH_CONFIG_PATH = join(homedir(), '.ssh', 'config');
