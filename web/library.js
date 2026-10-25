const search = document.getElementById("paper-search");
const role = document.getElementById("role-filter");
const category = document.getElementById("category-filter");
const code = document.getElementById("code-filter");
const list = document.getElementById("paper-list");
const more = document.getElementById("load-more");
let papers = [];
let matched = [];
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
    const shortName = paper.short_name;
    const titleMatchesName = shortName && paper.title.toLowerCase() === shortName.toLowerCase();
    const titleStartsWithName = shortName && paper.title.toLowerCase().startsWith(`${shortName.toLowerCase()}:`);
    link.textContent = !shortName ? paper.title : titleMatchesName ? shortName
      : titleStartsWithName ? shortName + paper.title.slice(shortName.length)
      : `${shortName}: ${paper.title}`;
    title.append(link);
    const tags = document.createElement("div");
    tags.className = "paper-tags";
    tags.textContent = paper.categories.join(" · ");
    const links = document.createElement("div");
    links.className = "paper-links";
    if (paper.project_url && safeURL(paper.project_url)) {
      const project = document.createElement("a");
      project.href = safeURL(paper.project_url);
      project.textContent = "Project ↗";
      links.append(project);
    }
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
    card.append(year, title, tags);
    if (paper.scope_note) {
      const scope = document.createElement("p");
      scope.textContent = paper.scope_note;
      card.append(scope);
    }
    card.append(links);
    list.append(card);
  }
  document.getElementById("result-count").textContent = `${matched.length} works · ${matched.filter(p=>p.code_url).length} with code links · showing ${Math.min(limit,matched.length)}`;
  more.hidden = limit >= matched.length;
  if (!matched.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No works match these filters. Try a broader search.";
    list.append(empty);
  }
}
function filter() {
  limit = 40;
  const query = search.value.toLowerCase().trim();
  matched = papers.filter(p => (role.value === "all" || p.categories.some(c=>roleOf(c)===role.value))
    && (!category.value || p.categories.includes(category.value))
    && (!code.checked || p.code_url)
    && (!query || `${p.id} ${p.short_name || ""} ${p.title} ${(p.aliases || []).join(" ")} ${p.url} ${p.project_url || ""} ${p.code_url || ""} ${p.categories.join(" ")}`.toLowerCase().includes(query)));
  document.getElementById("successor-note").hidden = category.value !== "Self-Evolver / Successor AI R&D";
  render();
}
function categories() {
  const previous = category.value;
  category.replaceChildren(new Option("All categories",""));
  [...new Set(papers.flatMap(p=>p.categories))].filter(c=>role.value==="all"||roleOf(c)===role.value).sort().forEach(c=>category.add(new Option(c,c)));
  if ([...category.options].some(o=>o.value===previous)) category.value = previous;
}
fetch("data/papers.json").then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(data => {
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
