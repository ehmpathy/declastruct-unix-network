import { homedir } from 'node:os';

/**
 * .what = expands a `~` prefix in a path to the user's home directory
 * .why = ssh paths are conventionally written with `~`; the shell would expand
 *        it, but our direct fs/execa calls do not — so we expand explicitly
 */
export const asExpandedPath = (input: { uri: string }): string => {
  if (input.uri === '~') return homedir();
  if (input.uri.startsWith('~/')) return `${homedir()}${input.uri.slice(1)}`;
  return input.uri;
};
