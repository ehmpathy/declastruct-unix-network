import execa from 'execa';
import { MalfunctionError } from 'helpful-errors';

import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';

import { dirname } from 'node:path';
import { asExpandedPath } from '../asExpandedPath';
import { asOsUnixSshConfigWithHostBlock } from './asOsUnixSshConfigWithHostBlock';
import { castFromOsUnixSshConfigHost } from './castFromOsUnixSshConfigHost';
import type { OsUnixSshConfigHost } from './dobj.OsUnixSshConfigHost';
import { getOsUnixSshConfigContent } from './getOsUnixSshConfigContent';
import { getOsUnixSshConfigHostBlockRange } from './getOsUnixSshConfigHostBlockRange';

/**
 * .what = writes a `Host` block into ~/.ssh/config: replace in place or append
 * .why = idempotent upsert of one block; never duplicates, never disturbs peers
 */
export const setOsUnixSshConfigHost = async (
  input: { host: OsUnixSshConfigHost },
  context: ContextUnixNetwork,
): Promise<void> => {
  const path = asExpandedPath({
    uri: context.osUnixNetwork.repo.sshConfigPath,
  });

  // read current content and locate any extant block for this alias
  const content = await getOsUnixSshConfigContent(context);
  const lines = content.length ? content.split('\n') : [];
  const blockText = castFromOsUnixSshConfigHost({ host: input.host });
  const range = getOsUnixSshConfigHostBlockRange({
    lines,
    alias: input.host.alias,
  });

  // build the new file content: replace the block in place, or append it
  const newContent = asOsUnixSshConfigWithHostBlock({
    content,
    blockText,
    range,
  });

  // ensure the parent directory exists, then write the file
  await MalfunctionError.wrap(
    async () => execa('mkdir', ['-p', dirname(path)]),
    { message: 'failed to create ssh config directory', metadata: { path } },
  )();
  await MalfunctionError.wrap(
    async () => execa('tee', [path], { input: newContent }),
    {
      message: 'failed to write ssh config block',
      metadata: { path, alias: input.host.alias },
    },
  )();
};
