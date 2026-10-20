# Develop an integration

An integration pairs callable robotics capabilities with instructions that an agent can follow.

## Add a robot

1. Implement the environment facade in the Python services tree.
2. Declare supported primitives and parameter schemas in a robot manifest.
3. Register observations, flags, and lifecycle behavior with `defineRobot(pi, spec)`.
4. Add setup, preflight, and evaluation support for the backend.
5. Write a skill explaining the workflow and how to interpret feedback.

The extension owns robot-specific behavior while pi supplies the agent loop and sessions. Use the [adding-a-robot guide](https://github.com/RoboAgentLab/RoboAgentLab/blob/main/packages/embodied/docs/adding-a-robot.md) for the implementation checklist.

## Add a primitive or algorithm

Expose the capability as a service operation and declare it in `src/primitives/manifests/<robot>.json`. The manifest describes parameters, documentation, capabilities, and API tiers.

That declaration feeds agent tool descriptions and the supported Python program interface. Some tools run on the TypeScript side, such as agent-side policy loops, and are not automatically available to server-side Python.

See [adding a primitive](https://github.com/RoboAgentLab/RoboAgentLab/blob/main/packages/embodied/docs/adding-a-primitive.md) and the [service protocol](https://github.com/RoboAgentLab/RoboAgentLab/blob/main/services/PROTOCOL.md).

## Write a skill

A skill should explain setup requirements, input conventions, the sequence of tool calls, and how to respond to feedback. Keep executable contracts in the service and manifest; use skills for the procedure the agent needs to complete the task.

## Connect other coding agents

The repository includes Codex and Claude Code plugins with an MCP bridge generated from the primitive manifests. This bridge exposes supported environment-side tools, observations, and lifecycle operations. pi remains the entry point for its session modes, evaluation, and dashboard.

See the [host integration files](https://github.com/RoboAgentLab/RoboAgentLab/tree/main/packages/embodied/integrations) and [complete reference](reference.md) for configuration and real-robot operator authorization.
