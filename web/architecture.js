const architecture = document.getElementById('architecture-map');
const archDialog = document.getElementById('arch-dialog');
let archTrigger;
const archDetails = {
  runtime:{label:'pi runtime',title:'The loop that connects it all',description:'pi runs the model–tool–feedback cycle. The agent reads a skill, chooses an action, inspects the returned observations, and decides what to do next.',link:'docs/modes.html',linkText:'Explore agent interfaces',steps:['Read the procedure','Execute an action','Use the feedback']},
  skills:{label:'Upstream guidance',title:'Skills explain how to use a capability',description:'An integration pairs callable capabilities with a skill: setup requirements, input conventions, the sequence of tools to use, and how to interpret feedback. The agent reads that procedure and turns it into actions.',link:'docs/development.html#write-a-skill',linkText:'Write a skill',steps:['Set up the environment','Compose the available tools','Inspect results and revise']},
  sessions:{label:'pi sessions',title:'Keep the experiment in context',description:'pi retains the conversation and tool results across turns. The agent can continue from earlier observations and resume a session while robot extensions add task and episode information.',link:'docs/quickstart.html',linkText:'Start an experiment',steps:['Task and instructions','Actions and observations','Continue or resume']},
  extensions:{label:'Robot & algorithm integrations',title:'One declaration, two execution interfaces',description:'Extensions register robot-specific tools, observations, and lifecycle hooks with pi. Primitive manifests describe operations and parameters; these declarations supply tool descriptions and the supported server-side Python API.',link:'docs/development.html',linkText:'Develop an integration',steps:['Declare operations and parameters','Expose tools and Python primitives','Connect the service implementation']},
  environments:{label:'Downstream services',title:'Environments & benchmarks',description:'Environment services host simulation, reset tasks, execute robot operations, and return observations and outcomes. Extensions connect those capabilities to the agent loop.',link:'docs/environments.html',linkText:'Choose an environment'},
  robots:{label:'Downstream services',title:'Real robot adapters',description:'Hardware adapters connect the same agent-facing workflow to physical robots. The service handles robot operations and returns sensor observations and execution feedback.',link:'docs/environments.html',linkText:'Explore robot adapters'},
  policies:{label:'Downstream services',title:'Reusable policy backends',description:'Learned controllers run behind service interfaces. Robot integrations can call a policy for execution and bring its results back into the agent workflow.',link:'docs/modes.html',linkText:'Explore policy interfaces'},
  toolchain:{label:'Downstream services',title:'Compose the robotics toolchain',description:'Perception, grasping, motion planning, and data tools provide reusable operations. Skills explain how to combine them, while extensions expose the calls that the agent can make.',link:'docs/services.html',linkText:'Configure services'}
};
let archMode = 'tools';
let archSelected = 'runtime';
let archCatalog = null;
const archCatalogRequest = fetch('data/integrations.json').then(r=>{if(!r.ok)throw new Error();return r.json();}).then(data=>{archCatalog=data;return data;}).catch(()=>null);
function archRenderContent(key,detail) {
  const content = document.getElementById('arch-detail-content');
  content.replaceChildren();
  if (detail.steps) {
    const sequence = document.createElement('div');sequence.className='arch-detail-sequence';
    for (const [index,step] of detail.steps.entries()) {
      if (index) {const arrow=document.createElement('b');arrow.textContent='→';arrow.setAttribute('aria-hidden','true');sequence.append(arrow);}
      const label=document.createElement('span');label.textContent=step;sequence.append(label);
    }
    content.append(sequence);
    return;
  }
  if (!archCatalog) {
    const message=document.createElement('p');message.textContent='Explore the integrations in the documentation.';content.append(message);
    return;
  }
  const gallery=document.createElement('div');gallery.className='arch-gallery';
  for (const item of archCatalog[key] || []) {
    const tile=document.createElement('div');tile.className='arch-tile';
    if (item.image) {const img=document.createElement('img');img.src=item.image;img.alt='';img.loading='lazy';tile.append(img);}
    const name=document.createElement('span');name.textContent=item.title;tile.append(name);gallery.append(tile);
  }
  content.append(gallery);
}
function archSelect(key,announce=true) {
  archSelected=key;
  const detail=archDetails[key];
  architecture.querySelectorAll('[data-arch-node]').forEach(node=>{const selected=node.dataset.archNode===key;node.classList.toggle('is-selected',selected);node.setAttribute('aria-expanded',String(selected && archDialog.open));});
  document.getElementById('arch-detail-label').textContent=detail.label;
  document.getElementById('arch-detail-title').textContent=detail.title;
  document.getElementById('arch-detail-description').textContent=detail.description;
  const link=document.getElementById('arch-detail-link');link.href=detail.link;link.textContent=detail.linkText+' ↗';
  archRenderContent(key,detail);
  if (announce) document.getElementById('arch-announcement').textContent=detail.title+'. Details shown below the diagram.';
}
architecture.querySelectorAll('[data-arch-node]').forEach(node=>{
  node.removeAttribute('aria-pressed');node.setAttribute('aria-haspopup','dialog');node.setAttribute('aria-expanded','false');
  node.addEventListener('click',()=>{archTrigger=node;archSelect(node.dataset.archNode);archDialog.showModal();node.setAttribute('aria-expanded','true');archDialog.scrollTop=0;syncPlayback();});
});
document.getElementById('arch-dialog-close').addEventListener('click',()=>archDialog.close());
archDialog.addEventListener('close',()=>{archTrigger?.setAttribute('aria-expanded','false');archTrigger?.focus({preventScroll:true});syncPlayback();});
archDialog.addEventListener('click',event=>{if(event.target!==archDialog)return;const r=archDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)archDialog.close();});
architecture.querySelectorAll('[data-arch-mode]').forEach(button=>button.addEventListener('click',()=>{
  archMode=button.dataset.archMode;
  architecture.dataset.interface=archMode;
  architecture.querySelectorAll('[data-arch-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.archMode===archMode)));
  architecture.querySelectorAll('[data-arch-branch]').forEach(b=>b.classList.toggle('is-active',b.dataset.archBranch===archMode));
  const action=document.getElementById('arch-act-label');action.replaceChildren(document.createTextNode(archMode==='python'?'Write code':'Call tools'));
  const subtitle=document.createElement('span');subtitle.textContent=archMode==='python'?'run_code':'Execute';action.append(subtitle);
  document.getElementById('arch-request-label').textContent=archMode==='python'?'The agent submits a Python program':'The agent selects a registered tool';
  document.getElementById('arch-dispatch-label').textContent=archMode==='python'?'Send the program to the environment service':'Dispatch an operation over HTTP';
  document.getElementById('arch-execution-note').textContent=archMode==='python'?'Python runs inside the environment service and calls its declared primitives. Results return to the agent loop.':'Service results return through the extension to the next agent turn.';
  document.getElementById('arch-announcement').textContent=archMode==='python'?'Generated Python selected. The program calls declared primitives inside the environment service.':'Agent tool calls selected. The extension dispatches operations to downstream services.';
}));
archCatalogRequest.then(()=>{if(!archDetails[archSelected].steps)archSelect(archSelected,false);});
