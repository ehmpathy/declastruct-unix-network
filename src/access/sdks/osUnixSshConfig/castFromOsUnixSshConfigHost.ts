import type { OsUnixSshConfigHost } from './dobj.OsUnixSshConfigHost';

/**
 * .what = formats an OsUnixSshConfigHost into its `~/.ssh/config` block text
 * .why = converts the structured block back to the file's native format
 *
 * .note = emits only the non-null keywords, indented two spaces by convention
 */
export const castFromOsUnixSshConfigHost = (input: {
  host: OsUnixSshConfigHost;
}): string => {
  const { alias, hostName, port, user, identityFile } = input.host;

  const lines = [`Host ${alias}`];
  if (hostName !== null) lines.push(`  HostName ${hostName}`);
  if (port !== null) lines.push(`  Port ${port}`);
  if (user !== null) lines.push(`  User ${user}`);
  if (identityFile !== null) lines.push(`  IdentityFile ${identityFile}`);

  return lines.join('\n');
};
