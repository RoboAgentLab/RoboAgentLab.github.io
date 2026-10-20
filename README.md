# RoboAgentLab website

The showcase, research library, and documentation live together here.

- `web/`: public homepage and library UI
- `source/`: Markdown documentation, built with Sphinx and PyData
- `data/`: research records and demo source metadata
- `assets/`: branding and demonstration media

## Local preview

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python scripts/build.py
.venv/bin/python -m http.server 8000 --directory _build/site
```

Open `http://localhost:8000/` and `http://localhost:8000/docs/`.

Pushes to `main` build and deploy both parts to GitHub Pages. The manuscript PDF will be added after author confirmation.

Demo provenance is recorded in `data/demos.json`. Media comes from the project-provided Alchedata × PEARL Replay Studio; gallery captions retain the environment names and source links.
