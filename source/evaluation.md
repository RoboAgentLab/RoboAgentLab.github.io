# Evaluation and replay

## Run a task–seed grid

Run evaluation scripts from the repository checkout, outside an experiment directory that already loads a robot. Replace `provider/model` with your configured model:

```bash
cd ~/RoboAgentLab
source services/.venv-libero/pi-embodied.env
packages/embodied/src/robots/libero/eval.sh \
  runs/libero-units libero_10 0-9 0-2 \
  --libero-type standard --units=true \
  --model provider/model --max-turns 40 --time-limit 900
```

This selects tasks 0–9 and seeds 0–2. Each cell records a session and `result.json`. Use a separate output directory for each model and configuration.

Rerunning the same grid retries invalid cells and preserves valid completed outcomes, including failures. The evaluator checks configuration consistency so that different settings do not silently share an output directory.

## Read outcomes

The `robot_result` entry stores the robot's outcome, timing, and configuration. Separate the environment's success signal from the agent's claimed outcome. For example, LIBERO uses its `terminated` flag; real robots use operator verdicts.

Planner failures and environment errors are distinct from valid task failures. Keep them visible when reporting evaluation results.

## Start a single episode

`/embodied-run` starts one episode of an experiment created by `/embodied-setup`. Run it from the directory that holds the experiment directories. It reads each experiment's recorded setting, asks for the task flags, a GPU, the budget, and the panels, then runs the episode in the terminal, in the background through the agent, or prints the command. A request selects the robot or overrides the setting, for example `/embodied-run metaworld privileged code`.

## Inspect a session

Add `--dashboard=true` to an interactive run and open the URL printed at startup. The dashboard shows the session's observations, tool calls, and robot state. It follows pi's session history, including resumed or forked sessions.

`--dashboard-port 8765` fixes the port; `/embodied-run` uses 8765, or the next free port when it is taken. The dashboard listens on `127.0.0.1`, so forward the port to view it from another computer:

```bash
ssh -N -L 8765:127.0.0.1:8765 <gpu-host>
```

Some integrations also serve their own panel. CaP-X's Viser 3D view (`--viser --viser-port 8080`) shows point clouds, camera frustums, the end effector, and grasp candidates for LIBERO and Franka. `/embodied-run` offers a reproduced work's own panel first.

Use `/export` in pi to export the session. With this fork's export hook, the dashboard also offers JSONL and HTML downloads.

## Parallel runs

`packages/embodied/src/scripts/eval-parallel.sh` dispatches cells across worker processes and selected GPUs. Simulator memory is allocated per process, so choose concurrency for the backend and GPU rather than reusing a single setting for every environment.

See [the evaluator source](https://github.com/RoboAgentLab/RoboAgentLab/blob/main/packages/embodied/src/scripts/eval-parallel.sh) and the robot's own `eval.sh` for its exact cell format.
