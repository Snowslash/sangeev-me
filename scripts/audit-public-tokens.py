#!/usr/bin/env python3
"""Audit Sangeev public-estate CSS token drift.

Run from the sangeev-me repo in the Hermes coding workspace:

    python3 scripts/audit-public-tokens.py

It checks:
- each public repo has the byte-identical canonical token file;
- required token declarations in each main stylesheet match the canonical light/dark values;
- clinical/warning boxes use canonical warning tokens and strong text colour;
- HTML links include the canonical token stylesheet before the site stylesheet;
- React public frontends use byte-identical public-estate header and theme-toggle CSS plus the same markup contracts.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parent

SITES = {
    "sangeev.me": WORKSPACE / "sangeev-me",
    "scratchpad": WORKSPACE / "clinical-shift-scratchpad",
    "opnotes": WORKSPACE / "Op note gen",
}

HEADER_CONTROLS = {
    "sangeev.me": (
        WORKSPACE / "sangeev-me/src/styles/public-estate-header.css",
        WORKSPACE / "sangeev-me/src/components/PublicEstateHeader.tsx",
    ),
    "scratchpad": (
        WORKSPACE / "clinical-shift-scratchpad/landing/src/styles/public-estate-header.css",
        WORKSPACE / "clinical-shift-scratchpad/landing/src/components/PublicEstateHeader.tsx",
    ),
    "opnotes-v2": (
        WORKSPACE / "op-note-gen-v2/src/styles/public-estate-header.css",
        WORKSPACE / "op-note-gen-v2/src/components/PublicEstateHeader.tsx",
    ),
    "aligned": (
        WORKSPACE / "AlignEd-public-clean/src/styles/public-estate-header.css",
        WORKSPACE / "AlignEd-public-clean/src/components/PublicEstateHeader.tsx",
    ),
}

HEADER_MARKUP_CONTRACT = (
    'className="site-header"',
    'data-print-hidden',
    'className="wordmark"',
    'aria-label="Primary navigation"',
    'https://sangeev.me/#tools',
    'https://opnotes.sangeev.me',
    'https://scratchpad.sangeev.me',
    'https://aligned.sangeev.me',
    '<ThemeToggle theme={theme} onToggle={onToggleTheme} />',
)

THEME_CONTROLS = {
    "sangeev.me": (
        WORKSPACE / "sangeev-me/src/styles/theme-toggle.css",
        WORKSPACE / "sangeev-me/src/components/ThemeToggle.tsx",
    ),
    "scratchpad": (
        WORKSPACE / "clinical-shift-scratchpad/landing/src/styles/theme-toggle.css",
        WORKSPACE / "clinical-shift-scratchpad/landing/src/components/ThemeToggle.tsx",
    ),
    "opnotes-v2": (
        WORKSPACE / "op-note-gen-v2/src/styles/theme-toggle.css",
        WORKSPACE / "op-note-gen-v2/src/components/ThemeToggle.tsx",
    ),
    "aligned": (
        WORKSPACE / "AlignEd-public-clean/src/styles/theme-toggle.css",
        WORKSPACE / "AlignEd-public-clean/src/components/ThemeToggle.tsx",
    ),
}

THEME_STATE_FILES = {
    "sangeev.me": WORKSPACE / "sangeev-me/src/lib/theme.ts",
    "scratchpad": WORKSPACE / "clinical-shift-scratchpad/landing/src/lib/theme.ts",
    "opnotes-v2": WORKSPACE / "op-note-gen-v2/src/app/theme.ts",
    "aligned": WORKSPACE / "AlignEd-public-clean/src/theme.ts",
}

THEME_STATE_MARKERS = (
    "sangeevSiteTheme",
    "Domain=.sangeev.me",
    "SameSite=Lax",
)

THEME_MARKUP_CONTRACT = (
    'className="theme-toggle"',
    'aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}',
    'aria-pressed={isDark}',
    '<Sun aria-hidden="true" size={15} />',
    '<Moon aria-hidden="true" size={15} />',
    '<span>{isDark ? "Light" : "Dark"}</span>',
)

TOKEN_FILE = "docs/sangeev-public-tokens.css"
STYLE_FILE = "docs/styles.css"
HTML_GLOB = "docs/*.html"

CANONICAL = {
    "light": {
        "--bg": "#f4f0e8",
        "--panel": "#fbf8f2",
        "--text": "#1d1b18",
        "--text-strong": "#1d1b18",
        "--text-muted": "#655e55",
        "--border": "#c7b8a5",
        "--border-strong": "#9b8770",
        "--accent": "#8a1538",
        "--accent-hover": "#641028",
        "--warning-bg": "#f8ead3",
        "--warning-border": "#c7b8a5",
    },
    "dark": {
        "--bg": "#1d1b18",
        "--panel": "#24211d",
        "--text": "#f4f0e8",
        "--text-strong": "#f4f0e8",
        "--text-muted": "#c7b8a5",
        "--border": "#655e55",
        "--border-strong": "#8b7b68",
        "--accent": "#a3264d",
        "--accent-hover": "#c43b63",
        "--warning-bg": "#2d251b",
        "--warning-border": "#655e55",
    },
}

# Known site-local aliases that should track canonical tokens exactly.
ALIASES = {
    "light": {
        "--brand": CANONICAL["light"]["--accent"],
        "--brand-hover": CANONICAL["light"]["--accent-hover"],
    },
    "dark": {
        "--brand": CANONICAL["dark"]["--accent"],
        "--brand-hover": CANONICAL["dark"]["--accent-hover"],
        "--landing-paper": CANONICAL["dark"]["--bg"],
        "--landing-ink": CANONICAL["dark"]["--text"],
        "--landing-muted": CANONICAL["dark"]["--text-muted"],
        "--landing-rule": CANONICAL["dark"]["--border"],
        "--landing-rule-strong": CANONICAL["dark"]["--border-strong"],
        "--landing-link": CANONICAL["dark"]["--accent"],
    },
}

BLOCK_RE = re.compile(r"([^{}]+)\{([^{}]+)\}", re.S)
DECL_RE = re.compile(r"(--[\w-]+)\s*:\s*([^;]+);")
PROP_RE = re.compile(r"([\w-]+)\s*:\s*([^;]+);")

WARNING_RULES = {
    "sangeev.me": {
        ".boundary": {
            "background": "var(--warning-bg)",
            "border": "1px solid var(--warning-border)",
            "color": "var(--text-strong)",
        },
        ".boundary p": {"color": "var(--text-strong)"},
        ".boundary strong": {"color": "var(--text-strong)"},
    },
    "scratchpad": {
        ".boundary": {
            "background": "var(--warning-bg)",
            "border": "1px solid var(--warning-border)",
            "color": "var(--text-strong)",
        },
        ".boundary p": {"color": "var(--text-strong)"},
        ".boundary strong": {"color": "var(--text-strong)"},
    },
    "opnotes": {
        ".landing-safety": {
            "background": "var(--warning-bg)",
            "border": "1px solid var(--warning-border)",
            "color": "var(--text-strong)",
        },
        ".landing-safety p": {"color": "var(--text-strong)"},
        ".landing-safety strong": {"color": "var(--text-strong)"},
    },
}


def strip_comments(css: str) -> str:
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)


def theme_for_selector(selector: str) -> str | None:
    selector = selector.strip()
    if "data-theme=\"dark\"" in selector or "data-theme='dark'" in selector:
        return "dark"
    if selector == ":root" or selector.endswith(" :root"):
        return "light"
    # Sangeev's small pages also set page-scoped variables on body classes.
    if ".app-body" in selector or ".landing-body" in selector:
        return "light"
    return None


def normalise_value(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip()).lower()


def selector_parts(selector: str) -> set[str]:
    return {part.strip() for part in selector.split(",")}


def declarations_for_selector(css: str, target: str) -> dict[str, str]:
    declarations: dict[str, str] = {}
    for selector, body in BLOCK_RE.findall(css):
        if target in selector_parts(selector):
            declarations.update({name: value.strip() for name, value in PROP_RE.findall(body)})
    return declarations


def check_warning_rules(site: str, css: str, rel: Path, failures: list[str]) -> None:
    for selector, expected_props in WARNING_RULES.get(site, {}).items():
        actual = declarations_for_selector(css, selector)
        if not actual:
            failures.append(f"{site}: {rel} missing warning selector {selector}")
            continue
        for prop, expected in expected_props.items():
            actual_value = actual.get(prop)
            if actual_value is None:
                failures.append(f"{site}: {rel} {selector} missing {prop}: {expected}")
            elif normalise_value(actual_value) != normalise_value(expected):
                failures.append(
                    f"{site}: {rel} {selector} {prop}={actual_value} expected {expected}"
                )


def check_html_order(site: str, repo: Path, failures: list[str]) -> None:
    for html in sorted(repo.glob(HTML_GLOB)):
        text = html.read_text()
        if "styles.css" not in text:
            continue
        token_pos = text.find("sangeev-public-tokens.css")
        style_pos = text.find("styles.css")
        if token_pos == -1:
            failures.append(f"{site}: {html.relative_to(repo)} does not load sangeev-public-tokens.css")
        elif token_pos > style_pos:
            failures.append(f"{site}: {html.relative_to(repo)} loads tokens after styles.css")


def main() -> int:
    failures: list[str] = []
    canonical_text = (ROOT / TOKEN_FILE).read_text()

    for site, repo in SITES.items():
        token_path = repo / TOKEN_FILE
        style_path = repo / STYLE_FILE
        if not token_path.exists():
            failures.append(f"{site}: missing {TOKEN_FILE}")
            continue
        if token_path.read_text() != canonical_text:
            failures.append(f"{site}: {TOKEN_FILE} differs from sangeev.me canonical file")
        if not style_path.exists():
            failures.append(f"{site}: missing {STYLE_FILE}")
            continue

        css = strip_comments(style_path.read_text())
        for selector, body in BLOCK_RE.findall(css):
            theme = theme_for_selector(selector)
            if theme is None:
                continue
            expected = {**CANONICAL[theme], **ALIASES.get(theme, {})}
            for name, value in DECL_RE.findall(body):
                value = value.strip()
                if name in expected and value.lower() != expected[name].lower():
                    rel = style_path.relative_to(repo)
                    failures.append(
                        f"{site}: {rel} {selector.strip()} {name}={value} expected {expected[name]}"
                    )

        check_warning_rules(site, css, style_path.relative_to(repo), failures)
        check_html_order(site, repo, failures)

    canonical_header_css = HEADER_CONTROLS["sangeev.me"][0].read_text()
    for site, (css_path, component_path) in HEADER_CONTROLS.items():
        if not css_path.exists():
            failures.append(f"{site}: missing shared public-estate header CSS {css_path}")
            continue
        if css_path.read_text() != canonical_header_css:
            failures.append(f"{site}: public-estate header CSS differs from sangeev.me canonical file")
        if not component_path.exists():
            failures.append(f"{site}: missing PublicEstateHeader component {component_path}")
            continue
        component = component_path.read_text()
        for marker in HEADER_MARKUP_CONTRACT:
            if marker not in component:
                failures.append(f"{site}: PublicEstateHeader missing markup contract marker {marker}")

    canonical_control_css = THEME_CONTROLS["sangeev.me"][0].read_text()
    for site, (css_path, component_path) in THEME_CONTROLS.items():
        if not css_path.exists():
            failures.append(f"{site}: missing shared theme control CSS {css_path}")
            continue
        if css_path.read_text() != canonical_control_css:
            failures.append(f"{site}: theme control CSS differs from sangeev.me canonical file")
        if not component_path.exists():
            failures.append(f"{site}: missing ThemeToggle component {component_path}")
            continue
        component = component_path.read_text()
        for marker in THEME_MARKUP_CONTRACT:
            if marker not in component:
                failures.append(f"{site}: ThemeToggle missing markup contract marker {marker}")

    for site, theme_path in THEME_STATE_FILES.items():
        if not theme_path.exists():
            failures.append(f"{site}: missing theme state module {theme_path}")
            continue
        theme_source = theme_path.read_text()
        for marker in THEME_STATE_MARKERS:
            if marker not in theme_source:
                failures.append(f"{site}: theme state module missing estate persistence marker {marker}")

    if failures:
        print("Public token audit FAILED:\n")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("Public token audit passed for: " + ", ".join(SITES))
    return 0


if __name__ == "__main__":
    sys.exit(main())
