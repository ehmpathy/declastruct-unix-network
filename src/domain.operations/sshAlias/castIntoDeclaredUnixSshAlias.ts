import type { OsUnixSshConfigHost } from '@src/access/sdks/osUnixSshConfig';
import { DeclaredUnixSshAlias } from '@src/domain.objects/DeclaredUnixSshAlias';

/**
 * .what = casts an OsUnixSshConfigHost to a DeclaredUnixSshAlias; null if partial
 * .why = converts the OS-level block to the domain object for operations
 *
 * .note = a managed alias requires HostName + Port + User + IdentityFile; a block
 *   that omits any of these is not one of our aliases, so we return null
 */
export const castIntoDeclaredUnixSshAlias = (input: {
  host: OsUnixSshConfigHost;
}): DeclaredUnixSshAlias | null => {
  const { alias, hostName, port, user, identityFile } = input.host;

  // skip blocks that lack the full managed shape
  if (
    hostName === null ||
    port === null ||
    user === null ||
    identityFile === null
  )
    return null;

  return DeclaredUnixSshAlias.as({
    via: '~/.ssh/config',
    from: alias,
    into: { host: hostName, port },
    user,
    key: { via: 'ssh-keygen', uri: identityFile },
  });
};
