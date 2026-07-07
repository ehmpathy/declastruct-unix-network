import { homedir } from 'node:os';
import { asExpandedPath } from './asExpandedPath';

describe('asExpandedPath', () => {
  test('expands a bare tilde to the home directory', () => {
    expect(asExpandedPath({ uri: '~' })).toEqual(homedir());
  });

  test('expands a tilde-slash prefix against the home directory', () => {
    expect(asExpandedPath({ uri: '~/.ssh/config' })).toEqual(
      `${homedir()}/.ssh/config`,
    );
  });

  test('passes an absolute path through unchanged', () => {
    expect(asExpandedPath({ uri: '/etc/ssh/config' })).toEqual(
      '/etc/ssh/config',
    );
  });

  test('passes a relative path through unchanged', () => {
    expect(asExpandedPath({ uri: 'relative/path' })).toEqual('relative/path');
  });

  test('does not expand a tilde that is not a home-dir prefix', () => {
    expect(asExpandedPath({ uri: '~otheruser/keys' })).toEqual(
      '~otheruser/keys',
    );
  });

  test('passes an empty string through unchanged', () => {
    expect(asExpandedPath({ uri: '' })).toEqual('');
  });
});
