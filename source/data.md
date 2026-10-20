# Data collection

RoboAgentLab connects two kinds of interaction data: robot task execution and robotics software development.

## Agent–robot interaction traces

pi sessions retain the agent's observations, decisions, tool calls, and feedback. These traces support inspecting behavior and constructing supervision for a compact, fast policy agent.

Use session export for the agent-level trace. For step-level robot trajectories, enable:

```text
--collect-flywheel-data=true
```

The default data root is `~/.pi/embodied/datacollection`. Collection is supported by the corresponding backend adapters, including LIBERO, RoboCasa, RoboTwin, MetaWorld, Genesis, robosuite, and ManiSkill. Consult the backend reference for additional support and action layouts.

## Export LeRobot data

Install the dedicated export environment:

```bash
services/setup.sh flywheel
```

Use `/flywheel-export [selection]` in a configured session, or the CLI:

```bash
services/.venv-flywheel/bin/python \
  -m pi_embodied_services.flywheel.cli export-lerobot \
  --data-root ~/.pi/embodied/datacollection \
  --robot robocasa --select target/PnPCounterToCab
```

The exporter writes LeRobot v3 data with shared features such as `observation.images.<camera>`, `observation.state`, `action`, and `action_source`. Preserve the robot and action-space metadata when combining episodes.

## Robotics R&D traces

Development sessions record how coding agents implement adapters, configure services, run tests, inspect failures, and revise experiments. This is a separate corpus from robot control trajectories. The research direction is to distill these workflows from general foundation models and post-train open models for Robotics R&D.

## Dataset collections

- [Policy interactions](https://huggingface.co/datasets/RoboAgentLab/pi-embodied-policy-interactions)
- [Robotics R&D interactions](https://huggingface.co/datasets/RoboAgentLab/pi-embodied-rd-interactions)

Each dataset's card describes its current contents and format. Training compact policy agents and specialized R&D agents are the two intended uses of these collections.
