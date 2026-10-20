# Build your robotics experiment

RoboAgentLab connects a coding agent to robot environments, policies, and tools. Start with one simulation episode, inspect its interaction trace, then change the model, interface, or environment.

::::{grid} 1 2 2 2
:gutter: 3

:::{grid-item-card} Run your first episode
:link: quickstart
:link-type: doc

Install the extension and use `/embodied-setup` to configure LIBERO.
:::
:::{grid-item-card} Choose an agent interface
:link: modes
:link-type: doc

Use action units, native tools, or generated Python programs.
:::
:::{grid-item-card} Evaluate and inspect
:link: evaluation
:link-type: doc

Run task–seed grids, inspect outcomes, and replay sessions.
:::
:::{grid-item-card} Add your own integration
:link: development
:link-type: doc

Expose a robot or algorithm through a service, extension, and skill.
:::
::::

## How the pieces fit together

**pi** provides the agent loop, model access, and sessions. **Robot extensions** register observations and callable capabilities. **Python services** run simulators, robot adapters, perception, and policies in their own environments. **Skills** explain how the agent should use them. A shared primitive declaration also exposes supported operations to generated Python programs.

The platform code is available in [RoboAgentLab/RoboAgentLab](https://github.com/RoboAgentLab/RoboAgentLab). The [v1.0 source release](https://github.com/RoboAgentLab/RoboAgentLab/releases/tag/v1.0) is a fixed snapshot; these guides follow the maintained `main` branch.

```{toctree}
:caption: Get started
:maxdepth: 2

quickstart
installation
```

```{toctree}
:caption: Run experiments
:maxdepth: 2

environments
modes
services
evaluation
data
```

```{toctree}
:caption: Extend the platform
:maxdepth: 2

development
reference
```
