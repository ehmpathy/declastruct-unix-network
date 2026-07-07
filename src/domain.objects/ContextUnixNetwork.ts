/**
 * .what = context object for unix network operations
 * .why = provides type safety for context parameter and enables dependency injection for testing
 */
export interface ContextUnixNetwork {
  /**
   * .what = repo configuration for unix network paths
   * .why = enables configuring paths for system files, with defaults set in provider
   */
  osUnixNetwork: {
    repo: {
      /**
       * .what = path for /etc/hosts
       * .why = enables testing without modifying system hosts file
       */
      etcHostsPath: string;

      /**
       * .what = path for /etc/systemd/system
       * .why = enables testing without modifying system services
       */
      systemdUnitsDir: string;

      /**
       * .what = path for ~/.ssh/config
       * .why = enables tests to target a sandbox, not the real ssh config file
       */
      sshConfigPath: string;

      /**
       * .what = directory that holds ssh keypairs (e.g. ~/.ssh)
       * .why = enables tests to target a sandbox, not the real ~/.ssh dir
       */
      sshKeysDir: string;
    };
  };
}
