(() => {
  const dialog=document.getElementById('data-route-dialog');
  if(!dialog)return;
  const routes={
    policy:{label:'Policy interaction distillation',slug:'pi-embodied-policy-interactions',stages:{
      interactions:{title:'Learn from robot-task interactions',description:'A large-model agent observes a task, chooses robot operations, and uses execution feedback to decide its next action. These interactions provide the teacher traces for a compact policy agent.',details:[['Observe','Task instructions and available visual observations establish the context.'],['Decide and act','Messages and tool calls record how the agent selects and executes an operation.'],['Use feedback','Returned observations and tool responses inform the next decision.']]},
      dataset:{title:'Preserve the decision context',description:'The policy dataset stores selected agent task turns with ordered messages, image references, tool calls, and responses. Session and turn identifiers connect each record to its interaction context.',details:[['Conversation','messages · session_id · turn_id'],['Observations and actions','images · media_refs · tool calls and tool responses'],['Source and outcome','model · source · provenance_json · outcome, where recorded']]},
      training:{title:'Distill a large teacher into a small policy agent',description:'The training route uses teacher interactions to train a smaller model to make robot-task decisions. The objective is to preserve useful decision behavior while reducing inference latency.',details:[['Prepare supervision','Select and align observations, action decisions, and feedback from teacher interactions.'],['Distill the policy','Train a compact student on the interaction context and the next decision or tool call.'],['Evaluate the trade-off','Measure task success alongside decision latency and inference cost.']]},
      model:{title:'Fast decisions for robot execution',description:'The target is a compact agentic policy model that can run the observation–decision–action loop through RoboAgentLab and respond quickly during robot tasks.',details:[['Input','Task context, observations, and execution feedback.'],['Decision','Select an action or compose a supported tool call.'],['Evaluation','Compare accuracy and efficiency on simulation benchmarks and robot tasks.']]}
    }},
    rd:{label:'Robotics R&D domain post-training',slug:'pi-embodied-rd-interactions',stages:{
      interactions:{title:'Learn from robotics development',description:'General-model coding agents build and test RoboAgentLab integrations, inspect failures, and revise implementations. Their development interactions form the source material for robotics-specific R&D training.',details:[['Implement','Write adapters, service interfaces, experiment code, and supporting tools.'],['Test','Run checks and experiments; inspect tool output and available test feedback.'],['Revise','Debug failures and improve the implementation or experiment workflow.']]},
      dataset:{title:'Capture the development process',description:'The Robotics R&D dataset stores selected development turns with messages, tool calls, and feedback. Repository context, patches, and test results can accompany the conversation when recorded.',details:[['Development interactions','messages · tool calls and responses · session_id · turn_id'],['Repository context','repository_url · base_commit · patch, where recorded'],['Feedback and provenance','test_result_json · outcome · model · provenance_json, where recorded']]},
      training:{title:'Specialize an existing open-weight model',description:'The route distills robotics-development interactions from general foundation models into a domain dataset, then uses it for post-training an existing open-weight model on Robotics R&D tasks.',details:[['Build the domain dataset','Curate development interactions and their available feedback into task supervision.'],['Post-train an open model','Adapt an existing open-weight base to robotics implementation, testing, and experiment workflows.'],['Evaluate R&D behavior','Measure whether the model completes development tasks and improves the resulting workflows.']]},
      model:{title:'A Robotics R&D agent for RoboAgentLab',description:'The target model operates the RoboAgentLab harness to develop integrations, run experiments, and revise robotics workflows using the available skills, extensions, and services.',details:[['Plan and implement','Turn a research task into code, configuration, and experiment steps.'],['Run and inspect','Use the harness to execute tools and interpret development feedback.'],['Continue development','Revise the system and carry the task into the next experiment.']]}
    }}
  };
  let routeKey='policy',trigger;
  function render(stage){
    const route=routes[routeKey],detail=route.stages[stage];
    document.getElementById('dr-dialog-route').textContent=route.label;
    document.getElementById('dr-dialog-title').textContent=detail.title;
    document.getElementById('dr-dialog-description').textContent=detail.description;
    document.getElementById('dr-dataset-link').href='https://huggingface.co/datasets/RoboAgentLab/'+route.slug;
    dialog.querySelectorAll('[data-dr-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.drView===stage)));
    const grid=document.createElement('div');grid.className='dr-detail-grid';
    detail.details.forEach(([heading,copy])=>{const card=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=heading;p.textContent=copy;card.append(h,p);grid.append(card);});
    document.getElementById('dr-dialog-details').replaceChildren(grid);
  }
  document.querySelectorAll('[data-data-stage]').forEach(button=>button.addEventListener('click',()=>{trigger=button;routeKey=button.dataset.route;render(button.dataset.dataStage);dialog.showModal();button.setAttribute('aria-expanded','true');dialog.scrollTop=0;syncPlayback();}));
  dialog.querySelectorAll('[data-dr-view]').forEach(b=>b.addEventListener('click',()=>render(b.dataset.drView)));
  document.getElementById('dr-dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{trigger?.setAttribute('aria-expanded','false');trigger?.focus({preventScroll:true});syncPlayback();});
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
})();
