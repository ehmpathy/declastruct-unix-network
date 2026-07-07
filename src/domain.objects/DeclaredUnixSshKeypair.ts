import { DomainEntity } from 'domain-objects';

/**
 * .what = a declarative structure which represents a local ssh keypair
 * .why = enables declarative mint/reuse of an `ssh-keygen` keypair per
 *        declastruct patterns; its `publicKey` feeds downstream authorized-key
 *        resources (e.g. aws ec2)
 */
export interface DeclaredUnixSshKeypair {
  /**
   * .what = mechanism used to mint/manage the keypair
   * .note = currently only 'ssh-keygen' is supported
   */
  via: 'ssh-keygen';

  /**
   * .what = the private key path (the `ssh-keygen -f` target) — the natural unique key
   * .note = the public key path is derivable as `${uri}.pub`
   */
  uri: string;

  /**
   * .what = the key algorithm (the `ssh-keygen -t` value)
   */
  algorithm: 'ed25519' | 'rsa';

  /**
   * .what = the key comment (the `ssh-keygen -C` value)
   */
  comment: string;

  /**
   * .what = the `.pub` content line, e.g. 'ssh-ed25519 AAAA... comment'
   * .note = @metadata -> only known after mint; read from `${uri}.pub`
   */
  publicKey?: string;
}

export class DeclaredUnixSshKeypair
  extends DomainEntity<DeclaredUnixSshKeypair>
  implements DeclaredUnixSshKeypair
{
  public static unique = ['via', 'uri'] as const;

  /**
   * .what = intrinsic attributes resolved from the mint, not user-settable
   */
  public static readonly = ['publicKey'] as const;
}
