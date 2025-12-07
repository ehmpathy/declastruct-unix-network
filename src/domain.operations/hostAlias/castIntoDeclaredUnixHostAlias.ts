import type { OsUnixHostsFileEntry } from '../../access/sdks/osUnixHostsFile';
import { DeclaredUnixHostAlias } from '../../domain.objects/DeclaredUnixHostAlias';

/**
 * .what = casts an OsUnixHostsFileEntry to a DeclaredUnixHostAlias
 * .why = converts OS-level representation to domain object for domain operations
 *
 * .note = maps hosts file format to declarative terms:
 *   - ip → into (where the hostname resolves to)
 *   - hostname → from (the hostname being aliased)
 */
export const castIntoDeclaredUnixHostAlias = (input: {
  entry: OsUnixHostsFileEntry;
  hostname: string;
}): DeclaredUnixHostAlias => {
  return DeclaredUnixHostAlias.as({
    via: '/etc/hosts',
    from: input.hostname,
    into: input.entry.ip,
  });
};
