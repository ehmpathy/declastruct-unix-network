import type { OsUnixSshConfigHost } from '@src/access/sdks/osUnixSshConfig';
import type { DeclaredUnixSshAlias } from '@src/domain.objects/DeclaredUnixSshAlias';

/**
 * .what = casts a DeclaredUnixSshAlias to an OsUnixSshConfigHost
 * .why = converts the domain object to the OS-level `Host` block for writes
 *
 * .note = maps declarative terms to ssh config keywords:
 *   - from        → Host (alias)
 *   - into.host   → HostName
 *   - into.port   → Port
 *   - user        → User
 *   - key.uri     → IdentityFile (the keypair's private path)
 */
export const castFromDeclaredUnixSshAlias = (input: {
  alias: DeclaredUnixSshAlias;
}): OsUnixSshConfigHost => {
  return {
    alias: input.alias.from,
    hostName: input.alias.into.host,
    port: input.alias.into.port,
    user: input.alias.user,
    identityFile: input.alias.key.uri,
  };
};
