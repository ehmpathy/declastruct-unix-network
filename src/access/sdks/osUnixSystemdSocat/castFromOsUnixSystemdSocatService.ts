import { OsUnixSystemdSocatService } from './dobj.OsUnixSystemdSocatService';

/**
 * .what = formats an OsUnixSystemdSocatService as systemd unit file content
 * .why = casts from domain object to raw systemd unit file format for writing
 */
export const castFromOsUnixSystemdSocatService = (input: {
  service: OsUnixSystemdSocatService;
}): string => {
  const { service } = input;

  return `[Unit]
Description=Declastruct socat port forward ${service.listenHost}:${service.listenPort} -> ${service.connectHost}:${service.connectPort}
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/socat TCP-LISTEN:${service.listenPort},bind=${service.listenHost},fork,reuseaddr TCP:${service.connectHost}:${service.connectPort}
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
`;
};
