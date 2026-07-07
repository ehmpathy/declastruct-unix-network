import execa from 'execa';

import { asExpandedPath } from '../asExpandedPath';
import { castIntoOsUnixSshKeypair } from './castIntoOsUnixSshKeypair';
import type { OsUnixSshKeypair } from './dobj.OsUnixSshKeypair';

/**
 * .what = reads a single keypair by its private key uri; null if absent
 * .why = provides idempotent lookup for findsert semantics
 *
 * .note = presence is judged by the `.pub` file; the private key sits beside it
 */
export const getOsUnixSshKeypair = async (input: {
  uri: string;
}): Promise<OsUnixSshKeypair | null> => {
  const pubPath = `${asExpandedPath({ uri: input.uri })}.pub`;

  // read the public key content; treat absence as null
  const publicKeyLine = await (async () => {
    try {
      const { stdout } = await execa('cat', [pubPath]);
      return stdout;
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      if (
        error.message.includes('ENOENT') ||
        error.message.includes('No such file')
      )
        return null;
      throw error;
    }
  })();

  if (publicKeyLine === null) return null;
  if (!publicKeyLine.trim()) return null;

  return castIntoOsUnixSshKeypair({ uri: input.uri, publicKeyLine });
};
