import { DeclastructProvider } from 'declastruct';
import type { ContextLogTrail } from 'simple-log-methods';

import { DeclaredUnixHostAliasDao } from '../../access/daos/DeclaredUnixHostAliasDao';
import { DeclaredUnixPortAliasDao } from '../../access/daos/DeclaredUnixPortAliasDao';
import { DEFAULT_HOSTS_FILE_PATH } from '../../access/sdks/osUnixHostsFile/constants';
import { DEFAULT_SYSTEMD_UNIT_DIR } from '../../access/sdks/osUnixSystemdSocat/constants';
import { ContextUnixNetwork } from '../../domain.objects/ContextUnixNetwork';
import { DeclastructUnixNetworkProvider } from '../../domain.objects/DeclastructUnixNetworkProvider';

/**
 * .what = creates a declastruct provider for unix network resources
 * .why = enables unix network resource management via declastruct framework
 */
export const getDeclastructUnixNetworkProvider = (
  input: {
    repo?: {
      etcHostsPath?: string;
      systemdUnitsDir?: string;
    };
  },
  context: ContextLogTrail,
): DeclastructUnixNetworkProvider => {
  // build context with defaults for unix network paths
  const providerContext: ContextUnixNetwork & ContextLogTrail = {
    ...context,
    osUnixNetwork: {
      repo: {
        etcHostsPath: input.repo?.etcHostsPath ?? DEFAULT_HOSTS_FILE_PATH,
        systemdUnitsDir:
          input.repo?.systemdUnitsDir ?? DEFAULT_SYSTEMD_UNIT_DIR,
      },
    },
  };

  // assemble DAOs for all unix network resource types
  const daos = {
    DeclaredUnixHostAlias: DeclaredUnixHostAliasDao,
    DeclaredUnixPortAlias: DeclaredUnixPortAliasDao,
  };

  // return provider with all required properties
  return new DeclastructProvider({
    name: 'unix-network',
    daos,
    context: providerContext,
    hooks: {
      beforeAll: async () => {
        // no setup needed for unix network provider
      },
      afterAll: async () => {
        // no teardown needed for unix network provider
      },
    },
  });
};
