import { given, when, then } from 'test-fns';

import { castIntoOsUnixHostsFileEntry } from './castIntoOsUnixHostsFileEntry';
import { OsUnixHostsFileEntry } from './dobj.OsUnixHostsFileEntry';

describe('castIntoOsUnixHostsFileEntry', () => {
  given('data-driven test cases for hosts file entry parsing', () => {
    const testCases: Array<{
      name: string;
      given: { line: string };
      then: { expect: OsUnixHostsFileEntry };
    }> = [
      {
        name: 'simple ip and single hostname',
        given: { line: '127.0.0.1\tlocalhost' },
        then: {
          expect: {
            ip: '127.0.0.1',
            hostnames: ['localhost'],
            comment: undefined,
          },
        },
      },
      {
        name: 'ip with multiple hostnames',
        given: { line: '192.168.1.1\tserver\talias1\talias2' },
        then: {
          expect: {
            ip: '192.168.1.1',
            hostnames: ['server', 'alias1', 'alias2'],
            comment: undefined,
          },
        },
      },
      {
        name: 'ipv6 localhost',
        given: { line: '::1\tlocalhost\tip6-localhost' },
        then: {
          expect: {
            ip: '::1',
            hostnames: ['localhost', 'ip6-localhost'],
            comment: undefined,
          },
        },
      },
      {
        name: 'line with inline comment',
        given: {
          line: '192.168.1.100\tmyhost.local\t# managed by declastruct',
        },
        then: {
          expect: {
            ip: '192.168.1.100',
            hostnames: ['myhost.local'],
            comment: 'managed by declastruct',
          },
        },
      },
      {
        name: 'spaces instead of tabs',
        given: { line: '10.0.0.1 server1 server2' },
        then: {
          expect: {
            ip: '10.0.0.1',
            hostnames: ['server1', 'server2'],
            comment: undefined,
          },
        },
      },
      {
        name: 'mixed tabs and spaces',
        given: { line: '10.0.0.2\t  server3   server4' },
        then: {
          expect: {
            ip: '10.0.0.2',
            hostnames: ['server3', 'server4'],
            comment: undefined,
          },
        },
      },
      {
        name: 'line with leading whitespace',
        given: { line: '  127.0.0.1\ttest' },
        then: {
          expect: { ip: '127.0.0.1', hostnames: ['test'], comment: undefined },
        },
      },
      {
        name: 'line with trailing whitespace',
        given: { line: '127.0.0.1\ttest  ' },
        then: {
          expect: { ip: '127.0.0.1', hostnames: ['test'], comment: undefined },
        },
      },
    ];

    when('parsed', () => {
      testCases.forEach((testCase) => {
        then(`correctly parses: ${testCase.name}`, () => {
          const result = castIntoOsUnixHostsFileEntry(testCase.given);
          expect(result).toEqual(testCase.then.expect);
        });
      });
    });
  });

  given('lines that should be skipped', () => {
    const testCases: Array<{
      name: string;
      given: { line: string };
      then: { expect: null };
    }> = [
      {
        name: 'empty line',
        given: { line: '' },
        then: { expect: null },
      },
      {
        name: 'whitespace only',
        given: { line: '   \t  ' },
        then: { expect: null },
      },
      {
        name: 'comment-only line',
        given: { line: '# this is a comment' },
        then: { expect: null },
      },
      {
        name: 'comment with leading whitespace',
        given: { line: '  # indented comment' },
        then: { expect: null },
      },
      {
        name: 'ip only (no hostname)',
        given: { line: '127.0.0.1' },
        then: { expect: null },
      },
      {
        name: 'ip with only whitespace after',
        given: { line: '127.0.0.1   \t  ' },
        then: { expect: null },
      },
    ];

    when('parsed', () => {
      testCases.forEach((testCase) => {
        then(`returns null for: ${testCase.name}`, () => {
          const result = castIntoOsUnixHostsFileEntry(testCase.given);
          expect(result).toBeNull();
        });
      });
    });
  });
});
