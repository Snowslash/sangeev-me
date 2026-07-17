#!/usr/bin/env python3
"""Run the successor public-estate visual contract audit.

The canonical implementation now lives in the versioned @sangeev/estate-ui
package. This compatibility entry point keeps the established command while
checking the package source, reproducible artifact, exact dependency pins,
all four site integrations, named layout variants and removal of local chrome
copies.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parent
PACKAGE_ROOT = WORKSPACE / "sangeev-estate-ui"
MANIFEST = PACKAGE_ROOT / "estate.manifest.json"
CONTRACT_CSS = PACKAGE_ROOT / "src/contract.css"
AUDIT = PACKAGE_ROOT / "scripts/audit-estate.mjs"

REQUIRED_SITES = {
    "sangeev.me": "landing",
    "opnotes": "standard-app",
    "scratchpad": "landing",
    "aligned": "wide-app",
}

REQUIRED_TOKENS = (
    "--estate-atlas: #0b655f",
    "--estate-deep: #073f3c",
    "--estate-channel: #0a5652",
    "--estate-shoal: #3b8c83",
    "--estate-mist: #d9eee9",
    "--estate-mist-soft: #c5e3dd",
    "--estate-foam: #f5fffc",
    "--estate-coral: #ff7a66",
    "--estate-leaf: #c4eb62",
    "--estate-ink: #092c2a",
)

RETIRED_TOKENS = ("#8a1538", "#a3264d", "#c43b63")


def main() -> int:
    failures: list[str] = []

    for path in (MANIFEST, CONTRACT_CSS, AUDIT):
        if not path.exists():
            failures.append(f"missing canonical estate package file: {path}")

    if not failures:
        manifest = json.loads(MANIFEST.read_text())
        actual_sites = {site["name"]: site["variant"] for site in manifest.get("sites", [])}
        if actual_sites != REQUIRED_SITES:
            failures.append(f"site inventory mismatch: {actual_sites!r} expected {REQUIRED_SITES!r}")

        css = CONTRACT_CSS.read_text().lower()
        for token in REQUIRED_TOKENS:
            if token not in css:
                failures.append(f"canonical contract missing token: {token}")
        for token in RETIRED_TOKENS:
            if token in css:
                failures.append(f"canonical contract still contains retired burgundy token: {token}")

        for font in (
            PACKAGE_ROOT / "assets/fonts/Literata-Variable.ttf",
            PACKAGE_ROOT / "assets/fonts/AtkinsonHyperlegibleNext-Variable.ttf",
            PACKAGE_ROOT / "LICENSES/OFL-Literata.txt",
            PACKAGE_ROOT / "LICENSES/OFL-Atkinson-Hyperlegible-Next.txt",
        ):
            if not font.exists() or font.stat().st_size == 0:
                failures.append(f"missing or empty packaged font/licence asset: {font}")

    if failures:
        print("Public estate contract audit FAILED:\n")
        for failure in failures:
            print(f"- {failure}")
        return 1

    result = subprocess.run(
        ["node", str(AUDIT)],
        cwd=PACKAGE_ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if result.stdout:
        print(result.stdout.rstrip())
    if result.stderr:
        print(result.stderr.rstrip(), file=sys.stderr)
    if result.returncode:
        return result.returncode

    print("Public estate successor audit passed for: " + ", ".join(REQUIRED_SITES))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
