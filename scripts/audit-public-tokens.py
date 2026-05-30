#!/usr/bin/env python3
"""Audit Sangeev public-estate CSS token drift.

Run from the sangeev-me repo in the Hermes coding workspace:

    python3 scripts/audit-public-tokens.py

It checks:
- each public repo has the byte-identical canonical token file;
- required token declarations in each main stylesheet match the canonical light/dark values;
- clinical/warning boxes use canonical warning tokens and strong text colour;
- HTML links include the canonical token stylesheet before the site stylesheet.
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

TOKEN_FILE = "docs/sangeev-public-tokens.css"
STYLE_FILE = "docs/styles.css"
HTML_GLOB = "docs/*.html"

CANONICAL = {
    "light": {
        "--bg": "#f7f6f2",
        "--panel": "#fffefa",
        "--text": "#1f2328",
        "--text-strong": "#1f2328",
        "--text-muted": "#5c6570",
        "--border": "#c9c3b7",
        "--border-strong": "#9f927d",
        "--accent": "#184f6a",
        "--accent-hover": "#113b50",
        "--warning-bg": "#fff4d8",
        "--warning-border": "#d7b86d",
    },
    "dark": {
        "--bg": "#151512",
        "--panel": "#1d1c18",
        "--text": "#ebe7dc",
        "--text-strong": "#ebe7dc",
        "--text-muted": "#b4ab9b",
        "--border": "#4a4438",
        "--border-strong": "#746a5b",
        "--accent": "#9fc7d7",
        "--accent-hover": "#c0deea",
        "--warning-bg": "#2e2208",
        "--warning-border": "#7c5d19",
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
        ".note-box": {
            "background": "var(--warning-bg)",
            "border": "1px solid var(--warning-border)",
            "color": "var(--text-strong)",
        },
        ".note-box p": {"color": "var(--text-strong)"},
        ".note-box strong": {"color": "var(--text-strong)"},
    },
    "scratchpad": {
        ".notice": {
            "background": "var(--warning-bg)",
            "border": "1px solid var(--warning-border)",
            "color": "var(--text-strong)",
        },
        ".notice p": {"color": "var(--text-strong)"},
        ".notice strong": {"color": "var(--text-strong)"},
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

    if failures:
        print("Public token audit FAILED:\n")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("Public token audit passed for: " + ", ".join(SITES))
    return 0


if __name__ == "__main__":
    sys.exit(main())
