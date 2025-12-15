import { DEFAULT_HOSTS_FILE_PATH } from '@src/access/sdks/osUnixHostsFile/constants';
import { DEFAULT_SYSTEMD_UNIT_DIR } from '@src/access/sdks/osUnixSystemdSocat/constants';
import { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';

/**
 * .what = provides sample unix network context for testing
 * .why = allows integration tests to access local unix network operations with configurable paths
 */
export const getSampleUnixNetworkContext = (input?: {
  repo?: {
    etcHostsPath?: string;
    systemdUnitsDir?: string;
  };
}): ContextUnixNetwork => ({
  osUnixNetwork: {
    repo: {
      etcHostsPath: input?.repo?.etcHostsPath ?? DEFAULT_HOSTS_FILE_PATH,
      systemdUnitsDir: input?.repo?.systemdUnitsDir ?? DEFAULT_SYSTEMD_UNIT_DIR,
    },
  },
});
