import type { RefByUnique } from 'domain-objects';
import { UnexpectedCodePathError } from 'helpful-errors';
import type { ContextLogTrail } from 'simple-log-methods';
import type { PickOne } from 'type-fns';

import { osUnixSshConfigSdk } from '@src/access/sdks/osUnixSshConfig';
import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import type { DeclaredUnixSshAlias } from '@src/domain.objects/DeclaredUnixSshAlias';

import { castIntoDeclaredUnixSshAlias } from './castIntoDeclaredUnixSshAlias';

/**
 * .what = gets one unix ssh alias from ~/.ssh/config by its Host alias
 * .why = retrieves current state of an alias for declarative management
 */
export const getOneUnixSshAlias = async (
  input: {
    by: PickOne<{
      unique: RefByUnique<typeof DeclaredUnixSshAlias>;
    }>;
  },
  context: ContextUnixNetwork & ContextLogTrail,
): Promise<DeclaredUnixSshAlias | null> => {
  // determine the alias label from input
  const from = (() => {
    if (input.by.unique) return input.by.unique.from;
    UnexpectedCodePathError.throw('not referenced by unique. how not?', {
      input,
    });
  })();

  // read all blocks and find the one for this alias
  const hosts = await osUnixSshConfigSdk.getOsUnixSshConfigHosts({}, context);
  const host = hosts.find((candidate) => candidate.alias === from);
  if (!host) return null;

  return castIntoDeclaredUnixSshAlias({ host });
};
