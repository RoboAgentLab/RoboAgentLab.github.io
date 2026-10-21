const search = document.getElementById("paper-search");
const role = document.getElementById("role-filter");
const category = document.getElementById("category-filter");
const code = document.getElementById("code-filter");
const list = document.getElementById("paper-list");
const more = document.getElementById("load-more");
let papers = [];
let matched = [];
let resources = [];
let matchedResources = [];
let researchNotes = [];
let matchedNotes = [];
let limit = 40;
const roleOf = (c) => c.startsWith("Infrastructure") ? "infrastructure" : c.startsWith("Self-Evolver") ? "evolver" : "policy";
const safeURL = (url) => { try { const u = new URL(url); return u.protocol === "https:" || u.protocol === "http:" ? u.href : null; } catch { return null; } };
function render() {
  list.replaceChildren();
  for (const paper of matched.slice(0, limit)) {
    const card = document.createElement("article");
    card.className = "paper-card";
    const year = document.createElement("span");
    year.className = "paper-year";
    year.textContent = [paper.year, paper.source_type].filter(Boolean).join(" · ");
    const title = document.createElement("h2");
    const link = document.createElement("a");
    link.href = safeURL(paper.url) || "#";
    link.textContent = paper.title;
    title.append(link);
    const tags = document.createElement("div");
    tags.className = "paper-tags";
    tags.textContent = paper.categories.join(" · ");
    const links = document.createElement("div");
    links.className = "paper-links";
    if (paper.source_type !== "Repository") {
      const source = document.createElement("a");
      source.href = link.href;
      source.textContent = paper.source_type === "Paper" ? "Read paper ↗" : "Project / report ↗";
      links.append(source);
    }
    if (paper.code_url && safeURL(paper.code_url)) {
      const repo = document.createElement("a");
      repo.href = safeURL(paper.code_url);
      const icon = document.createElement("img");
      icon.src = "assets/github.svg";
      icon.alt = "";
      icon.width = 15;
      icon.height = 15;
      repo.append(icon, document.createTextNode("Code ↗"));
      links.append(repo);
    }
    card.append(year, title, tags, links);
    list.append(card);
  }
  document.getElementById("result-count").textContent = `${matched.length} works · ${matched.filter(p=>p.code_url).length} with code links · showing ${Math.min(limit,matched.length)}`;
  if(matchedResources.length)document.getElementById("result-count").textContent+=` · ${matchedResources.length} supporting resource${matchedResources.length===1?"":"s"}`;
  renderResources();
  renderNotes();
  if (matchedNotes.length) document.getElementById("result-count").textContent += ` · ${matchedNotes.length} research note${matchedNotes.length === 1 ? "" : "s"}`;
  more.hidden = limit >= matched.length;
  if (!matched.length && !matchedResources.length && !matchedNotes.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No works match these filters. Try a broader search.";
    list.append(empty);
  }
}
function renderNotes() {
  const section = document.getElementById("research-notes"), container = document.getElementById("research-note-list");
  section.hidden = !matchedNotes.length;
  container.replaceChildren();
  for (const note of matchedNotes) {
    const card = document.createElement("article"); card.className = "paper-card";
    const meta = document.createElement("span"); meta.className = "paper-year"; meta.textContent = `${note.year} · Research lead`;
    const title = document.createElement("h2"), link = document.createElement("a");
    link.href = safeURL(note.url); link.textContent = note.title; title.append(link);
    const description = document.createElement("p"); description.textContent = note.description;
    const links = document.createElement("div"); links.className = "paper-links";
    for (const [label, url] of [["Project update ↗", note.url], ["Runtime code ↗", note.code_url]]) {
      if (safeURL(url)) { const a = document.createElement("a"); a.href = safeURL(url); a.textContent = label; links.append(a); }
    }
    card.append(meta, title, description, links); container.append(card);
  }
}
function renderResources(){
  const section=document.getElementById('supporting-resources'),container=document.getElementById('resource-list');
  section.hidden=!matchedResources.length;container.replaceChildren();
  for(const resource of matchedResources){
    const card=document.createElement('article');card.className='paper-card';
    const year=document.createElement('span');year.className='paper-year';year.textContent=`${resource.year} · ${resource.source_type}`;
    const title=document.createElement('h2'),link=document.createElement('a');link.href=safeURL(resource.url)||'#';link.textContent=resource.title;title.append(link);
    const description=document.createElement('p');description.textContent=resource.description;
    const links=document.createElement('div');links.className='paper-links';
    for(const [label,url] of [['Project ↗',resource.url],['Open models ↗',resource.models_url]]){if(safeURL(url)){const a=document.createElement('a');a.href=safeURL(url);a.textContent=label;links.append(a);}}
    card.append(year,title,description,links);container.append(card);
  }
}
function filter() {
  limit = 40;
  const query = search.value.toLowerCase().trim();
  matchedNotes = researchNotes.filter(n => (role.value === "all" || role.value === n.role) && !category.value
    && (!code.checked || n.code_url)
    && (!query || `${n.title} ${n.topics.join(" ")} ${n.description}`.toLowerCase().includes(query)));
  matchedResources=resources.filter(r=>role.value==='all'&&!category.value&&!code.checked&&(!query||`${r.title} ${r.topics.join(' ')} ${r.description}`.toLowerCase().includes(query)));
  matched = papers.filter(p => (role.value === "all" || p.categories.some(c=>roleOf(c)===role.value))
    && (!category.value || p.categories.includes(category.value))
    && (!code.checked || p.code_url)
    && (!query || `${p.id} ${p.title} ${p.url} ${p.code_url || ""} ${p.categories.join(" ")}`.toLowerCase().includes(query)));
  document.getElementById("successor-note").hidden = category.value !== "Self-Evolver / Successor AI R&D";
  render();
}
function categories() {
  const previous = category.value;
  category.replaceChildren(new Option("All categories",""));
  [...new Set(papers.flatMap(p=>p.categories))].filter(c=>role.value==="all"||roleOf(c)===role.value).sort().forEach(c=>category.add(new Option(c,c)));
  if ([...category.options].some(o=>o.value===previous)) category.value = previous;
}
Promise.all(["data/papers.json","data/resources.json","data/research-notes.json"].map(url=>fetch(url).then(r=>{if(!r.ok)throw new Error();return r.json();}))).then(([data,support,notes])=>{
  resources=support;
  researchNotes=notes;
  papers = data.sort((a,b)=>b.year-a.year||a.title.localeCompare(b.title));
  const params = new URLSearchParams(location.search);
  const requested = params.get("role");
  if (["policy","infrastructure","evolver"].includes(requested)) role.value = requested;
  const requestedCategory = params.get("category");
  if (requestedCategory && papers.some(p=>p.categories.includes(requestedCategory))) {
    role.value = roleOf(requestedCategory);
  }
  categories();
  if ([...category.options].some(o=>o.value===requestedCategory)) category.value = requestedCategory;
  filter();
}).catch(()=>{document.getElementById("result-count").textContent="The library could not load. You can browse the complete Awesome list on GitHub above.";});
search.addEventListener("input",filter);
role.addEventListener("change",()=>{categories();filter();});
category.addEventListener("change",filter);
code.addEventListener("change",filter);
more.addEventListener("click",()=>{limit+=40;render();});
