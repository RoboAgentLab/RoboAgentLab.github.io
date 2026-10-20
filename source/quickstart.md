# Quickstart

Run a **LIBERO episode with action units**, then open the live dashboard. This route uses a multimodal planner directly and does not require a VLA checkpoint.

## 1. Prepare a GPU machine

Use Linux with an NVIDIA GPU and EGL support, Node.js **22.19 or newer**, and [uv](https://docs.astral.sh/uv/getting-started/installation/) or Python 3.11. Allow approximately 25 GB of free disk space for the Python environment, installation cache, and assets. GitHub and Hugging Face must be reachable.

Build pi from the RoboAgentLab checkout and link that local CLI:

```bash
git clone https://github.com/RoboAgentLab/RoboAgentLab ~/RoboAgentLab
cd ~/RoboAgentLab
npm ci --ignore-scripts
node scripts/hydrate-ci-models.mjs
npm run build:offline
npm link --ignore-scripts --workspace @earendil-works/pi-coding-agent
pi install ./packages/embodied
mkdir -p ~/robot-runs
cd ~/robot-runs
pi
```

`npm link` makes `pi` run the CLI built inside this checkout. Rebuild with `npm run build:offline` after changing pi's source. See [installation](installation.md#check-your-local-cli) if another pi installation is already on your `PATH`.

Use a planner that accepts images. Inside pi, run `/login` to configure a supported provider. For a custom endpoint, configure `~/.pi/agent/models.json` using [pi's model configuration guide](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/models.md).

## 2. Run the setup wizard

Inside the interactive pi session, enter:

```text
/embodied-setup
```

Choose the following for a first run:

| Setting | Choose |
|---|---|
| Robot or benchmark | LIBERO (sim) |
| Mode | units |
| Services | here (this machine) |
| Planner | your configured image-capable model |
| Experiment directory | `~/robot-runs/embodied-libero` |

Review the setup plan and confirm it. The agent follows the bundled `embodied-quickstart` skill to install the Python environment and scene assets, run the preflight checks, and print the launch command. It also writes the experiment's `.pi/settings.json`, which loads the robot and dashboard.

If you select a remote GPU box, pi, the checkout, and the experiment run on that box over SSH. See [installation](installation.md) for a manual setup.

## 3. Start the episode

Exit the setup session and run the printed command. With the paths above:

```bash
cd ~/robot-runs/embodied-libero
source ~/RoboAgentLab/services/.venv-libero/pi-embodied.env
pi --libero-type standard --suite libero_10 --task 0 --seed 0 \
  --units=true --max-turns 40 --time-limit 900 --dashboard=true
```

Accept pi's project trust prompt so that the experiment's robot extension loads. When the scene is ready, type:

```text
Solve the task.
```

The agent receives camera observations and chooses movement, grasp, and release units. The run is bounded to 40 turns or 900 seconds. For a model that supports configurable reasoning, you can add `--thinking low`.

## 4. Inspect what happened

Open the dashboard URL printed in the terminal to follow observations and tool calls. At the end, inspect the `robot_result` entry: `terminated` is the environment's success signal, while `claimed` is the agent's reported outcome.

Use `/export` for a shareable session view. Continue to [evaluation and replay](evaluation.md) to run several tasks or [data collection](data.md) to export trajectories.

:::{tip}
For a non-interactive episode, use the same flags with `pi -a -p` and append `"Solve the task."`. The `-a` option approves loading this experiment's extensions for that invocation.
:::

## Common setup issues

| Symptom | What to check |
|---|---|
| No planner configured | Run `/login` or add your provider to `models.json`, then restart the wizard. |
| `node` is missing in preflight | Put Node.js 22.19+ on `PATH`; an installer's private Node may not be on your shell's path. |
| Python or environment import fails | Source the `pi-embodied.env` file for the selected backend. |
| Missing LIBERO assets | Run `services/setup.sh libero`; the default installation downloads the scene assets. |
| Duplicate tools or flags | Load one robot per process. Run evaluation scripts from the checkout, outside a configured experiment directory. |
| GPU renderer fails | Check the NVIDIA driver and EGL installation on the machine running the services. |
