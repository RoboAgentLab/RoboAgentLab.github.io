# Environments and robots

Choose a backend independently of the planner model. Each integration defines its observations, actions, configuration, and success signal.

## Simulation

| Environment | Setup target | Example task |
|---|---|---|
| LIBERO | `libero` | `--libero-type standard --suite libero_10 --task 0 --seed 0` |
| LIBERO-PRO | `libero-pro` | `--libero-type pro --suite libero_10_task --task 0 --seed 0` |
| LIBERO-Plus | `libero-plus` | select its task suite with `--libero-type plus` |
| ManiSkill | `maniskill` | `--task PickCube-v1 --seed 0` |
| MetaWorld | `metaworld` | `--task reach-v3 --seed 0` |
| robosuite | `robosuite` | `--task Lift --seed 0` |
| Genesis | `genesis` | `--task cube_pick --seed 0` |
| RoboCasa | `robocasa` | `--task OpenDrawer --split target --seed 0` |
| RoboTwin | `robotwin` | `--task beat_block_hammer --task-config demo_randomized --seed 0` |
| RoboLab | `robolab` | `--task BananaInBowlTask --seed 0` |
| RoboDojo | `robodojo` | task name and evaluation layout as `--seed` |
| BEHAVIOR-1K | `behavior` | activity name and scene instance |
| HumanCLAW | `humanclaw` | its humanoid task configuration |

MuJoCo environments use EGL, ManiSkill and RoboTwin use Vulkan/SAPIEN, and RoboLab, RoboDojo, and BEHAVIOR use Isaac Sim-based environments. Install and check each target in its own environment.

Mode availability and task coverage depend on the backend. For example, HumanCLAW has its own action-unit vocabulary, and RoboDojo's Isaac Sim 6.1 configuration runs 48 of its 54 tasks. The [backend reference](reference.md) records these distinctions.

## Physical robots

| Robot | Setup target | Configuration |
|---|---|---|
| Franka | `franka` or `franka-polymetis` | robot YAML, cameras, calibration, operator |
| Dual Franka | `dual-franka` | two controllers and synchronized observations |
| Piper / dual Piper | `piper` | ROS environment, robot YAML, operator |
| UR5e | `ur5e` | controller identity, Robotiq gripper, cameras, calibration |

Real-robot runs use the configured workspace and motion limits and record operator verdicts. Follow the adapter's setup instructions for the specific controller and camera rig before launching an episode.

## Load a robot directly

Outside a wizard-created experiment directory, a single extension can be loaded explicitly:

```bash
cd ~/RoboAgentLab
source services/.venv-libero/pi-embodied.env
pi -e packages/embodied/src/robots/libero \
  --libero-type standard --suite libero_10 --task 0 --seed 0 \
  --units=true --max-turns 40 --time-limit 900
```

Use either this explicit loading pattern or an experiment's `.pi/settings.json`. Loading both registers the same tools twice.
