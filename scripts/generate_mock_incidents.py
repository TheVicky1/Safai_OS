"""Mock incident seed dataset generator for client-side development.

Generates realistic mock waste incidents for the Citizen, Driver, and
Admin client apps. The output matches the approved mock incident fields
from issue #35 and is written as cleanly formatted JSON.

Usage:
    python scripts/generate_mock_incidents.py --count 10
    python scripts/generate_mock_incidents.py --output data/mock_incidents.json

Only the Python standard library is used.
"""

import argparse
import json
import random
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

WASTE_CATEGORIES = ("organic", "plastic", "metal", "e_waste", "hazardous")
SEVERITIES = ("low", "medium", "high", "critical")
STATUSES = ("reported", "dispatched", "cleaned", "verified")

# Approximate bounding boxes (latitude, longitude) for the three cities
# covered by the mock data.
CITY_BOUNDS = {
    "Mumbai": (18.95, 19.25, 72.80, 72.98),
    "Delhi": (28.45, 28.85, 76.85, 77.30),
    "Bengaluru": (12.85, 13.15, 77.45, 77.75),
}

TITLES = {
    "organic": [
        "Overflowing organic waste bin near {place}",
        "Rotting vegetable waste dumped at {place}",
        "Food waste pile outside {place}",
    ],
    "plastic": [
        "Plastic bottles scattered near {place}",
        "Polythene bags dumped at {place}",
        "Plastic wrappers littering {place}",
    ],
    "metal": [
        "Scrap metal cans piled at {place}",
        "Discarded metal sheets near {place}",
        "Rusty metal containers dumped at {place}",
    ],
    "e_waste": [
        "Discarded batteries and chargers at {place}",
        "Broken electronics dumped near {place}",
        "Old CRT monitor left at {place}",
    ],
    "hazardous": [
        "Chemical drums leaking near {place}",
        "Hazardous paint cans dumped at {place}",
        "Medical waste found at {place}",
    ],
}

PLACES = (
    "market",
    "bus stop",
    "school gate",
    "residential block",
    "park entrance",
    "metro station",
    "hospital gate",
    "community hall",
    "street corner",
    "public toilet",
)

DEFAULT_OUTPUT = Path(__file__).resolve().parents[1] / "data" / "mock_incidents.json"


def _random_coordinates():
    """Return a random (latitude, longitude) inside a city bounding box."""
    lat_min, lat_max, lon_min, lon_max = random.choice(list(CITY_BOUNDS.values()))
    return round(random.uniform(lat_min, lat_max), 6), round(
        random.uniform(lon_min, lon_max), 6
    )


def generate_incident():
    """Return one mock incident as a dict."""
    waste_category = random.choice(WASTE_CATEGORIES)
    severity = random.choices(SEVERITIES, weights=(35, 35, 20, 10))[0]
    status = random.choices(STATUSES, weights=(40, 25, 20, 15))[0]
    latitude, longitude = _random_coordinates()
    title = random.choice(TITLES[waste_category]).format(
        place=random.choice(PLACES)
    )
    reported_at = datetime.now(timezone.utc) - timedelta(
        minutes=random.randint(0, 30 * 24 * 60)
    )
    return {
        "id": str(uuid.uuid4()),
        "title": title,
        "waste_category": waste_category,
        "severity": severity,
        "status": status,
        "latitude": latitude,
        "longitude": longitude,
        "reported_at": reported_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "citizen_id": str(uuid.uuid4()),
        "assigned_driver_id": str(uuid.uuid4()) if status != "reported" else None,
    }


def generate_incidents(count):
    """Return a list of `count` mock incidents."""
    return [generate_incident() for _ in range(count)]


def main():
    parser = argparse.ArgumentParser(
        description="Generate a mock incident seed dataset."
    )
    parser.add_argument(
        "--count",
        type=int,
        default=25,
        help="Number of mock incidents to generate (default: 25).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Destination JSON file (default: data/mock_incidents.json).",
    )
    args = parser.parse_args()
    if args.count < 0:
        parser.error("--count must be zero or more.")

    incidents = generate_incidents(args.count)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(incidents, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(incidents)} mock incidents to {args.output}")


if __name__ == "__main__":
    main()
