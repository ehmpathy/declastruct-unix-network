import { castIntoOsUnixSshConfigHosts } from './castIntoOsUnixSshConfigHosts';
import type { OsUnixSshConfigHost } from './dobj.OsUnixSshConfigHost';

const TEST_CASES: {
  description: string;
  given: { content: string };
  expect: { hosts: OsUnixSshConfigHost[] };
}[] = [
  {
    description: 'parses a single fully-specified Host block',
    given: {
      content: [
        'Host grove.ehmpathy',
        '  HostName localhost',
        '  Port 2222',
        '  User ec2-user',
        '  IdentityFile ~/.ssh/declastruct-demo',
      ].join('\n'),
    },
    expect: {
      hosts: [
        {
          alias: 'grove.ehmpathy',
          hostName: 'localhost',
          port: 2222,
          user: 'ec2-user',
          identityFile: '~/.ssh/declastruct-demo',
        },
      ],
    },
  },
  {
    description: 'parses multiple blocks and keeps each separate',
    given: {
      content: [
        'Host one',
        '  HostName 10.0.0.1',
        '  Port 22',
        '  User alice',
        '  IdentityFile ~/.ssh/one',
        '',
        'Host two',
        '  HostName 10.0.0.2',
        '  Port 2200',
        '  User bob',
        '  IdentityFile ~/.ssh/two',
      ].join('\n'),
    },
    expect: {
      hosts: [
        {
          alias: 'one',
          hostName: '10.0.0.1',
          port: 22,
          user: 'alice',
          identityFile: '~/.ssh/one',
        },
        {
          alias: 'two',
          hostName: '10.0.0.2',
          port: 2200,
          user: 'bob',
          identityFile: '~/.ssh/two',
        },
      ],
    },
  },
  {
    description: 'ignores comments and blank lines',
    given: {
      content: [
        '# a comment',
        '',
        'Host solo',
        '  # inline comment',
        '  HostName example.com',
        '',
      ].join('\n'),
    },
    expect: {
      hosts: [
        {
          alias: 'solo',
          hostName: 'example.com',
          port: null,
          user: null,
          identityFile: null,
        },
      ],
    },
  },
  {
    description: 'treats keywords case-insensitively',
    given: {
      content: ['host shouty', '  HOSTNAME EXAMPLE.NET', '  PORT 2022'].join(
        '\n',
      ),
    },
    expect: {
      hosts: [
        {
          alias: 'shouty',
          hostName: 'EXAMPLE.NET',
          port: 2022,
          user: null,
          identityFile: null,
        },
      ],
    },
  },
  {
    description: 'ends a block at a Match line',
    given: {
      content: [
        'Host before',
        '  HostName a.example',
        'Match host b.example',
        '  User ignored',
      ].join('\n'),
    },
    expect: {
      hosts: [
        {
          alias: 'before',
          hostName: 'a.example',
          port: null,
          user: null,
          identityFile: null,
        },
      ],
    },
  },
  {
    description: 'returns no hosts for empty content',
    given: { content: '' },
    expect: { hosts: [] },
  },
];

describe('castIntoOsUnixSshConfigHosts', () => {
  TEST_CASES.forEach((thisCase) =>
    test(thisCase.description, () => {
      const hosts = castIntoOsUnixSshConfigHosts({
        content: thisCase.given.content,
      });
      expect(hosts).toEqual(thisCase.expect.hosts);
    }),
  );
});
