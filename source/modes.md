# Agent interfaces

RoboAgentLab separates the model from the action interface. Keep the environment and task fixed while changing what the agent can call.

| Interface | Select | Agent output |
|---|---|---|
| Native tools | default | Calls to perception, motion, grasping, or policy tools |
| Action units | `--units=true` | Discrete movement, rotation, grasp, and release units |
| Generated Python | `--code=true` | Programs calling the robot's declared primitives |
| Fine-tuned policy | a `finetuned/<adapter>` model with units | Action units from a served small model or adapter |
| Flash replay | `--model flash/replay` | A recorded plan grounded in current observations |

## Action units

`--units=true` selects the Show-Harness-style unit interface. Arm units include movement directions, grasp, release, and supported rotations. `--units=both` makes units available alongside native tools.

Plugins such as planning, recovery, and variable step sizes can be selected with `--units-plugins`. Their applicability follows the robot's cameras and action capabilities. HumanCLAW uses a separate vocabulary for humanoid navigation and interaction.

## Native tools

Use native tools when the planner should compose capabilities such as segmentation, grounding, motion planning, or VLA execution. For LIBERO, the standard tools configuration uses Pi0.5 and SAM3 services:

```bash
services/setup.sh libero --weights
source services/.venv-libero/pi-embodied.env
packages/embodied/src/robots/libero/serve.sh
```

Start the robot without `--units=true`. The selected robot registers its available tools and observations.

## Generated Python

`--code=true` exposes `run_code`, which executes Python programs through the environment service. The primitive manifest defines the available operations and parameters. `--code=both` retains native tools as well.

`--code-api=high`, `low`, `low-noexamples`, or `raw` selects an API tier where supported. The available tier depends on the integration. Units and code are alternative interfaces; do not enable both.

`--privileged` explicitly enables additional simulator state for configurations that support it. Keep that flag recorded with results.

## Fine-tuned models and replay

The setup wizard can configure supported fine-tuned adapters served through vLLM. Choose the adapter, prompt convention, and robot together; these are part of the experiment configuration.

Flash uses stored plans with live grounding in supported integrations, including LIBERO, RoboCasa, RoboTwin, ManiSkill, RoboLab, and RoboDojo. Consult the [complete reference](reference.md) for per-robot flags, prompts, and replay requirements.
