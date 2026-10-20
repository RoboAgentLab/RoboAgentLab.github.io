project = "RoboAgentLab"
author = "RoboAgentLab contributors"
copyright = "2026, RoboAgentLab contributors"
extensions = ["myst_parser", "sphinx_design", "sphinx_copybutton"]
html_theme = "pydata_sphinx_theme"
html_title = "RoboAgentLab Documentation"
html_logo = "_static/logo.png"
html_favicon = "_static/logo.png"
html_static_path = ["_static"]
templates_path = ["_templates"]
html_css_files = ["docs.css"]
html_theme_options = {
    "logo": {"text": "RoboAgentLab"},
    "navbar_start": ["navbar-logo"],
    "navbar_center": ["showcase-links"],
    "navbar_end": ["theme-switcher", "navbar-icon-links"],
    "external_links": [
        {"name": "Home", "url": "https://roboagentlab.github.io/"},
        {"name": "Research library", "url": "https://roboagentlab.github.io/library.html"},
    ],
    "icon_links": [
        {"name": "GitHub", "url": "https://github.com/RoboAgentLab/RoboAgentLab",
         "icon": "fa-brands fa-github"},
    ],
    "show_prev_next": True,
    "show_nav_level": 2,
    "navigation_depth": 3,
    "collapse_navigation": False,
    "secondary_sidebar_items": ["page-toc"],
}
html_sidebars = {"**": ["search-field.html", "docs-navigation.html"]}
html_context = {"default_mode": "light"}
html_show_sourcelink = False
myst_enable_extensions = ["colon_fence", "deflist"]
myst_heading_anchors = 3
exclude_patterns = ["docs"]
copybutton_prompt_text = r"^\$ "
copybutton_prompt_is_regexp = True
