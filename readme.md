# declastruct-unix-network

![test](https://github.com/ehmpathy/declastruct-unix-network/workflows/test/badge.svg)
![publish](https://github.com/ehmpathy/declastruct-unix-network/workflows/publish/badge.svg)

Declarative control of Unix Network resources, via [declastruct](https://github.com/ehmpathy/declastruct).

Declare the resources you want. Plan to see the changes required. Apply to make it so 🪄


# install

```sh
npm install -s declastruct-unix-network
```

# use via cli

## example

### wish ✨

declare the resources you wish to have - and what state you wish them to be in

```ts
import { UnexpectedCodePathError } from 'helpful-errors';
import { getUnixNetworkProvider, DeclaredUnixHostAlias, DeclaredUnixPortAlias } from 'declastruct-unix-network';

export const getProviders = async (): Promise<DeclastructProvider[]> => [
  getUnixNetworkProvider(
    {},
    {
      log: console,
    },
  ),
];

export const getResources = async (): Promise<DomainEntity<any>[]> => {
  // add host aliases
  const hostAliasPrep = UnixHostAlias.as({
    via: '/etc/hosts',
    from: 'aws.ssmproxy.yourdb.prep',
    into: '127.0.0.1'
  })
  const hostAliasProd = DeclaredUnixHostAlias.as({
    via: '/etc/hosts',
    from: 'aws.ssmproxy.yourdb.prod',
    into: '127.0.0.1'
  })

  // add port aliases
  const portAliasPrep = UnixPortAlias.as({
    via: 'systemd-socat',
    from: { host: '127.0.0.1', port: 5432 },
    into: { host: '127.0.0.1', port: 15432 }
  })
  const portAliasProd = UnixPortAlias.as({
    via: 'systemd-socat',
    from: { host: '127.0.0.1', port: 5433 }, // non standard port, to prevent accidental access
    into: { host: '127.0.0.1', port: 15433 }
  })

  // and return the full set
  return [hostAliasPrep, hostAliasProd, portAliasPrep, portAliasProd];
};
```

### plan 🔮

plan how to achieve the wish of resources you've declared

this will emit a plan that declares the changes required in order to fulfill the wish

```sh
npx declastruct plan --wish provision/network/resources.ts --output provision/network/.temp/plan.json
```

### apply 🪄

apply the plan to fulfill the wish

this will apply only the changes declared in the plan - and only if this plan is still applicable

```sh
npx declastruct apply --plan provision/network/.temp/plan.json
```
