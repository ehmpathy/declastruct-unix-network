import type { OsUnixSshConfigHost } from '@src/access/sdks/osUnixSshConfig';
import type { DeclaredUnixSshAlias } from '@src/domain.objects/DeclaredUnixSshAlias';

import { castIntoDeclaredUnixSshAlias } from './castIntoDeclaredUnixSshAlias';

/**
 * .what = casts many ssh config host blocks into declared aliases
 * .why = one place to turn a list of parsed blocks into managed aliases; blocks
 *        that lack the full managed shape are dropped (they are foreign hosts)
 */
export const castIntoDeclaredUnixSshAliases = (input: {
  hosts: OsUnixSshConfigHost[];
}): DeclaredUnixSshAlias[] =>
  input.hosts
    .map((host) => castIntoDeclaredUnixSshAlias({ host }))
    .filter((alias): alias is DeclaredUnixSshAlias => alias !== null);
