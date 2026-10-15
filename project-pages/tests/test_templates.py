import importlib.util
import os
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('templates', ROOT / 'scripts/sync-project-templates.py')
assert SPEC is not None and SPEC.loader is not None
TEMPLATES = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(TEMPLATES)

class TemplateConsistency(unittest.TestCase):
    def test_check_is_read_only_and_write_regenerates_exact_bytes(self):
        with tempfile.TemporaryDirectory(dir=os.environ.get('TMPDIR')) as directory:
            root = Path(directory)
            for folder in (*TEMPLATES.REACT, 'parallax/demo'):
                (root / folder).mkdir(parents=True)
            self.assertEqual(len(TEMPLATES.synchronise(root)), 11)
            self.assertFalse((root / TEMPLATES.REACT[0] / 'ProjectPage.tsx').exists())
            self.assertEqual(TEMPLATES.synchronise(root, write=True), [])
            self.assertEqual(TEMPLATES.synchronise(root), [])
            target = root / TEMPLATES.REACT[0] / 'ProjectPage.tsx'
            target.write_text('drift\n')
            self.assertEqual(TEMPLATES.synchronise(root), [str(target.relative_to(root))])
            self.assertEqual(target.read_text(), 'drift\n')
            self.assertEqual(TEMPLATES.synchronise(root, write=True), [])
            self.assertEqual(target.read_bytes(), (TEMPLATES.CANONICAL / 'ProjectPage.tsx').read_bytes())

    def test_bad_layout_does_not_create_or_rewrite_any_target(self):
        with tempfile.TemporaryDirectory(dir=os.environ.get('TMPDIR')) as directory:
            root = Path(directory)
            first = root / TEMPLATES.REACT[0]
            first.mkdir(parents=True)
            target = first / 'ProjectPage.tsx'
            target.write_text('keep\n')
            with self.assertRaises(FileNotFoundError):
                TEMPLATES.synchronise(root, write=True)
            self.assertEqual(target.read_text(), 'keep\n')
            self.assertFalse((root / TEMPLATES.REACT[1]).exists())

if __name__ == '__main__':
    unittest.main()
