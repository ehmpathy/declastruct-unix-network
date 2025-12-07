import type { ContextLogTrail } from 'simple-log-methods';

import { osUnixHostsFileSdk } from '../../access/sdks/osUnixHostsFile';
import type { ContextUnixNetwork } from '../../domain.objects/ContextUnixNetwork';
import type { DeclaredUnixHostAlias } from '../../domain.objects/DeclaredUnixHostAlias';
import { castIntoDeclaredUnixHostAlias } from './castIntoDeclaredUnixHostAlias';

/**
 * .what = gets all unix host aliases from /etc/hosts
 * .why = retrieves ALL host aliases for full declarative control over system state
 */
export const getAllUnixHostAliases = async (
  _input: unknown,
  context: ContextUnixNetwork & ContextLogTrail,
): Promise<DeclaredUnixHostAlias[]> => {
  // get all hosts file entries via SDK
  const entries = await osUnixHostsFileSdk.getOsUnixHostsFileEntries(
    {},
    context,
  );

  // convert to domain objects (one per hostname)
  const aliases: DeclaredUnixHostAlias[] = [];
  for (const entry of entries) {
    for (const hostname of entry.hostnames) {
      aliases.push(castIntoDeclaredUnixHostAlias({ entry, hostname }));
    }
  }

  return aliases;
};
