import { asOsUnixSshConfigWithHostBlock } from './asOsUnixSshConfigWithHostBlock';

const BLOCK = ['Host grove', '  HostName localhost', '  Port 2222'].join('\n');

describe('asOsUnixSshConfigWithHostBlock', () => {
  test('appends the block as the sole block for empty content', () => {
    const text = asOsUnixSshConfigWithHostBlock({
      content: '',
      blockText: BLOCK,
      range: null,
    });

    expect(text).toEqual(`${BLOCK}\n`);
  });

  test('appends after a blank-line separator when content exists', () => {
    const text = asOsUnixSshConfigWithHostBlock({
      content: 'Host other\n  HostName elsewhere\n',
      blockText: BLOCK,
      range: null,
    });

    expect(text).toEqual(`Host other\n  HostName elsewhere\n\n${BLOCK}\n`);
  });

  test('replaces the block in place; peer blocks stay untouched', () => {
    const content = [
      'Host before',
      '  HostName a',
      'Host grove',
      '  HostName old',
      '  Port 22',
      'Host after',
      '  HostName b',
      '',
    ].join('\n');

    const text = asOsUnixSshConfigWithHostBlock({
      content,
      blockText: BLOCK,
      range: { start: 2, endExclusive: 5 },
    });

    expect(text).toEqual(
      [
        'Host before',
        '  HostName a',
        'Host grove',
        '  HostName localhost',
        '  Port 2222',
        'Host after',
        '  HostName b',
        '',
      ].join('\n'),
    );
  });
});
