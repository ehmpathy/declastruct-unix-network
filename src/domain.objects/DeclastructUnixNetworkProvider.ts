import { DeclastructDao, DeclastructProvider } from 'declastruct';
import type { ContextLogTrail } from 'simple-log-methods';

import { ContextUnixNetwork } from './ContextUnixNetwork';
import { DeclaredUnixHostAlias } from './DeclaredUnixHostAlias';
import { DeclaredUnixPortAlias } from './DeclaredUnixPortAlias';

/**
 * .what = the declastruct provider for unix network resources
 * .why = provides type safety and reusability for the unix network provider
 */
export type DeclastructUnixNetworkProvider = DeclastructProvider<
  {
    DeclaredUnixHostAlias: DeclastructDao<
      DeclaredUnixHostAlias,
      typeof DeclaredUnixHostAlias,
      ContextUnixNetwork & ContextLogTrail
    >;
    DeclaredUnixPortAlias: DeclastructDao<
      DeclaredUnixPortAlias,
      typeof DeclaredUnixPortAlias,
      ContextUnixNetwork & ContextLogTrail
    >;
  },
  ContextUnixNetwork & ContextLogTrail
>;
