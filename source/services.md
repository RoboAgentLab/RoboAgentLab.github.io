# Services and deployment

Each backend runs in its own Python environment. This lets the agent reuse robotics capabilities without combining incompatible simulator, Torch, or Transformers dependencies into one installation.

## Configure a deployment

Global configuration lives in `~/.pi/agent/embodied.json`. A project's `.pi/embodied.json` overrides it. `PI_EMBODIED_CONFIG` selects a different global configuration file.

Example profile — replace the paths and endpoints for your machine:

```json
{
  "deployments": {
    "gpu-box": {
      "services": {
        "sam3": "http://127.0.0.1:18300",
        "ik": "http://127.0.0.1:18500"
      },
      "python": {
        "default": "/home/me/RoboAgentLab/services/.venv-libero/bin/python",
        "maniskill": "/home/me/RoboAgentLab/services/.venv-maniskill/bin/python"
      },
      "services_dir": "/home/me/RoboAgentLab/services",
      "dirs": {"logs": "/data/roboagentlab/logs"},
      "cuda_device": "1"
    }
  }
}
```

Select it with `--deployment gpu-box` and inspect it with `/embodied-config`.

## Start or attach

Robot extensions can start their environment server from the configured services checkout. `--env-url` attaches to an existing server. Model services have separate endpoints.

`--serve-models vla,sam3,molmo` requests automatic startup of those model services. To attach to a service already running on its port, configure the endpoint and omit the corresponding automatic-start request.

The services communicate through JSON RPC at `POST /call`, with health and lifecycle operations. See the [protocol specification](https://github.com/RoboAgentLab/RoboAgentLab/blob/main/services/PROTOCOL.md) for method contracts and server behavior.

## Container deployment

The intended container boundary is one service environment per backend, with checkpoints and datasets mounted separately. The current setup scripts provision virtual environments; prebuilt RoboAgentLab Docker images are not part of the v1.0 release.

## Preflight checks

Before starting an episode, run the matching check:

```bash
node packages/embodied/src/infra/check.ts libero --units
```

Inside a robot session, `/robot-check` checks the active configuration. It reports missing imports, assets, endpoints, and runtime requirements.
