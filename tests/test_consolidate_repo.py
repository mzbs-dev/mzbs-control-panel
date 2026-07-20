import importlib.util
from pathlib import Path


def load_module():
    module_path = Path(__file__).resolve().parents[1] / "scripts" / "consolidate_all.py"
    spec = importlib.util.spec_from_file_location("consolidate_all", module_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_collect_repository_files_excludes_ignored_paths(tmp_path):
    root = tmp_path
    (root / "src").mkdir()
    (root / "src" / "app.py").write_text("print('hi')\n", encoding="utf-8")
    (root / "notes.txt").write_text("keep me\n", encoding="utf-8")

    (root / "docs").mkdir()
    (root / "docs" / "note.md").write_text("skip me\n", encoding="utf-8")

    (root / ".venv").mkdir()
    (root / ".venv" / "bin").mkdir()
    (root / ".venv" / "bin" / "python").write_text("skip me", encoding="utf-8")

    (root / "scripts").mkdir()
    (root / "scripts" / "script.sh").write_text("skip me\n", encoding="utf-8")

    (root / ".gitignore").write_text("*.pyc\n", encoding="utf-8")
    (root / ".env").write_text("SECRET=1\n", encoding="utf-8")
    (root / "LICENSE").write_text("MIT\n", encoding="utf-8")
    (root / "README.md").write_text("welcome\n", encoding="utf-8")

    module = load_module()
    files = module.collect_repository_files(root)
    relative_paths = [path.relative_to(root).as_posix() for path in files]

    assert relative_paths == ["notes.txt", "src/app.py"]
