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

## Inspect a session

Add `--dashboard=true` to an interactive run and open the URL printed at startup. The dashboard shows the session's observations, tool calls, and robot state. It follows pi's session history, including resumed or forked sessions.

Use `/export` in pi to export the session. With this fork's export hook, the dashboard also offers JSONL and HTML downloads.

## Parallel runs

`packages/embodied/src/scripts/eval-parallel.sh` dispatches cells across worker processes and selected GPUs. Simulator memory is allocated per process, so choose concurrency for the backend and GPU rather than reusing a single setting for every environment.

See [the evaluator source](https://github.com/RoboAgentLab/RoboAgentLab/blob/main/packages/embodied/src/scripts/eval-parallel.sh) and the robot's own `eval.sh` for its exact cell format.
