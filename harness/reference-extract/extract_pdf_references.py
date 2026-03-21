from __future__ import annotations

import json
import re
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

try:
    from pypdf import PdfReader
except ImportError as error:  # pragma: no cover - environment-specific dependency
    raise SystemExit(
        "pypdf is required. Install it with `python -m pip install --user pypdf` before running this script."
    ) from error


ROOT = Path(__file__).resolve().parents[2]
FIXTURE_DIR = ROOT / "harness" / "copyright" / "fixtures"
MANIFEST_PATH = FIXTURE_DIR / "reference-manifest.json"
REPORT_DIR = ROOT / "harness" / "reports"
REPORT_PATH = REPORT_DIR / "latest-reference-extract-summary.txt"


@dataclass
class SourceResult:
    source: str
    pages: int
    extracted_chars: int
    status: str
    note: str = ""


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFKC", value)
    value = "".join(" " if 0xE000 <= ord(char) <= 0xF8FF else char for char in value)
    value = value.replace("\x00", " ")
    value = "".join(char for char in value if unicodedata.category(char) not in {"Cc", "Cs"})
    value = re.sub(r"[•·▪◆◇■□]+", " ", value)
    value = re.sub(r"[ \t]+", " ", value)
    lines = [normalize_line(line) for line in value.splitlines()]
    lines = [line for line in lines if line]
    return "\n".join(lines).strip()


def normalize_line(value: str) -> str:
    value = value.strip()
    if not value:
        return ""

    value = re.sub(r"\s+", " ", value)

    allowed = sum(
        1
        for char in value
        if (
            char.isalnum()
            or "\uac00" <= char <= "\ud7a3"
            or char in " +-*/=()[]{}.,:%~<>"
        )
    )
    visible = sum(1 for char in value if not char.isspace())

    if visible == 0:
        return ""

    # Drop heavily corrupted lines that are mostly symbol noise after PDF extraction.
    if visible >= 8 and allowed / visible < 0.45:
        return ""

    question_marks = value.count("?")
    if visible >= 12 and question_marks / visible > 0.18:
        return ""

    return value


def get_page_limit(path: Path) -> int | None:
    name = path.name

    if "[수준별 문제은행_발전]" in name:
        return 5
    if "중단원마무리" in name:
        return 2
    if "단원마무리" in name and "발전" in name:
        return 4
    if "대단원평가" in name:
        return 2

    return None


def extract_pdf_text(path: Path) -> tuple[str, int]:
    reader = PdfReader(str(path))
    chunks: list[str] = []
    page_limit = get_page_limit(path)

    for index, page in enumerate(reader.pages, start=1):
        if page_limit is not None and index > page_limit:
            break
        text = page.extract_text() or ""
        normalized = normalize_text(text)
        if normalized:
            chunks.append(f"[page {index}]\n{normalized}")

    return "\n\n".join(chunks).strip(), len(reader.pages)


def iter_groups(manifest: dict) -> Iterable[dict]:
    yield from manifest.get("priorityGroups", [])
    yield from manifest.get("laterCoverage", [])


def write_fixture(target_path: Path, unit_key: str, source_results: list[SourceResult], body_parts: list[str]) -> None:
    header = [
        f"# unit: {unit_key}",
        "# generated-by: harness/reference-extract/extract_pdf_references.py",
        "# note: extracted reference text for internal copyright comparison only",
        "",
    ]
    footer = [
        "",
        "# sources",
    ]
    footer.extend(f"- {result.source} [{result.status}]" for result in source_results)

    target_path.write_text("\n".join(header + body_parts + footer).strip() + "\n", encoding="utf-8")


def main() -> int:
    if not MANIFEST_PATH.exists():
        print(f"Manifest not found: {MANIFEST_PATH}", file=sys.stderr)
        return 1

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    FIXTURE_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    report_lines = ["[reference extract harness]"]
    total_groups = 0
    total_sources = 0
    total_success = 0

    for group in iter_groups(manifest):
        total_groups += 1
        unit_key = group["unitKey"]
        fixture_name = group["targetFixture"]
        fixture_path = FIXTURE_DIR / fixture_name
        body_parts: list[str] = []
        source_results: list[SourceResult] = []

        for source in group.get("sources", []):
            total_sources += 1
            source_path = Path(source)
            if not source_path.exists():
                source_results.append(SourceResult(source, 0, 0, "missing", "file not found"))
                continue

            try:
                text, page_count = extract_pdf_text(source_path)
            except Exception as error:  # pragma: no cover - extraction depends on local files
                source_results.append(SourceResult(source, 0, 0, "failed", str(error)))
                continue

            extracted_chars = len(text)
            status = "ok" if extracted_chars > 0 else "empty"
            if extracted_chars > 0:
                total_success += 1
                body_parts.append(f"## source: {source}\n\n{text}")
            source_results.append(SourceResult(source, page_count, extracted_chars, status))

        write_fixture(fixture_path, unit_key, source_results, body_parts)

        ok_count = sum(1 for result in source_results if result.status == "ok")
        report_lines.append(f"- {unit_key}: fixture={fixture_name}, ok={ok_count}/{len(source_results)}")
        for result in source_results:
            line = f"  - {result.status}: {result.source} (pages={result.pages}, chars={result.extracted_chars})"
            if result.note:
                line += f" - {result.note}"
            report_lines.append(line)

    report_lines.append("")
    report_lines.append(
        f"[summary] groups={total_groups}, sources={total_sources}, extracted={total_success}, fixture_dir={FIXTURE_DIR}"
    )
    REPORT_PATH.write_text("\n".join(report_lines) + "\n", encoding="utf-8")
    print("\n".join(report_lines))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
