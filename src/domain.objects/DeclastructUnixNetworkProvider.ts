import type { DeclastructDao, DeclastructProvider } from 'declastruct';
import type { ContextLogTrail } from 'simple-log-methods';

import type { ContextUnixNetwork } from './ContextUnixNetwork';
import type { DeclaredUnixHostAlias } from './DeclaredUnixHostAlias';
import type { DeclaredUnixPortAlias } from './DeclaredUnixPortAlias';

/**
 * .what = the declastruct provider for unix network resources
 * .why = provides type safety and reusability for the unix network provider
 */
export type DeclastructUnixNetworkProvider = DeclastructProvider<
  {
    DeclaredUnixHostAlias: DeclastructDao<
      typeof DeclaredUnixHostAlias,
      ContextUnixNetwork & ContextLogTrail
    >;
    DeclaredUnixPortAlias: DeclastructDao<
      typeof DeclaredUnixPortAlias,
      ContextUnixNetwork & ContextLogTrail
    >;
  },
  ContextUnixNetwork & ContextLogTrail
>;
