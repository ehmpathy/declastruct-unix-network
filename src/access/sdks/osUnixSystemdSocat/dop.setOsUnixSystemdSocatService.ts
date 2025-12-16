import execa from 'execa';

import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';

import { castFromOsUnixSystemdSocatService } from './castFromOsUnixSystemdSocatService';
import { DEFAULT_SYSTEMD_UNIT_DIR } from './constants';
import type { OsUnixSystemdSocatService } from './dobj.OsUnixSystemdSocatService';

/**
 * .what = writes/overwrites a systemd socat service unit file and enables it
 * .why = idempotently sets a socat port forwarding service (creates or updates)
 *
 * .note = uses execa for all writes (sudo for system path)
 * .note = systemd services are naturally idempotent - writing the same file is safe
 */
export const setOsUnixSystemdSocatService = async (
  input: { service: OsUnixSystemdSocatService },
  context: ContextUnixNetwork,
): Promise<void> => {
  const unitDir = context.osUnixNetwork.repo.systemdUnitsDir;
  const needsSudo = unitDir === DEFAULT_SYSTEMD_UNIT_DIR;

  // format service unit content
  const content = castFromOsUnixSystemdSocatService({ service: input.service });

  // write using tee (overwrites file); sudo for system path
  const writeArgs = needsSudo
    ? ['sudo', 'tee', input.service.uri]
    : ['tee', input.service.uri];
  await execa(writeArgs[0]!, writeArgs.slice(1), { input: content });

  // systemctl operations only for system path (skip for test files)
  if (!needsSudo) return;

  // reload systemd daemon
  await execa('sudo', ['systemctl', 'daemon-reload']);

  // extract service name from uri for systemctl commands
  const serviceName = input.service.uri.split('/').pop();

  // enable and restart service
  await execa('sudo', ['systemctl', 'enable', serviceName!]);
  await execa('sudo', ['systemctl', 'restart', serviceName!]);
};
