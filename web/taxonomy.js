/* Membership comes directly from the same data used by the research library. */
const taxonomyDialog = document.getElementById('taxonomy-dialog');
const taxonomyLinks = [...document.querySelectorAll('.tx-pick')];
const taxonomyDescriptions = {
  'Infrastructure / Environment Generation': 'Agents construct or revise environments and tasks for robotic development.',
  'Infrastructure / Dataset Construction': 'Agents organize data collection, demonstration generation, or dataset construction.',
  'Infrastructure / Training': 'Agents make decisions within learning and experimentation workflows.',
  'Infrastructure / Evaluation': 'Agents organize evaluation and assess robot behavior.',
  'Infrastructure / Diagnosis': 'Agents inspect execution feedback to diagnose failures and guide development.',
  'Self-Evolver / Programs and Skills': 'Feedback is used to revise programs or skills that are retained for subsequent use.',
  'Self-Evolver / Knowledge and Memory': 'Experience is retained in knowledge or memory that informs later decisions.',
  'Self-Evolver / Rewards': 'Feedback guides changes to reward definitions used in subsequent learning.',
  'Self-Evolver / Environments and Datasets': 'Environment or dataset revisions are retained across iterations.',
  'Self-Evolver / Robot morphology': 'Agents revise robot morphology using feedback from evaluation.',
  'Self-Evolver / Model': 'Model updates are a retained target of the improvement process.',
  'Self-Evolver / Code': 'Agents revise tool or component code used in later executions.',
  'Self-Evolver / Successor AI R&D': 'Non-robotics context: these works examine model development and whether an updated model takes over subsequent research decisions.',
  'Self-Evolver / Representation': 'The agent harness revises how information is represented for subsequent decisions.',
  'Self-Evolver / State Management': 'Retained revisions change how the harness manages state across execution.',
  'Self-Evolver / Tool Interface': 'The harness revises the interfaces through which the agent accesses capabilities.',
  'Self-Evolver / Execution Workflows': 'Feedback guides retained changes to the harness execution workflow.'
};
const observations = {O1:'sensory inputs such as images, depth, or touch',O2:'perception-tool outputs and queries',O3:'privileged simulator state'};
const executions = {A1:'selects behaviors through a fixed executor',A2:'orchestrates tools',A3:'synthesizes robot-execution programs'};
let taxonomyPapers = [];
let taxonomyMatched = [];
let taxonomyLimit = 8;
let taxonomyTrigger;
let taxonomyReady = false;
const taxonomySafeURL = value => { try { const u = new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : null; } catch { return null; } };
function renderTaxonomyPapers() {
  const list = document.getElementById('tx-dialog-papers');
  list.replaceChildren();
  for (const paper of taxonomyMatched.slice(0,taxonomyLimit)) {
    const article = document.createElement('article');
    article.className = 'tx-paper';
    const meta = document.createElement('span');
    meta.className = 'tx-paper-meta';
    meta.textContent = [paper.year, paper.source_type].filter(Boolean).join(" · ");
    const title = document.createElement('h3');
    const link = document.createElement('a');
    link.href = taxonomySafeURL(paper.url) || 'library.html';
    link.textContent = paper.short_name ? `${paper.short_name}: ${paper.title}` : paper.title;
    title.append(link);
    article.append(meta,title);
    if (taxonomySafeURL(paper.project_url)) {
      const projectLink = document.createElement('a');
      projectLink.href = taxonomySafeURL(paper.project_url);
      projectLink.textContent = 'Project ↗';
      article.append(projectLink);
    }
    if (taxonomySafeURL(paper.code_url)) {
      const codeLink = document.createElement('a');
      codeLink.className = 'tx-code';
      codeLink.href = taxonomySafeURL(paper.code_url);
      const icon = document.createElement('img');
      icon.src = 'assets/github.svg'; icon.alt = ''; icon.width = 15; icon.height = 15;
      if (new URL(codeLink.href).hostname === 'github.com') codeLink.append(icon);
      codeLink.append(document.createTextNode('Code ↗'));
      article.append(codeLink);
    }
    if (paper.code_status === 'pending_release' && taxonomySafeURL(paper.repository_url)) {
      const pending = document.createElement('a');
      pending.className = 'tx-code';
      pending.href = taxonomySafeURL(paper.repository_url);
      pending.textContent = 'Code pending release ↗';
      article.append(pending);
    }
    list.append(article);
  }
  document.getElementById('tx-dialog-count').textContent = `${taxonomyMatched.length} works · ${taxonomyMatched.filter(p=>taxonomySafeURL(p.code_url)).length} with code`;
  document.getElementById('tx-dialog-more').hidden = taxonomyLimit >= taxonomyMatched.length;
}
function openTaxonomy(event) {
  if (!taxonomyReady || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  taxonomyTrigger = event.currentTarget;
  const category = taxonomyTrigger.dataset.category;
  const layer = taxonomyTrigger.closest('.tx-layer');
  const isPolicy = category.startsWith('O');
  const role = isPolicy ? 'Agent as Policy' : category.startsWith('Infrastructure') ? 'Agent as Infrastructure' : 'Agent as Self-Evolver';
  let title = taxonomyTrigger.querySelector('span').childNodes[0].textContent;
  let description = taxonomyDescriptions[category];
  if (isPolicy) {
    const [observation,execution] = category.split(' / ');
    title = `${observation} × ${execution}`;
    description = `The agent uses ${observations[observation]} and ${executions[execution.slice(0,2)]}${execution.includes('Code') ? ' implemented in code' : execution.includes('Model') ? ' implemented by a learned model' : ''}.`;
  }
  document.getElementById('tx-dialog-role').textContent = role;
  document.getElementById('tx-dialog-title').textContent = title;
  document.getElementById('tx-dialog-description').textContent = description;
  document.getElementById('tx-dialog-library').href = taxonomyTrigger.href;
  taxonomyDialog.style.setProperty('--tx-accent',getComputedStyle(layer).getPropertyValue('--tx-accent'));
  taxonomyMatched = taxonomyPapers.filter(p=>p.categories.includes(category));
  taxonomyLimit = 8;
  renderTaxonomyPapers();
  taxonomyTrigger.setAttribute('aria-expanded','true');
  taxonomyDialog.showModal();
  taxonomyDialog.scrollTop = 0;
  syncPlayback();
}
for (const link of taxonomyLinks) link.addEventListener('click',openTaxonomy);
document.getElementById('tx-dialog-close').addEventListener('click',()=>taxonomyDialog.close());
taxonomyDialog.addEventListener('close',()=>{
  taxonomyTrigger?.setAttribute('aria-expanded','false');
  taxonomyTrigger?.focus({preventScroll:true});
  syncPlayback();
});
taxonomyDialog.addEventListener('click',event=>{
  if (event.target !== taxonomyDialog) return;
  const rect = taxonomyDialog.getBoundingClientRect();
  if (event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom) taxonomyDialog.close();
});
document.getElementById('tx-dialog-more').addEventListener('click',()=>{taxonomyLimit+=8;renderTaxonomyPapers();});
fetch('data/papers.json').then(r=>{if(!r.ok)throw new Error();return r.json();}).then(papers=>{
  taxonomyPapers = papers.sort((a,b)=>b.year-a.year||a.title.localeCompare(b.title));
  for (const link of taxonomyLinks) {
    const count = papers.filter(p=>p.categories.includes(link.dataset.category)).length;
    link.querySelector('.tx-count').textContent = `${count} ↗`;
    link.setAttribute('aria-label',`${link.dataset.category}: ${count} works`);
    link.setAttribute('aria-haspopup','dialog');
    link.setAttribute('aria-expanded','false');
  }
  taxonomyReady = true;
}).catch(()=>{ /* Category links remain usable if the preview cannot load. */ });
