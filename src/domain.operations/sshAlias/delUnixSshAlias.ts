import { isRefByUnique, type Ref } from 'domain-objects';
import { UnexpectedCodePathError } from 'helpful-errors';
import type { ContextLogTrail } from 'simple-log-methods';

import { osUnixSshConfigSdk } from '@src/access/sdks/osUnixSshConfig';
import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import { DeclaredUnixSshAlias } from '@src/domain.objects/DeclaredUnixSshAlias';

/**
 * .what = deletes a unix ssh alias (its `Host` block) by ref
 * .why = supports declarative removal of a managed alias
 */
export const delUnixSshAlias = async (
  input: { ref: Ref<typeof DeclaredUnixSshAlias> },
  context: ContextUnixNetwork & ContextLogTrail,
): Promise<void> => {
  const { ref } = input;

  // the alias has no primary key, so the ref is always by-unique with a `from`
  if (!isRefByUnique({ of: DeclaredUnixSshAlias })(ref))
    return UnexpectedCodePathError.throw('ssh alias ref must be by-unique', {
      ref,
    });

  await osUnixSshConfigSdk.delOsUnixSshConfigHost({ alias: ref.from }, context);
};
