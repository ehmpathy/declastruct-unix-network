/**
 * .what = a keypair as represented at the OS access layer (via ssh-keygen)
 * .why = intermediate representation for keypair operations at the OS boundary
 *
 * .note = the private key lives at `uri`, the public key at `${uri}.pub`;
 *   `algorithm` and `comment` are parsed from the `.pub` content line
 */
export interface OsUnixSshKeypair {
  /**
   * .what = the private key path (the `ssh-keygen -f` target)
   */
  uri: string;

  /**
   * .what = the key algorithm, parsed from the `.pub` line prefix
   */
  algorithm: 'ed25519' | 'rsa';

  /**
   * .what = the key comment, parsed from the `.pub` line trailer
   */
  comment: string;

  /**
   * .what = the full `.pub` content line
   */
  publicKey: string;
}
