#!/usr/bin/env -S uv run python
"""Consolidate the repository contents into a single text snapshot.

Usage:
    uv run python scripts/consolidate_all.py
    uv run python scripts/consolidate_all.py --output-dir ./consolidated/
"""

import argparse
import os
import sys
from datetime import datetime
from pathlib import Path

EXCLUDED_DIR_NAMES = {".venv", "docs", "logs", "scripts", ".next", "node_modules", "__pycache__", ".git"}
EXCLUDED_FILE_NAMES = {".gitignore", ".env", "license", "licence", "readme.md", "readme.txt"}


def should_exclude(path: Path, root_dir: Path) -> bool:
    """Return True when a path should be excluded from the consolidated output."""
    try:
        relative_path = path.relative_to(root_dir)
    except ValueError:
        return False

    parts = relative_path.parts
    if any(part in EXCLUDED_DIR_NAMES for part in parts[:-1]):
        return True

    if not parts:
        return False

    return relative_path.name.lower() in EXCLUDED_FILE_NAMES


def collect_repository_files(root_dir: Path) -> list[Path]:
    """Collect repository files while excluding the requested paths."""
    collected: list[Path] = []
    root_dir = root_dir.resolve()

    for current_root, dir_names, file_names in os.walk(root_dir):
        current_path = Path(current_root)
        dir_names[:] = [
            name
            for name in dir_names
            if not should_exclude(current_path / name, root_dir)
            and name not in EXCLUDED_DIR_NAMES
        ]

        for file_name in file_names:
            file_path = current_path / file_name
            if should_exclude(file_path, root_dir):
                continue
            if file_path.is_file():
                collected.append(file_path)

    return sorted(collected, key=lambda path: path.relative_to(root_dir).as_posix())


def create_repository_snapshot(root_dir: Path, output_path: Path) -> None:
    """Write a combined text snapshot of the repository contents."""
    files = collect_repository_files(root_dir)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", encoding="utf-8") as handle:
        handle.write(f"# Consolidated repository snapshot\n")
        handle.write(f"# Root: {root_dir}\n")
        handle.write(f"# Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        handle.write(f"# Files included: {len(files)}\n\n")

        for file_path in files:
            relative_path = file_path.relative_to(root_dir).as_posix()
            handle.write(f"===== BEGIN FILE: {relative_path} =====\n")
            try:
                content = file_path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                content = file_path.read_text(encoding="utf-8", errors="replace")
            handle.write(content.rstrip("\n"))
            handle.write("\n")
            handle.write(f"===== END FILE: {relative_path} =====\n\n")


def create_index_file(index_path: Path, root_dir: Path) -> None:
    """Create a simple index of the files included in the snapshot."""
    files = collect_repository_files(root_dir)
    index_path.parent.mkdir(parents=True, exist_ok=True)

    with index_path.open("w", encoding="utf-8") as handle:
        handle.write("Repository Consolidation Index\n")
        handle.write("=============================\n")
        handle.write(f"Root: {root_dir}\n")
        handle.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        handle.write(f"Files included: {len(files)}\n\n")

        for file_path in files:
            relative_path = file_path.relative_to(root_dir).as_posix()
            handle.write(f"- {relative_path}\n")


def create_directory_tree(root_dir: Path, output_path: Path) -> None:
    """Create a text representation of the repository directory tree."""
    output_path.parent.mkdir(parents=True, exist_ok=True)

    def build_tree(start_path: Path):
        tree = {
            "name": start_path.name or str(start_path),
            "children": [],
            "is_dir": True,
        }

        try:
            entries = sorted(
                start_path.iterdir(),
                key=lambda entry: (not entry.is_dir(), entry.name.lower()),
            )
        except OSError:
            return tree

        for entry in entries:
            if entry.name in EXCLUDED_DIR_NAMES or entry.name in EXCLUDED_FILE_NAMES:
                continue

            if entry.is_dir():
                tree["children"].append(build_tree(entry))
            else:
                tree["children"].append({"name": entry.name, "children": [], "is_dir": False})

        return tree

    def format_tree(node, prefix="", is_last=True):
        connector = "└── " if is_last else "├── "
        lines = [f"{prefix}{connector}{node['name']}"]

        if node["is_dir"] and node["children"]:
            next_prefix = f"{prefix}{'    ' if is_last else '│   '}"
            for idx, child in enumerate(node["children"]):
                lines.extend(format_tree(child, next_prefix, idx == len(node["children"]) - 1))

        return lines

    tree = build_tree(root_dir)
    tree_lines = [f"Repository directory tree for {root_dir}", "=" * 40, root_dir.name]
    for idx, child in enumerate(tree["children"]):
        tree_lines.extend(format_tree(child, prefix="", is_last=idx == len(tree["children"]) - 1))

    output_path.write_text("\n".join(tree_lines) + "\n", encoding="utf-8")


def create_readme(output_dir: Path, snapshot_path: Path, index_path: Path, tree_path: Path) -> None:
    """Create a README describing the generated outputs."""
    readme_path = output_dir / "README.md"
    readme_content = f"""# Consolidated Repository Snapshot

This directory contains a repository-wide consolidation generated by the consolidation script.

## Files generated
- {snapshot_path.name}
- {index_path.name}
- {tree_path.name}

## Exclusions
The snapshot intentionally excludes:
- .venv
- .git
- docs
- logs
- scripts
- .gitignore
- .env
- LICENSE / LICENCE
- README.md / readme.md

## Usage
Run with:
```bash
uv run python scripts/consolidate_all.py --output-dir ./consolidated/
```
"""
    readme_path.write_text(readme_content, encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Consolidate the repository into a single text file")
    parser.add_argument("--output-dir", default="./consolidated", help="Directory for generated output files")
    parser.add_argument("--repo-root", default=str(Path(__file__).resolve().parents[1]), help="Repository root to scan")
    return parser.parse_args()


def main() -> bool:
    """Main consolidation function."""
    args = parse_args()
    output_dir = Path(args.output_dir).resolve()
    repo_root = Path(args.repo_root).resolve()

    print("\n" + "=" * 80)
    print("REPOSITORY CONSOLIDATION TOOL")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    output_dir.mkdir(parents=True, exist_ok=True)
    snapshot_path = output_dir / "consolidated_repository_files.txt"
    index_path = output_dir / "consolidated_repository_files_index.txt"
    tree_path = output_dir / "repository_directory_tree.txt"

    try:
        create_repository_snapshot(repo_root, snapshot_path)
        create_index_file(index_path, repo_root)
        create_directory_tree(repo_root, tree_path)
        create_readme(output_dir, snapshot_path, index_path, tree_path)
    except Exception as exc:  # pragma: no cover - defensive logging
        print(f"❌ Consolidation failed: {exc}")
        return False

    print(f"Repository root: {repo_root}")
    print(f"Output directory: {output_dir}")
    print(f"Snapshot file: {snapshot_path}")
    print(f"Index file: {index_path}")
    print(f"Directory tree: {tree_path}")
    print(f"README: {output_dir / 'README.md'}")
    print("\nConsolidation complete.")
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
