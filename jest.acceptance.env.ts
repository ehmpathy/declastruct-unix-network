import { execSync } from 'child_process';

// eslint-disable-next-line no-undef
jest.setTimeout(90000); // we're calling downstream apis

/**
 * .what = checks if sudo access is available without prompting
 * .why = fail fast if test environment lacks required permissions
 */
const hasSudoAccess = (): boolean => {
  try {
    execSync('sudo -n true', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

/**
 * sanity check that sudo access is available for acceptance tests
 *
 * usecases
 * - prevent silent test failures due to missing permissions
 * - provide clear instructions on how to run with sudo
 *
 * why sudo is required
 * - acceptance tests modify /etc/hosts (requires root)
 * - acceptance tests create systemd unit files in /etc/systemd/system (requires root)
 * - acceptance tests run systemctl commands (requires root)
 */
if (!hasSudoAccess())
  throw new Error(
    'sudo access required for acceptance tests. run with: sudo -E npm run test:acceptance',
  );

/**
 * sanity check that declastruct CLI is available for acceptance tests
 *
 * usecases
 * - prevent silent test failures due to missing CLI
 * - provide clear instructions on missing dependency
 */
try {
  execSync('npx declastruct --version', { stdio: 'pipe' });
} catch (error) {
  throw new Error(
    'declastruct CLI not available - required for acceptance tests',
  );
}
