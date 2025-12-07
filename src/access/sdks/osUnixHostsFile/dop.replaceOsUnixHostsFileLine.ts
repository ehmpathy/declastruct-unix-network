import execa from 'execa';
import { UnexpectedCodePathError } from 'helpful-errors';

import type { ContextUnixNetwork } from '../../../domain.objects/ContextUnixNetwork';
import { castFromOsUnixHostsFileEntry } from './castFromOsUnixHostsFileEntry';
import { DEFAULT_HOSTS_FILE_PATH } from './constants';
import type { OsUnixHostsFileEntry } from './dobj.OsUnixHostsFileEntry';

/**
 * .what = safely replaces an entry in the hosts file using find-and-replace
 * .why = enables updating host entries without rewriting the entire file
 *
 * .note = fails fast if the old entry is not found exactly once
 * .note = uses execa for all reads/writes (sudo for system path)
 */
export const replaceOsUnixHostsFileEntry = async (
  input: { oldEntry: OsUnixHostsFileEntry; newEntry: OsUnixHostsFileEntry },
  context: ContextUnixNetwork,
): Promise<void> => {
  const hostsPath = context.osUnixNetwork.repo.etcHostsPath;
  const needsSudo = hostsPath === DEFAULT_HOSTS_FILE_PATH;

  // cast domain objects to string format
  const oldLineStr = castFromOsUnixHostsFileEntry({ entry: input.oldEntry });
  const newLineStr = castFromOsUnixHostsFileEntry({ entry: input.newEntry });

  // read current content via execa
  const { stdout: content } = await execa('cat', [hostsPath]);

  // verify old entry exists exactly once (fail fast if not found or ambiguous)
  const occurrences = content.split(oldLineStr).length - 1;
  if (occurrences === 0)
    UnexpectedCodePathError.throw(
      'cannot replace entry; old entry not found in hosts file',
      { oldLine: oldLineStr, hostsPath },
    );
  if (occurrences > 1)
    UnexpectedCodePathError.throw(
      'cannot replace entry; old entry found multiple times in hosts file (ambiguous)',
      { oldLine: oldLineStr, occurrences, hostsPath },
    );

  // perform the replacement
  const newContent = content.replace(oldLineStr, newLineStr);

  // write using tee (overwrites file); sudo for system path
  const args = needsSudo ? ['sudo', 'tee', hostsPath] : ['tee', hostsPath];
  await execa(args[0]!, args.slice(1), { input: newContent });
};
