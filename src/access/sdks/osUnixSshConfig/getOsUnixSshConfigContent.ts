import execa from 'execa';

import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';

import { asExpandedPath } from '../asExpandedPath';

/**
 * .what = reads the raw ssh config file content; empty string if absent
 * .why = shared read for get/set/del; an absent config is a valid empty state
 */
export const getOsUnixSshConfigContent = async (
  context: ContextUnixNetwork,
): Promise<string> => {
  const path = asExpandedPath({
    uri: context.osUnixNetwork.repo.sshConfigPath,
  });

  try {
    const { stdout } = await execa('cat', [path]);
    return stdout;
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    // an absent config file is a valid empty state
    if (
      error.message.includes('ENOENT') ||
      error.message.includes('No such file')
    )
      return '';
    throw error;
  }
};
