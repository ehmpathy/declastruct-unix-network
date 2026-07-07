import execa from 'execa';
import { MalfunctionError } from 'helpful-errors';

import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';

import { asExpandedPath } from '../asExpandedPath';
import { asOsUnixSshConfigWithoutHostBlock } from './asOsUnixSshConfigWithoutHostBlock';
import { getOsUnixSshConfigContent } from './getOsUnixSshConfigContent';
import { getOsUnixSshConfigHostBlockRange } from './getOsUnixSshConfigHostBlockRange';

/**
 * .what = removes a `Host <alias>` block from ~/.ssh/config
 * .why = supports declarative deletion of a managed alias
 *
 * .note = idempotent: a no-op if the block is already absent
 */
export const delOsUnixSshConfigHost = async (
  input: { alias: string },
  context: ContextUnixNetwork,
): Promise<void> => {
  const content = await getOsUnixSshConfigContent(context);
  if (!content) return;

  const lines = content.split('\n');
  const range = getOsUnixSshConfigHostBlockRange({
    lines,
    alias: input.alias,
  });
  if (!range) return;

  // compute the content with the block removed
  const newContent = asOsUnixSshConfigWithoutHostBlock({ content, range });

  const path = asExpandedPath({
    uri: context.osUnixNetwork.repo.sshConfigPath,
  });
  await MalfunctionError.wrap(
    async () => execa('tee', [path], { input: newContent }),
    {
      message: 'failed to write ssh config after block removal',
      metadata: { path, alias: input.alias },
    },
  )();
};
