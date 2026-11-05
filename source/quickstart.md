# Quickstart

Run a **LIBERO episode with action units**, then open the live dashboard. This route uses a multimodal planner directly and does not require a VLA checkpoint.

## 1. Prepare a GPU machine

Use Linux with an NVIDIA GPU and EGL support, Node.js **22.19 or newer**, and [uv](https://docs.astral.sh/uv/getting-started/installation/) or Python 3.11. Allow approximately 25 GB of free disk space for the Python environment, installation cache, and assets. GitHub and Hugging Face must be reachable.

Build pi from the RoboAgentLab checkout and link that local CLI:

```bash
git clone https://github.com/RoboAgentLab/RoboAgentLab ~/RoboAgentLab
cd ~/RoboAgentLab
npm ci --ignore-scripts
npm run build
npm link --ignore-scripts --workspace @earendil-works/pi-coding-agent
pi install ./packages/embodied
mkdir -p ~/robot-runs
cd ~/robot-runs
pi
```

`npm link` makes `pi` run the CLI built inside this checkout. See [installation](installation.md#check-your-local-cli) if another pi installation is already on your `PATH`, and for updating the checkout.

Use a planner that accepts images. Inside pi, run `/login` to configure a supported provider, or add a [self-hosted model](services.md#self-hosted-planners).

## 2. Run the setup wizard

Inside the interactive pi session, enter:

```text
/embodied-setup
```

The wizard asks one question at a time. Choose the following for a first run:

| Question | Choose |
|---|---|
| Simulation or real robot? | sim |
| Robot or benchmark | LIBERO |
| Observation × Execution | **O1 × A1 Code**: camera frames only, action units |
| Work to reproduce | `showharness` (Show-Harness's setting), or none for the plain cell |
| Where do the services run? | here (this machine) |
| Planner model | your image-capable model; type to filter the list |
| Experiment directory | the default, `~/robot-runs/embodied-libero` |

The observation × execution grid is the survey's Agent-as-Policy taxonomy. Use the arrow keys to move between cells; cells a robot does not support are shown as `–`. Each cell shows its definition, the flags it adds, and how many surveyed works use it. See [agent interfaces](modes.md) for every level.

You can also describe the experiment after the command, and the wizard asks only for what you did not name:

```text
/embodied-setup reproduce Show-Harness on LIBERO here
```

The confirmation lists the robot, the setting and its flags, what the install needs, and the launch command. After you confirm, the agent follows the bundled `embodied-quickstart` skill: it installs the Python environment and scene assets, runs the preflight checks, and ends with the launch command. It does not start an episode. The wizard writes the experiment's `.pi/settings.json`, which loads the robot and dashboard, and records the chosen setting in `.pi/embodied-setup.json`.

If you select a remote GPU box, pi, the checkout, and the experiment run on that box over SSH. See [installation](installation.md) for a manual setup.

## 3. Start the episode

Exit the setup session, start pi in the same directory where you ran the wizard, and enter:

```text
/embodied-run
```

It finds the experiment directories there and reads their recorded setting. Then it asks for the task flags, a GPU (the one with the most free memory is listed first), the episode budget, and how to run.

`/embodied-run` also takes the text you gave `/embodied-setup`, and words for the episode answer its questions:

```text
/embodied-run reproduce Show-Harness on LIBERO task 3 seed 1 gpu 2 20 turns headless
```

The robot and setting in the text select the installed experiment. `task`, `seed`, a LIBERO suite such as `libero_90`, `gpu`, `turns`, and `headless` or `print` apply to this episode only, and `/embodied-setup` ignores them. A planner named in the text is used for this episode. `/embodied-run` never installs anything. If nothing installed matches the text, it says so and offers to run `/embodied-setup` with the same text.

The ways to run:

| Choice | What happens |
|---|---|
| here | pi takes this terminal and starts the episode immediately |
| headless | the agent runs the episode in the background and reports the result |
| print | the command is shown for you to run yourself |

The first start in an experiment directory asks whether to trust the project; accept it so that the robot extension loads. The command `/embodied-run` builds for this setup is equivalent to:

```bash
cd ~/robot-runs/embodied-libero
source ~/RoboAgentLab/services/.venv-libero/pi-embodied.env
pi --libero-type standard --suite libero_10 --task 0 --seed 0 \
  --preset showharness --max-turns 40 --time-limit 900 \
  --dashboard=true --dashboard-port 8765 "Solve the task."
```

The agent receives camera observations and chooses movement, grasp, and release units. The run is bounded to 40 turns or 900 seconds. For a model that supports configurable reasoning, you can add `--thinking low`.

## 4. Inspect what happened

Open the dashboard at `http://127.0.0.1:8765/` to follow observations and tool calls. The dashboard listens only on the machine that runs pi. From your own computer, forward the port first; `/embodied-run` prints this command when pi runs over SSH:

```bash
ssh -N -L 8765:127.0.0.1:8765 <gpu-host>
```

A `LocalForward 8765 127.0.0.1:8765` line in that host's SSH configuration makes every SSH session carry it.

At the end, inspect the `robot_result` entry: `terminated` is the environment's success signal, while `claimed` is the agent's reported outcome. `planner_budget_exhausted` shows when the turn or time budget ended the episode.

Use `/export` for a shareable session view. Continue to [evaluation and replay](evaluation.md) to run several tasks or [data collection](data.md) to export trajectories.

:::{tip}
For a non-interactive episode, use the same flags with `pi -a -p` and close standard input: `pi -a -p <flags> "Solve the task." < /dev/null`. Without the redirect, `pi -p` waits for standard input to end, which never happens over SSH or from an agent's shell. The `-a` option approves loading this experiment's extensions for that invocation.
:::

## Common setup issues

| Symptom | What to check |
|---|---|
| No planner configured | Run `/login` or add your provider to `models.json`, then restart the wizard. |
| `node` is missing in preflight | Put Node.js 22.19+ on `PATH`; an installer's private Node may not be on your shell's path. |
| Python or environment import fails | Source the `pi-embodied.env` file for the selected backend. |
| Missing LIBERO assets | Run `services/setup.sh libero`; the default installation downloads the scene assets. |
| Duplicate tools or flags | Load one robot per process. Run evaluation scripts from the checkout, outside a configured experiment directory. |
| The dashboard does not open from your computer | Forward its port with `ssh -L` as shown above; it listens on `127.0.0.1` only. |
| A headless run never starts | Add `< /dev/null` to the `pi -p` command. |
| GPU renderer fails | Check the NVIDIA driver and EGL installation on the machine running the services. |
