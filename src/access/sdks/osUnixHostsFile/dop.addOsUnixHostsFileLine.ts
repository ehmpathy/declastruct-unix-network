import execa from 'execa';
import { BadRequestError } from 'helpful-errors';

import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';

import { castFromOsUnixHostsFileEntry } from './castFromOsUnixHostsFileEntry';
import { DEFAULT_HOSTS_FILE_PATH } from './constants';
import type { OsUnixHostsFileEntry } from './dobj.OsUnixHostsFileEntry';

/**
 * .what = appends an entry to /etc/hosts
 * .why = safely adds new host entry without overwriting existing content
 *
 * .note = uses execa with tee for all writes (sudo for system path)
 * .note = only supports single hostname per entry for isolation and maintainability
 */
export const addOsUnixHostsFileEntry = async (
  input: { entry: OsUnixHostsFileEntry },
  context: ContextUnixNetwork,
): Promise<void> => {
  // fail fast if multiple hostnames provided (only single hostname per entry supported)
  if (input.entry.hostnames.length > 1)
    BadRequestError.throw(
      'only single hostname per entry supported for isolation and maintainability',
      { hostnames: input.entry.hostnames },
    );

  // format entry for hosts file
  const hostsPath = context.osUnixNetwork.repo.etcHostsPath;
  const needsSudo = hostsPath === DEFAULT_HOSTS_FILE_PATH;
  const formattedLine = castFromOsUnixHostsFileEntry({ entry: input.entry });
  const lineContent = `\n${formattedLine}`;

  // append using tee -a (append mode); sudo for system path
  const args = needsSudo
    ? ['sudo', 'tee', '-a', hostsPath]
    : ['tee', '-a', hostsPath];
  await execa(args[0]!, args.slice(1), { input: lineContent });
};
