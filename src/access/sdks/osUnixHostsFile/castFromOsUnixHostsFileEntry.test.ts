import { given, when, then } from 'test-fns';

import { castFromOsUnixHostsFileEntry } from './castFromOsUnixHostsFileEntry';
import { OsUnixHostsFileEntry } from './dobj.OsUnixHostsFileEntry';

describe('castFromOsUnixHostsFileEntry', () => {
  given('data-driven test cases for hosts file entry formatting', () => {
    const testCases: Array<{
      name: string;
      given: { entry: OsUnixHostsFileEntry };
      then: { expect: string };
    }> = [
      {
        name: 'simple ip and single hostname',
        given: {
          entry: {
            ip: '127.0.0.1',
            hostnames: ['localhost'],
            comment: undefined,
          },
        },
        then: { expect: '127.0.0.1\tlocalhost' },
      },
      {
        name: 'ip with multiple hostnames',
        given: {
          entry: {
            ip: '192.168.1.1',
            hostnames: ['server', 'alias1', 'alias2'],
            comment: undefined,
          },
        },
        then: { expect: '192.168.1.1\tserver\talias1\talias2' },
      },
      {
        name: 'ipv6 localhost',
        given: {
          entry: {
            ip: '::1',
            hostnames: ['localhost', 'ip6-localhost'],
            comment: undefined,
          },
        },
        then: { expect: '::1\tlocalhost\tip6-localhost' },
      },
      {
        name: 'entry with comment',
        given: {
          entry: {
            ip: '192.168.1.100',
            hostnames: ['myhost.local'],
            comment: 'managed by declastruct',
          },
        },
        then: {
          expect: '192.168.1.100\tmyhost.local\t# managed by declastruct',
        },
      },
    ];

    when('formatted', () => {
      testCases.forEach((testCase) => {
        then(`correctly formats: ${testCase.name}`, () => {
          const result = castFromOsUnixHostsFileEntry(testCase.given);
          expect(result).toBe(testCase.then.expect);
        });
      });
    });
  });
});
