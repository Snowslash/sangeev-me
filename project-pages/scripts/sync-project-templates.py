"""Check or regenerate the eleven page-body copies in explicitly selected sibling clones."""
import argparse
from pathlib import Path
import sys

CANONICAL = Path(__file__).resolve().parents[1] / 'shared'
REACT = (
    'clinical-shift-scratchpad/landing/src',
    'op-note-gen/src/landing',
    'AlignEd/src/landing',
    'casebook/src/landing',
    'glassbox/web/src',
)


def synchronise(root: Path, write: bool = False) -> list[str]:
    pending = []
    # Read and validate the complete plan before the first write. This is a
    # maintainer utility for trusted clones, not an untrusted-file publisher.
    for filename, folders in [('ProjectPage.tsx', REACT), ('project-page.css', (*REACT, 'parallax/demo'))]:
        expected = (CANONICAL / filename).read_bytes()
        for folder in folders:
            target = root / folder / filename
            if not target.parent.is_dir():
                raise FileNotFoundError(f'Missing consumer directory: {target.parent}')
            if any(part.is_symlink() for part in (target, *target.parents)):
                raise ValueError(f'Symlinked consumer path: {target}')
            if not target.is_file() or target.read_bytes() != expected:
                pending.append((target, expected))
    if write:
        for target, expected in pending:
            target.write_bytes(expected)
        return []
    return [str(target.relative_to(root)) for target, _ in pending]


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, required=True, help='Parent of the six sibling repository clones; see ../README.md')
    parser.add_argument('--write', action='store_true', help='Regenerate only the five React components and six stylesheets; default checks only')
    options = parser.parse_args()
    try:
        differences = synchronise(options.root.absolute(), options.write)
    except (OSError, ValueError) as error:
        parser.exit(1, f'{error}\n')
    if differences:
        print('\n'.join(differences))
        sys.exit(1)
    print('Shared project templates match: five React components and six stylesheets.')
