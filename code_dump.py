import os
from pathlib import Path

# ==============================
# Configuration
# ==============================

OUTPUT_FILE = "code_dump.txt"

IGNORE_NAMES = {
    ".env.example",
    "scaffolder.py",
    ".env",
    ".venv",
    "settings.json",
    "__pycache__",
    ".vscode",
    "node_modules",
    ".git"
}


# ==============================
# Helpers
# ==============================

def should_ignore(path: Path):
    """Check if file or folder should be ignored."""
    for part in path.parts:
        if part in IGNORE_NAMES:
            return True
    return False


def generate_tree(root: Path):
    """Generate tree structure string."""
    lines = []

    def walk(directory: Path, prefix=""):
        entries = sorted(
            [p for p in directory.iterdir() if not should_ignore(p)],
            key=lambda x: (x.is_file(), x.name.lower()),
        )

        for index, entry in enumerate(entries):
            connector = "└── " if index == len(entries) - 1 else "├── "
            lines.append(prefix + connector + entry.name)

            if entry.is_dir():
                extension = "    " if index == len(entries) - 1 else "│   "
                walk(entry, prefix + extension)

    lines.append(root.name)
    walk(root)

    return "\n".join(lines)


def dump_file_contents(root: Path):
    """Return all file contents formatted with headers."""
    content_blocks = []

    for path in sorted(root.rglob("*")):
        if path.is_file() and not should_ignore(path) and path.name != OUTPUT_FILE:
            relative_path = path.relative_to(root)

            header = (
                "\n"
                + "-" * 100
                + f"\nFILE: {relative_path}\n"
                + "-" * 100
                + "\n"
            )

            try:
                file_content = path.read_text(encoding="utf-8", errors="ignore")
            except Exception as e:
                file_content = f"[Error reading file: {e}]"

            content_blocks.append(header + file_content + "\n")

    return "".join(content_blocks)


# ==============================
# Main Execution
# ==============================

def main():
    root = Path(__file__).parent.resolve()
    output_path = root / OUTPUT_FILE

    print("Generating directory tree...")
    tree = generate_tree(root)

    print("Collecting file contents...")
    contents = dump_file_contents(root)

    print("Writing to file...")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(tree + "\n\n")
        f.write(contents)

    print(f"\nCodebase successfully dumped to: {output_path}")


if __name__ == "__main__":
    main()