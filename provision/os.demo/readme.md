# os.demo

dogfoods the unix-network resources against a real target.

## resources

- `resources.ts` declares one of every resource this package manages:
  - **`DeclaredUnixPortAlias`** — a systemd-socat forward `127.0.0.1:9432` → `:8432`
  - **`DeclaredUnixSshKeypair`** — a minted ed25519 key (findsert-only)
  - **`DeclaredUnixSshAlias`** — an `~/.ssh/config` `Host` block that uses that key

## purpose

dogfood our own package — the same provider + domain objects consumers import —
to prove the plan → apply → re-plan (idempotent) lifecycle works end-to-end for
each resource type.

## targets

the demo picks its target from `OS_DEMO_SANDBOX`:

| mode | systemd unit | ssh key + config | side effects |
|------|--------------|------------------|--------------|
| real host (default) | `/etc/systemd/system` | `~/.ssh` | writes unit + `daemon-reload/enable/restart` (sudo); mints a real key; writes a real `~/.ssh/config` block |
| sandbox (`OS_DEMO_SANDBOX=true`) | `provision/os.demo/.temp/root/etc/systemd/system` | `provision/os.demo/.temp/root/.ssh` | writes real files; no sudo, no systemctl |

real host is the default so this genuinely dogfoods the package — the same way
`declastruct-aws` provisions a real demo account. use the sandbox mode for a
no-privilege preview that still writes + reads back real files.

## prereqs (real host)

1. `socat` installed — the unit's `ExecStart` calls `/usr/bin/socat`
   (`sudo apt-get install -y socat` or `sudo dnf install -y socat`)
2. `ssh-keygen` available (ships with openssh — mints the demo key)
3. `sudo` available — the apply writes to `/etc/systemd/system` and runs
   `systemctl daemon-reload/enable/restart`

## apply — real host (default, needs sudo)

```bash
# plan
npx declastruct plan \
  --wish provision/os.demo/resources.ts \
  --into provision/os.demo/.temp/plan.json

# apply — creates the socat service, mints ~/.ssh/declastruct-unix-network.demo,
# and writes a Host block into ~/.ssh/config, all on THIS machine
npx declastruct apply \
  --plan provision/os.demo/.temp/plan.json

# re-plan — proves idempotency (every change is KEEP)
npx declastruct plan \
  --wish provision/os.demo/resources.ts \
  --into provision/os.demo/.temp/plan.json
```

verify each resource:

```bash
# port alias
systemctl status declastruct-socat-127-0-0-1-9432.service
ss -ltn 'sport = :9432'

# ssh keypair
cat ~/.ssh/declastruct-unix-network.demo.pub

# ssh alias
ssh -G declastruct-unix-network.demo | grep -E '^(hostname|port|user|identityfile) '
```

teardown when done (declarative delete of the port alias is on the roadmap):

```bash
sudo systemctl disable --now declastruct-socat-127-0-0-1-9432.service
sudo rm /etc/systemd/system/declastruct-socat-127-0-0-1-9432.service
sudo systemctl daemon-reload
rm ~/.ssh/declastruct-unix-network.demo ~/.ssh/declastruct-unix-network.demo.pub
# then remove the `Host declastruct-unix-network.demo` block from ~/.ssh/config
```

## apply — sandbox (opt-in, no sudo)

```bash
OS_DEMO_SANDBOX=true npx declastruct plan \
  --wish provision/os.demo/resources.ts \
  --into provision/os.demo/.temp/plan.json

OS_DEMO_SANDBOX=true npx declastruct apply \
  --plan provision/os.demo/.temp/plan.json

# inspect the written artifacts (no service is started in sandbox mode)
cat provision/os.demo/.temp/root/etc/systemd/system/declastruct-socat-127-0-0-1-9432.service
cat provision/os.demo/.temp/root/.ssh/config
cat provision/os.demo/.temp/root/.ssh/declastruct-unix-network.demo.pub
```
