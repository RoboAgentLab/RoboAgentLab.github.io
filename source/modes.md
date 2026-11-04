# Agent interfaces

RoboAgentLab separates the model from what it observes and how it acts. Keep the environment and task fixed while changing one of three choices: the **observation** the agent is given, the **execution interface** it acts through, and the **planner** that decides.

## Observation × execution

`/embodied-setup` presents the survey's Agent-as-Policy taxonomy as a grid. Each level is a flag; O1 and A2 are a robot's defaults.

| Level | Definition | In RoboAgentLab | Flags |
|---|---|---|---|
| O1 Sensory Inputs | Decisions start from sensory inputs; agent-built perception remains O1. | Camera frames only | none |
| O2 Perception Tools | Decisions use supplied semantic or geometric perception. | SAM3 masks with ids: `detect`, `select_detection`, `reject_detection` | `--detections` (Franka, dual Franka and UR5e: `--segment`), with a SAM3 service |
| O3 Privileged State | Decisions use oracle state unavailable at deployment. | The simulator's ground-truth poses; the result is marked privileged | `--privileged` (simulators only) |
| A1 Code | The agent specifies behaviors; a fixed programmed executor realizes them. | Show-Harness action units run by the robot's motion code | `--units=true` |
| A1 Model | The agent specifies behaviors; a fixed learned executor realizes them. | The robot's VLA skill realizes each request | `--require-skills pi0` (LIBERO), `rldx` (RoboCasa), `lingbot` (RoboTwin), `--vla` (Franka, dual Franka) |
| A2 Tool Orchestration | The agent selects execution APIs and coordinates them. | The robot's own tools: perception, motion, grasping, policies | none |
| A3 Code Synthesis | The agent writes executable logic with conditions, loops, and computation. | `run_code`: Python over the robot's declared primitives | `--code=true` |

A cell combines one observation level with one execution level, for example O2 × A3 is `--code=true --detections`. Not every robot has every cell: RoboCasa and RoboTwin have no A1 Code because their tools are a VLA, HumanCLAW acts only through its motion model (A1 Model), and physical robots have no O3. `--units` and `--code` are alternative interfaces; do not enable both.

## Reproduce a published setting

After you choose a cell, the wizard lists the published settings that RoboAgentLab reproduces in it. Type part of the short name to filter the list. A setting runs as a preset or tier that expands to that work's flags.

| Short name | Work | Cell | Flags | Robots |
|---|---|---|---|---|
| `showharness` | Show-Harness | O1 × A1 Code | `--preset showharness` | any robot with action units |
| `motormind` | MotorMind | O2 × A1 Code | `--preset motormind` | LIBERO |
| `humanclaw` | HumanCLAW | O1 × A1 Model | `--preset humanclaw` | HumanCLAW |
| `rpent` | RPent | O1 × A2 | `--preset rpent` | LIBERO, RoboCasa, Franka, dual Franka |
| `openeta` | OpenETA | O2 × A2 | `--preset openeta` | any |
| `capx-S1` | CaP-X S1 | O3 × A3 | `--tier S1` | simulators with code |
| `capx-S2` … `capx-S4` | CaP-X S2–S4 | O2 × A3 | `--tier S2`, `S3`, `S4` | any robot with code |
| `capx-M1` … `capx-M4` | CaP-X M1–M4 | O2 × A3 | `--tier M1` … `M4` | any robot with code |

The other surveyed works are counted under each cell and recognized by name in a request such as `/embodied-setup reproduce <work> on <robot>`. A work that is not reproduced yet gets a notice with its cells, and the experiment starts from the cell's flags. A name the wizard does not recognize is reported as possibly unsupported.

## Planners

The planner decides each step. Every planner drives every execution interface through the same tool calls, so sessions, results, and evaluation scripts are identical whichever planner ran.

| Planner | Select | Notes |
|---|---|---|
| Frontier API model | `--model provider/model` | Configure with `/login` or `models.json`. |
| Self-hosted model | `--model selfhost/<id>` | An OpenAI-compatible server you run; see [self-hosted planners](services.md#self-hosted-planners). |
| Distilled student | `--model finetuned/<adapter>` | A small VLM with a LoRA adapter served by vLLM; released adapters cover action units. |
| Replay | `--model flash/replay` | A recorded plan replayed with live grounding, without a model. |

The wizard's planner list is searchable: it shows your configured models, the self-hosted planners, and, for A1 Code, the robot's fine-tuned adapter.

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

`--code-api=high`, `low`, `low-noexamples`, or `raw` selects an API tier where supported. The available tier depends on the integration.

`--privileged` explicitly enables additional simulator state for configurations that support it. Keep that flag recorded with results.

## Fine-tuned models and replay

The setup wizard can configure supported fine-tuned adapters served through vLLM. Choose the adapter, prompt convention, and robot together; these are part of the experiment configuration.

Flash replays stored plans with live grounding in supported integrations, including LIBERO, RoboCasa, RoboTwin, ManiSkill, RoboLab, and RoboDojo. It is started by hand rather than from the wizard. Consult the [complete reference](reference.md) for per-robot flags, prompts, and replay requirements.
