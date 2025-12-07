import { given, then, when } from 'test-fns';

import { castIntoOsUnixSystemdSocatService } from './castIntoOsUnixSystemdSocatService';
import type { OsUnixSystemdSocatService } from './dobj.OsUnixSystemdSocatService';

describe('castIntoOsUnixSystemdSocatService', () => {
  given('data-driven test cases for systemd socat service parsing', () => {
    const testCases: Array<{
      name: string;
      given: { content: string; uri: string };
      then: { expect: OsUnixSystemdSocatService };
    }> = [
      {
        name: 'standard socat service unit',
        given: {
          content: `[Unit]
Description=Declastruct socat port forward 127.0.0.1:5432 -> 127.0.0.1:15432
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/socat TCP-LISTEN:5432,bind=127.0.0.1,fork,reuseaddr TCP:127.0.0.1:15432
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target`,
          uri: '/etc/systemd/system/my-postgres-forward.service',
        },
        then: {
          expect: {
            uri: '/etc/systemd/system/my-postgres-forward.service',
            listenHost: '127.0.0.1',
            listenPort: 5432,
            connectHost: '127.0.0.1',
            connectPort: 15432,
          },
        },
      },
      {
        name: 'socat with different hosts',
        given: {
          content: `[Service]
ExecStart=/usr/bin/socat TCP-LISTEN:8080,bind=0.0.0.0,fork,reuseaddr TCP:192.168.1.100:80`,
          uri: '/etc/systemd/system/web-forward.service',
        },
        then: {
          expect: {
            uri: '/etc/systemd/system/web-forward.service',
            listenHost: '0.0.0.0',
            listenPort: 8080,
            connectHost: '192.168.1.100',
            connectPort: 80,
          },
        },
      },
      {
        name: 'socat with localhost target',
        given: {
          content: `[Service]
ExecStart=/usr/bin/socat TCP-LISTEN:3306,bind=127.0.0.1,fork,reuseaddr TCP:localhost:13306`,
          uri: '/etc/systemd/system/mysql-forward.service',
        },
        then: {
          expect: {
            uri: '/etc/systemd/system/mysql-forward.service',
            listenHost: '127.0.0.1',
            listenPort: 3306,
            connectHost: 'localhost',
            connectPort: 13306,
          },
        },
      },
    ];

    when('parsed', () => {
      testCases.forEach((testCase) => {
        then(`correctly parses: ${testCase.name}`, () => {
          const result = castIntoOsUnixSystemdSocatService(testCase.given);
          expect(result).toEqual(testCase.then.expect);
        });
      });
    });
  });

  given('service units that are not socat services', () => {
    const testCases: Array<{
      name: string;
      given: { content: string; uri: string };
      then: { expect: null };
    }> = [
      {
        name: 'nginx service',
        given: {
          content: `[Service]
ExecStart=/usr/sbin/nginx -g 'daemon off;'`,
          uri: '/etc/systemd/system/nginx.service',
        },
        then: { expect: null },
      },
      {
        name: 'empty content',
        given: {
          content: '',
          uri: '/etc/systemd/system/empty.service',
        },
        then: { expect: null },
      },
      {
        name: 'different socat command format',
        given: {
          content: `[Service]
ExecStart=/usr/bin/socat UNIX-LISTEN:/tmp/sock,fork UNIX-CONNECT:/var/run/other.sock`,
          uri: '/etc/systemd/system/unix-socket-forward.service',
        },
        then: { expect: null },
      },
    ];

    when('parsed', () => {
      testCases.forEach((testCase) => {
        then(`returns null for: ${testCase.name}`, () => {
          const result = castIntoOsUnixSystemdSocatService(testCase.given);
          expect(result).toBeNull();
        });
      });
    });
  });
});
