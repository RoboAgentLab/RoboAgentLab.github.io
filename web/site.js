const nav = document.querySelector(".nav");
document.querySelector(".nav-toggle")?.addEventListener("click", (event) => {
  const open = nav.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(open));
});
document.querySelectorAll(".nav-links a").forEach((link) => link.addEventListener("click", () => {
  nav.classList.remove("open");
  document.querySelector(".nav-toggle")?.setAttribute("aria-expanded", "false");
}));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let motionPaused = reduceMotion.matches;
const visibleVideos = new Set();
function syncPlayback() {
  const paused = motionPaused || document.hidden || Boolean(document.querySelector("dialog[open]"));
  document.body.classList.toggle("motion-paused", paused);
  document.querySelectorAll("video[data-src]").forEach((video) => {
    if (paused || !visibleVideos.has(video)) {
      video.pause();
    } else {
      if (!video.getAttribute("src")) video.src = video.dataset.src;
      video.play().catch(() => {});
    }
  });
}
const videoObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) visibleVideos.add(entry.target);
    else visibleVideos.delete(entry.target);
  }
  syncPlayback();
}, { threshold: 0.12 });
function previewVideo(demo) {
  const video = document.createElement("video");
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "none";
  video.poster = demo.poster;
  video.dataset.src = demo.preview;
  video.setAttribute("aria-hidden", "true");
  videoObserver.observe(video);
  return video;
}
const motionButton = document.getElementById("motion-toggle");
function updateMotionButton() {
  if (!motionButton) return;
  motionButton.textContent = motionPaused ? "Play background videos" : "Pause background videos";
  motionButton.setAttribute("aria-pressed", String(motionPaused));
  syncPlayback();
}
motionButton?.addEventListener("click", () => {
  motionPaused = !motionPaused;
  updateMotionButton();
});
reduceMotion.addEventListener("change", () => {
  motionPaused = reduceMotion.matches;
  updateMotionButton();
});
document.addEventListener("visibilitychange", syncPlayback);
updateMotionButton();
const grid = document.getElementById("demo-grid");
if (grid) {
  fetch("data/demos.json").then((r) => { if (!r.ok) throw new Error(); return r.json(); }).then((demos) => {
    const wall = document.querySelector(".hero-wall");
    wall.replaceChildren();
    for (let col = 0; col < 4; col++) {
      const column = document.createElement("div");
      column.className = "wall-col";
      demos.filter((_, index) => index % 4 === col).forEach((demo) => column.append(previewVideo(demo)));
      wall.append(column);
    }
    const closingWall = document.querySelector(".closing-wall");
    demos.slice(-6).forEach((demo) => closingWall.append(previewVideo(demo)));
    for (const demo of demos) {
      const { title, category } = demo;
      const card = document.createElement("button");
      card.className = "demo-card";
      card.dataset.category = category;
      card.setAttribute("aria-label", `Play ${title}`);
      const frame = document.createElement("div");
      frame.className = "demo-image";
      frame.append(previewVideo(demo));
      const play = document.createElement("span");
      play.className = "play-icon";
      play.textContent = "▶";
      play.setAttribute("aria-hidden", "true");
      frame.append(play);
      const meta = document.createElement("div");
      meta.className = "demo-meta";
      const heading = document.createElement("h3");
      heading.textContent = title;
      meta.append(heading);
      card.append(frame, meta);
      card.addEventListener("click", () => {
        const dialog = document.getElementById("demo-dialog");
        const video = document.getElementById("demo-video");
        document.getElementById("demo-title").textContent = title;
        video.src = demo.video;
        video.poster = demo.poster;
        dialog.showModal();
        syncPlayback();
        video.play().catch(() => {});
      });
      grid.append(card);
    }
    let currentFilter = "all";
    let expanded = false;
    const more = document.getElementById("more-demos");
    function filterDemos() {
      let count = 0;
      grid.querySelectorAll(".demo-card").forEach((card) => {
        const match = currentFilter === "all" || currentFilter === card.dataset.category;
        card.hidden = !match || (!expanded && count >= 12);
        if (match) count++;
      });
      more.hidden = expanded || count <= 12;
      more.textContent = "Show all demos";
    }
    more.addEventListener("click", () => { expanded = true; filterDemos(); });
    document.querySelectorAll("[data-demo-filter]").forEach((button) => button.addEventListener("click", () => {
      currentFilter = button.dataset.demoFilter;
      expanded = false;
      document.querySelectorAll("[data-demo-filter]").forEach((b) => {
        b.classList.toggle("active", b === button);
        b.setAttribute("aria-pressed", String(b === button));
      });
      filterDemos();
    }));
    filterDemos();
    // The gallery changes page height after loading; keep section links aligned.
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }).catch(() => {
    grid.textContent = "The demo library could not load. Please reload this page.";
  });
  const dialog = document.getElementById("demo-dialog");
  document.getElementById("close-demo").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => { document.getElementById("demo-video").pause(); syncPlayback(); });
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
}
