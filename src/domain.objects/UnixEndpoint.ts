import { DomainLiteral } from 'domain-objects';

/**
 * .what = a host + port endpoint on a unix network
 * .why = reusable structure for any resource that targets a host+port
 *        (a port-alias source/target, an ssh connection target, etc.)
 */
export interface UnixEndpoint {
  host: string;
  port: number;
}

export class UnixEndpoint
  extends DomainLiteral<UnixEndpoint>
  implements UnixEndpoint {}
