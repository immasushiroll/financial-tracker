#!/usr/bin/env python3
"""
writer.py

Plain CLI script meant to be invoked as a subprocess from Electron's 
main.js (e.g. via child_process.execFile).

It always prints a single JSON object to stdout and exits 0 on success,
or exits 1 with {"success": false, "error": "..."} on failure.
main.js should read stdout, JSON.parse it, and resolve/reject the IPC
call accordingly.

Usage:
    python3 writer.py transaction --data-dir <dir> --name <name> \
        --portfolio <portfolio> --side <buy|sell> --amount <amount> \
        --price <price> --stockcode <code> [--finalbuyprice <price>]

    python3 writer.py extract --image <path-to-png>
"""

import argparse
import csv
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

TRANSACTIONS_FILENAME = "transactions.csv"
CSV_FIELDS = [
    "timestamp",
    "name",
    "portfolio",
    "side",
    "stockcode",
    "amount",
    "price",
    "finalbuyprice",
]


def fail(message):
    print(json.dumps({"success": False, "error": message}))
    sys.exit(1)


def succeed(data):
    print(json.dumps({"success": True, "data": data}))
    sys.exit(0)


def parse_number(raw, field_name, required=True):
    if raw is None or raw == "":
        if required:
            fail(f"Missing required field: {field_name}")
        return None
    try:
        return float(raw)
    except ValueError:
        fail(f"Field '{field_name}' must be a number, got: {raw!r}")


def handle_transaction(args):
    data_dir = Path(args.data_dir).expanduser()
    try:
        data_dir.mkdir(parents=True, exist_ok=True)
    except OSError as e:
        fail(f"Could not create data directory {data_dir}: {e}")

    csv_path = data_dir / TRANSACTIONS_FILENAME
    file_exists = csv_path.exists()

    row = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "name": args.name,
        "portfolio": args.portfolio,
        "side": args.side,
        "stockcode": args.stockcode.upper() if args.stockcode else args.stockcode,
        "amount": parse_number(args.amount, "amount"),
        "price": parse_number(args.price, "price"),
        "finalbuyprice": parse_number(args.finalbuyprice, "finalbuyprice", required=False),
    }

    if not row["name"]:
        fail("Missing required field: name")
    if not row["portfolio"]:
        fail("Missing required field: portfolio")
    if args.side not in ("buy", "sell"):
        fail(f"Field 'side' must be 'buy' or 'sell', got: {args.side!r}")
    if not row["stockcode"]:
        fail("Missing required field: stockcode")

    try:
        with open(csv_path, "a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
            if not file_exists:
                writer.writeheader()
            writer.writerow(row)
    except OSError as e:
        fail(f"Could not write to {csv_path}: {e}")

    succeed({"written_to": str(csv_path), "row": row})


def handle_extract(args):
    try:
        from PIL import Image
        import pytesseract
    except ImportError as e:
        fail(
            "Missing dependency. Run: pip install pytesseract pillow "
            f"(and make sure the tesseract binary is installed) - {e}"
        )

    image_path = Path(args.image).expanduser()
    if not image_path.exists():
        fail(f"Image not found: {image_path}")
    if image_path.suffix.lower() != ".png":
        fail(f"Only PNG files are supported, got: {image_path.suffix}")

    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
    except pytesseract.TesseractNotFoundError:
        fail(
            "Tesseract binary not found on this system. Install it "
            "(e.g. 'brew install tesseract' or 'apt install tesseract-ocr') "
            "and ensure it's on PATH."
        )
    except Exception as e:
        fail(f"OCR failed: {e}")

    succeed({"text": text})


def build_parser():
    parser = argparse.ArgumentParser(description="Financial tracker backend script")
    subparsers = parser.add_subparsers(dest="command", required=True)

    tx = subparsers.add_parser("transaction", help="Log a new transaction to CSV")
    tx.add_argument("--data-dir", required=True, help="Directory to store transactions.csv in")
    tx.add_argument("--name", required=True)
    tx.add_argument("--portfolio", required=True)
    tx.add_argument("--side", required=True, choices=["buy", "sell"])
    tx.add_argument("--amount", required=True)
    tx.add_argument("--price", required=True)
    tx.add_argument("--finalbuyprice", required=False, default=None)
    tx.add_argument("--stockcode", required=True)
    tx.set_defaults(func=handle_transaction)

    extract = subparsers.add_parser("extract", help="Extract text from a PNG via OCR")
    extract.add_argument("--image", required=True, help="Path to the PNG file")
    extract.set_defaults(func=handle_extract)

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()