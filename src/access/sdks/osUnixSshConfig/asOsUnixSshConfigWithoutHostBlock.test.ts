import { asOsUnixSshConfigWithoutHostBlock } from './asOsUnixSshConfigWithoutHostBlock';

describe('asOsUnixSshConfigWithoutHostBlock', () => {
  test('splices out the block and keeps peer blocks', () => {
    const content = [
      'Host before',
      '  HostName a',
      'Host grove',
      '  HostName localhost',
      '  Port 2222',
      'Host after',
      '  HostName b',
      '',
    ].join('\n');

    const text = asOsUnixSshConfigWithoutHostBlock({
      content,
      range: { start: 2, endExclusive: 5 },
    });

    expect(text).toEqual(
      ['Host before', '  HostName a', 'Host after', '  HostName b', ''].join(
        '\n',
      ),
    );
  });

  test('collapses to empty when the removal leaves an empty file', () => {
    const content = ['Host grove', '  HostName localhost', ''].join('\n');

    const text = asOsUnixSshConfigWithoutHostBlock({
      content,
      range: { start: 0, endExclusive: 3 },
    });

    expect(text).toEqual('');
  });
});
