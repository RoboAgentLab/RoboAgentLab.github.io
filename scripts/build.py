"""Build the public showcase and Sphinx documentation into one Pages artifact."""
from pathlib import Path
import shutil
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
out = root / "_build/site"
out.mkdir(parents=True, exist_ok=True)
# The documentation and showcase use the same curated research library.
shutil.copyfile(root / "data/papers.json", root / "source/_static/data/papers.json")
shutil.copyfile(root / "data/categories.json", root / "source/_static/data/categories.json")
subprocess.run([sys.executable, "-m", "sphinx", "-b", "html", "-W", "--keep-going",
                str(root / "source"), str(out / "docs")], check=True)
for name in ("assets", "data"):
    shutil.copytree(root / name, out / name, dirs_exist_ok=True)
shutil.copytree(root / "web", out, dirs_exist_ok=True)
(out / ".nojekyll").touch()
print(f"Built {out}")
