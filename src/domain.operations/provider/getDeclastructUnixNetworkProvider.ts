import { DeclastructProvider } from 'declastruct';
import type { ContextLogTrail } from 'simple-log-methods';

import { DeclaredUnixHostAliasDao } from '@src/access/daos/DeclaredUnixHostAliasDao';
import { DeclaredUnixPortAliasDao } from '@src/access/daos/DeclaredUnixPortAliasDao';
import { DeclaredUnixSshAliasDao } from '@src/access/daos/DeclaredUnixSshAliasDao';
import { DeclaredUnixSshKeypairDao } from '@src/access/daos/DeclaredUnixSshKeypairDao';
import { DEFAULT_HOSTS_FILE_PATH } from '@src/access/sdks/osUnixHostsFile/constants';
import { DEFAULT_SSH_CONFIG_PATH } from '@src/access/sdks/osUnixSshConfig/constants';
import { DEFAULT_SSH_KEYS_DIR } from '@src/access/sdks/osUnixSshKeygen/constants';
import { DEFAULT_SYSTEMD_UNIT_DIR } from '@src/access/sdks/osUnixSystemdSocat/constants';
import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import type { DeclastructUnixNetworkProvider } from '@src/domain.objects/DeclastructUnixNetworkProvider';

/**
 * .what = creates a declastruct provider for unix network resources
 * .why = enables unix network resource management via declastruct framework
 */
export const getDeclastructUnixNetworkProvider = (
  input: {
    repo?: {
      etcHostsPath?: string;
      systemdUnitsDir?: string;
      sshConfigPath?: string;
      sshKeysDir?: string;
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
        sshConfigPath: input.repo?.sshConfigPath ?? DEFAULT_SSH_CONFIG_PATH,
        sshKeysDir: input.repo?.sshKeysDir ?? DEFAULT_SSH_KEYS_DIR,
      },
    },
  };

  // assemble DAOs for all unix network resource types
  const daos = {
    DeclaredUnixHostAlias: DeclaredUnixHostAliasDao,
    DeclaredUnixPortAlias: DeclaredUnixPortAliasDao,
    DeclaredUnixSshKeypair: DeclaredUnixSshKeypairDao,
    DeclaredUnixSshAlias: DeclaredUnixSshAliasDao,
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
