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

## Self-hosted planners

A planner can be a model you serve yourself through an OpenAI-compatible API. The setup wizard always offers three self-hosted Qwen3.8 planners:

| Planner | Engine | Weights | Hardware |
|---|---|---|---|
| `selfhost/qwen3.8-27b-bf16` | [vLLM](https://docs.vllm.ai/) | Qwen3.8-27B BF16, unquantized (55.6 GB) | a GPU with 80 GB or more |
| `selfhost/qwen3.8-27b` | [NInfer](https://github.com/Neroued/ninfer) | Qwen3.8-27B NVFP4 | RTX 5090 or DGX Spark |
| `selfhost/qwen3.8-flash-next-unsloth-q8_0` | [Strata](https://github.com/Niko1221/Strata) | Qwen3.8-Flash-Next Q8_0 | an NVIDIA GPU and about 140 GB of RAM for the experts |

Describe where each one runs in the deployment's `selfhost` entry, keyed by model id:

```json
{
  "deployments": {
    "default": {
      "selfhost": {
        "qwen3.8-27b-bf16": {
          "base_url": "http://127.0.0.1:18180/v1",
          "start": "selfhost-planner vllm start",
          "stop": "selfhost-planner vllm stop",
          "run_on": "the workstation that reaches the GPU host"
        }
      }
    }
  }
}
```

`base_url` is the address as the robot machine reaches the server. Requests carry the episode's camera images, often more than a megabyte each, so route the tunnel through a host with a fast link to the GPU host rather than through a slow uplink. `start` and `stop` are shell commands, and `run_on` names the machine where they must run when it is not the robot machine. When you pick a self-hosted planner, the setup agent starts the server if `base_url` does not answer (with `run_on`, it gives you the command to run there), registers the model under the `selfhost` provider in `~/.pi/agent/models.json`, and checks one image request and one tool call. Without a deployment entry, it sets the engine up on a machine you name. `/embodied-run` checks that the server answers before an episode and prints its start command when it does not.

A registered self-hosted model looks like this in `models.json`:

```json
{
  "providers": {
    "selfhost": {
      "api": "openai-completions",
      "apiKey": "none",
      "compat": { "supportsDeveloperRole": false, "maxTokensField": "max_tokens", "thinkingFormat": "qwen-chat-template" },
      "models": [
        { "id": "qwen3.8-27b-bf16", "baseUrl": "http://127.0.0.1:18180/v1", "input": ["text", "image"],
          "reasoning": true, "contextWindow": 65536, "maxTokens": 8192 }
      ]
    }
  }
}
```

vLLM serves any Hugging Face checkpoint in BF16. Start it with the Qwen reasoning and tool-call parsers so that the planner's thinking and tool calls are parsed:

```bash
vllm serve <model-dir> --served-model-name qwen3.8-27b-bf16 --dtype bfloat16 \
  --max-model-len 65536 --reasoning-parser qwen3 \
  --enable-auto-tool-choice --tool-call-parser qwen3_coder \
  --enable-prefix-caching --max-num-seqs 8 --limit-mm-per-prompt '{"image": 8}'
```

NInfer builds only for RTX 5090 and DGX Spark, and its artifacts are quantized. Strata keeps the Flash-Next experts in system RAM; under a smaller memory limit it can read them from disk with `--set mmap-experts=on`, at roughly one token per second, which is too slow for episodes.

When the GPU host and the robot machine cannot reach each other, forward the port through a machine that reaches both:

```bash
ssh -f -N -L 18180:127.0.0.1:8000 <gpu-host>
ssh -f -N -R 18180:127.0.0.1:18180 <robot-host>
```

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
