import { DomainEntity, RefByUnique } from 'domain-objects';

import type { DeclaredUnixSshKeypair } from './DeclaredUnixSshKeypair';
import { UnixEndpoint } from './UnixEndpoint';

/**
 * .what = a declarative structure which represents an ssh config host block
 * .why = enables declarative management of `~/.ssh/config` `Host` blocks per
 *        declastruct patterns, so `ssh <alias>` reaches the target directly
 */
export interface DeclaredUnixSshAlias {
  /**
   * .what = mechanism used to manage the alias
   * .note = currently only '~/.ssh/config' is supported
   */
  via: '~/.ssh/config';

  /**
   * .what = the host alias label you type after `ssh` (the `Host` line)
   */
  from: string;

  /**
   * .what = the connection target (the `HostName` + `Port` lines)
   */
  into: UnixEndpoint;

  /**
   * .what = the ssh login user (the `User` line)
   */
  user: string;

  /**
   * .what = ref to the keypair whose private `uri` becomes the `IdentityFile` line
   */
  key: RefByUnique<typeof DeclaredUnixSshKeypair>;
}

export class DeclaredUnixSshAlias
  extends DomainEntity<DeclaredUnixSshAlias>
  implements DeclaredUnixSshAlias
{
  public static unique = ['via', 'from'] as const;
  public static nested = {
    into: UnixEndpoint,
    key: RefByUnique<typeof DeclaredUnixSshKeypair>,
  };
}
