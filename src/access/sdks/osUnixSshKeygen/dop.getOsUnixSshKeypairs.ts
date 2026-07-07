import { MalfunctionError } from 'helpful-errors';

import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';

import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { asExpandedPath } from '../asExpandedPath';
import type { OsUnixSshKeypair } from './dobj.OsUnixSshKeypair';
import { getOsUnixSshKeypair } from './dop.getOsUnixSshKeypair';

/**
 * .what = lists every keypair in the configured keys directory
 * .why = provides discovery of ALL keypairs for full declarative visibility
 *
 * .note = a keypair is detected by its `.pub` file; the private key sits beside it
 * .note = reads the dir via fs.readdir (no shell glob) so paths with spaces or
 *   special characters are handled safely
 */
export const getOsUnixSshKeypairs = async (
  _input: unknown,
  context: ContextUnixNetwork,
): Promise<OsUnixSshKeypair[]> => {
  const keysDir = asExpandedPath({
    uri: context.osUnixNetwork.repo.sshKeysDir,
  });

  // list the directory entries; an absent directory yields no keypairs
  const entries = await MalfunctionError.wrap(
    async (): Promise<string[]> => {
      try {
        return await readdir(keysDir);
      } catch (error) {
        if (
          error instanceof Error &&
          'code' in error &&
          error.code === 'ENOENT'
        )
          return [];
        throw error;
      }
    },
    { message: 'failed to list ssh keys directory', metadata: { keysDir } },
  )();

  // each `.pub` file names a keypair; the private uri is the path minus `.pub`
  const pubPaths = entries
    .filter((entry) => entry.endsWith('.pub'))
    .map((entry) => join(keysDir, entry));

  // read each keypair; the private uri is the `.pub` path minus its suffix
  const keypairs = await Promise.all(
    pubPaths.map((pubPath) =>
      getOsUnixSshKeypair({ uri: pubPath.replace(/\.pub$/, '') }),
    ),
  );

  return keypairs.filter(
    (keypair): keypair is OsUnixSshKeypair => keypair !== null,
  );
};
