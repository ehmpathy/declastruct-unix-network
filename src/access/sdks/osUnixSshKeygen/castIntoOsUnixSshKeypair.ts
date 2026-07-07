import { UnexpectedCodePathError } from 'helpful-errors';

import type { OsUnixSshKeypair } from './dobj.OsUnixSshKeypair';

/**
 * .what = maps a `.pub` key-type token to our algorithm term
 * .why = the `.pub` line prefixes the type as `ssh-<algorithm>`
 */
const asAlgorithm = (input: { keyType: string }): 'ed25519' | 'rsa' => {
  if (input.keyType === 'ssh-ed25519') return 'ed25519';
  if (input.keyType === 'ssh-rsa') return 'rsa';
  return UnexpectedCodePathError.throw('unsupported ssh key type', {
    keyType: input.keyType,
  });
};

/**
 * .what = parses a `.pub` content line + private key uri into an OsUnixSshKeypair
 * .why = converts the raw OS artifact into a structured shape for operations
 *
 * .note = `.pub` line format: `<type> <base64> [comment...]`
 *   e.g. `ssh-ed25519 AAAAC3... grove.ehmpathy`
 */
export const castIntoOsUnixSshKeypair = (input: {
  uri: string;
  publicKeyLine: string;
}): OsUnixSshKeypair => {
  const trimmed = input.publicKeyLine.trim();
  const [keyType, base64, ...commentParts] = trimmed.split(/\s+/);

  // fail fast if the line is not a valid public key
  if (!keyType || !base64)
    UnexpectedCodePathError.throw('malformed ssh public key line', {
      uri: input.uri,
      publicKeyLine: input.publicKeyLine,
    });

  return {
    uri: input.uri,
    algorithm: asAlgorithm({ keyType }),
    comment: commentParts.join(' '),
    publicKey: trimmed,
  };
};
