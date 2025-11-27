import { given, when, then } from 'test-fns';

import { castFromOsUnixSystemdSocatService } from './castFromOsUnixSystemdSocatService';
import { OsUnixSystemdSocatService } from './dobj.OsUnixSystemdSocatService';

describe('castFromOsUnixSystemdSocatService', () => {
  given('data-driven test cases for systemd socat service formatting', () => {
    const testCases: Array<{
      name: string;
      given: { service: OsUnixSystemdSocatService };
    }> = [
      {
        name: 'postgres port forward',
        given: {
          service: {
            uri: '/etc/systemd/system/my-postgres-forward.service',
            listenHost: '127.0.0.1',
            listenPort: 5432,
            connectHost: '127.0.0.1',
            connectPort: 15432,
          },
        },
      },
      {
        name: 'web forward with different hosts',
        given: {
          service: {
            uri: '/etc/systemd/system/web-forward.service',
            listenHost: '0.0.0.0',
            listenPort: 8080,
            connectHost: '192.168.1.100',
            connectPort: 80,
          },
        },
      },
      {
        name: 'mysql forward',
        given: {
          service: {
            uri: '/etc/systemd/system/mysql-forward.service',
            listenHost: '127.0.0.1',
            listenPort: 3306,
            connectHost: 'localhost',
            connectPort: 13306,
          },
        },
      },
    ];

    when('formatted', () => {
      then('correctly formats postgres port forward', () => {
        const result = castFromOsUnixSystemdSocatService(testCases[0]!.given);
        expect(result).toMatchInlineSnapshot(`
"[Unit]
Description=Declastruct socat port forward 127.0.0.1:5432 -> 127.0.0.1:15432
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/socat TCP-LISTEN:5432,bind=127.0.0.1,fork,reuseaddr TCP:127.0.0.1:15432
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
"
`);
      });

      then('correctly formats web forward with different hosts', () => {
        const result = castFromOsUnixSystemdSocatService(testCases[1]!.given);
        expect(result).toMatchInlineSnapshot(`
"[Unit]
Description=Declastruct socat port forward 0.0.0.0:8080 -> 192.168.1.100:80
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/socat TCP-LISTEN:8080,bind=0.0.0.0,fork,reuseaddr TCP:192.168.1.100:80
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
"
`);
      });
    });
  });
});
