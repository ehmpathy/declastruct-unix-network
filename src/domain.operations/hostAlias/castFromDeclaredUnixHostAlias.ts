import type { OsUnixHostsFileEntry } from '@src/access/sdks/osUnixHostsFile';
import type { DeclaredUnixHostAlias } from '@src/domain.objects/DeclaredUnixHostAlias';

/**
 * .what = marker comment used to identify declastruct-managed entries
 * .why = enables filtering of managed entries during reads
 */
export const DECLASTRUCT_MANAGED_COMMENT = 'managed by declastruct';

/**
 * .what = casts a DeclaredUnixHostAlias to an OsUnixHostsFileEntry
 * .why = converts domain object to OS-level representation for writing to /etc/hosts
 *
 * .note = maps declarative terms to hosts file format:
 *   - from (hostname) → hostnames[0]
 *   - into (ip) → ip
 *   - adds declastruct marker comment for future filtering
 */
export const castFromDeclaredUnixHostAlias = (input: {
  alias: DeclaredUnixHostAlias;
}): OsUnixHostsFileEntry => {
  return {
    ip: input.alias.into,
    hostnames: [input.alias.from],
    comment: DECLASTRUCT_MANAGED_COMMENT,
  };
};
