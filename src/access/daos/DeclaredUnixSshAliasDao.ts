import { genDeclastructDao } from 'declastruct';
import type { ContextLogTrail } from 'simple-log-methods';

import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import { DeclaredUnixSshAlias } from '@src/domain.objects/DeclaredUnixSshAlias';
import { delUnixSshAlias } from '@src/domain.operations/sshAlias/delUnixSshAlias';
import { getOneUnixSshAlias } from '@src/domain.operations/sshAlias/getOneUnixSshAlias';
import { setUnixSshAlias } from '@src/domain.operations/sshAlias/setUnixSshAlias';

/**
 * .what = declastruct DAO for unix ssh alias resources
 * .why = wraps the ssh alias operations to conform to the declastruct interface
 */
export const DeclaredUnixSshAliasDao = genDeclastructDao<
  typeof DeclaredUnixSshAlias,
  ContextUnixNetwork & ContextLogTrail
>({
  dobj: DeclaredUnixSshAlias,
  get: {
    one: {
      byUnique: async (input, context) => {
        return getOneUnixSshAlias({ by: { unique: input } }, context);
      },
      byPrimary: null,
    },
  },
  set: {
    findsert: async (input, context) => {
      return setUnixSshAlias({ findsert: input }, context);
    },
    upsert: async (input, context) => {
      return setUnixSshAlias({ upsert: input }, context);
    },
    delete: async (input, context) => {
      return delUnixSshAlias({ ref: input }, context);
    },
  },
});
