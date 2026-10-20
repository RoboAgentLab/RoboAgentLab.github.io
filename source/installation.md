# Installation

## Build pi and load the extension

RoboAgentLab contains the full pi fork, its robotics extension, and Python services. Build the harness from this checkout so the CLI and extensions use the same source revision:

```bash
git clone https://github.com/RoboAgentLab/RoboAgentLab ~/RoboAgentLab
cd ~/RoboAgentLab
npm ci --ignore-scripts
node scripts/hydrate-ci-models.mjs
npm run build:offline
npm link --ignore-scripts --workspace @earendil-works/pi-coding-agent
pi install ./packages/embodied
```

The package initially loads only onboarding. `/embodied-setup` creates an experiment configured with one robot.

The catalog command downloads and verifies the pinned model catalog. `build:offline` then builds the repository's packages and CLI from local sources. The first installation and catalog download require a network connection.

## Check your local CLI

```bash
command -v pi
ls -l "$(command -v pi)"
pi --version
```

The linked executable resolves to this checkout's `packages/coding-agent/dist/bundle/cli.js`. If a different pi appears first on your `PATH`, put your npm global binary directory first or invoke the local build directly:

```bash
node ~/RoboAgentLab/packages/coding-agent/dist/bundle/cli.js
```

After pulling source updates, run `npm ci --ignore-scripts`, hydrate the pinned catalog, and rebuild. The global link continues to use the rebuilt CLI.

## Install a backend manually

From the repository root:

```bash
services/setup.sh libero --dry-run
services/setup.sh libero
source services/.venv-libero/pi-embodied.env
node packages/embodied/src/infra/check.ts libero --units
```

The setup script creates a dedicated virtual environment at `services/.venv-<target>`. The generated `pi-embodied.env` uses absolute paths, so it can be sourced before changing directories.

| Option | Purpose |
|---|---|
| `--dry-run` | Print the installation plan. |
| `--weights` | Download the target's model checkpoints. |
| `--no-assets` | Skip scene assets when already provisioned separately. |
| `--venv` | Choose the virtual environment location. |
| `--weights-dir` | Choose checkpoint storage. |

See the [service setup source](https://github.com/RoboAgentLab/RoboAgentLab/blob/main/services/setup.sh) for target-specific dependencies. Isaac Sim and Habitat backends also require their simulator installations and assets.

## Use a remote GPU box

In `/embodied-setup`, choose **a remote GPU box over ssh**, then give the SSH host and checkout location. Setup runs pi and the experiment on that host. You can also SSH in first and follow Quickstart there.

For services that are already running, use a [deployment profile](services.md) to select their endpoints and local Python environments.

## Keep an experiment reproducible

Record the platform commit, model identifier, backend, task, seed, mode, and budget alongside the result. Keep the source release when reproducing a fixed version:

```bash
git clone --branch v1.0 https://github.com/RoboAgentLab/RoboAgentLab RoboAgentLab-v1.0
```

The released tag stays fixed. Update a development checkout with `git pull --ff-only`, then rerun setup for a backend if its dependencies changed.

## pi integration

Robot tools, modes, and onboarding use pi's extension interface. The locally built fork also supplies the session export and queued-message withdrawal hooks used by the dashboard. See [the compatibility notes](https://github.com/RoboAgentLab/RoboAgentLab/blob/main/packages/embodied/docs/pi-compatibility.md) for the extension boundary.
