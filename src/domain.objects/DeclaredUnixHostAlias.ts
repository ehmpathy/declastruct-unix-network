import { DomainEntity } from 'domain-objects';

/**
 * .what = a declarative structure which represents a unix host alias
 * .why = enables declarative management of /etc/hosts entries following declastruct patterns
 */
export interface DeclaredUnixHostAlias {
  /**
   * .what = mechanism used to manage the alias
   * .note = currently only '/etc/hosts' is supported
   */
  via: '/etc/hosts';

  /**
   * .what = hostname to alias (the source)
   */
  from: string;

  /**
   * .what = ip address to resolve to (the target)
   */
  into: string;
}

export class DeclaredUnixHostAlias
  extends DomainEntity<DeclaredUnixHostAlias>
  implements DeclaredUnixHostAlias
{
  public static unique = ['via', 'from'] as const;
}
