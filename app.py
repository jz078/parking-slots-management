import sqlite3
from pathlib import Path
from flask import Flask, jsonify, render_template, request

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "parking_slots.db"

DEFAULT_SLOTS = [f"A{i}" for i in range(1, 7)] + [f"B{i}" for i in range(1, 7)]
VALID_STATUSES = {"FREE", "OCCUPIED"}

app = Flask(__name__)


def get_db_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_db_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS parking_slots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slot_number TEXT NOT NULL UNIQUE,
                status TEXT NOT NULL CHECK (status IN ('FREE', 'OCCUPIED'))
            )
        """)

        slot_count = connection.execute(
            "SELECT COUNT(*) AS total FROM parking_slots"
        ).fetchone()["total"]

        if slot_count == 0:
            connection.executemany(
                "INSERT INTO parking_slots (slot_number, status) VALUES (?, ?)",
                [(slot_number, "FREE") for slot_number in DEFAULT_SLOTS],
            )

        connection.commit()


def fetch_all_slots():
    with get_db_connection() as connection:
        rows = connection.execute(
            "SELECT id, slot_number, status FROM parking_slots ORDER BY slot_number"
        ).fetchall()
    return [dict(row) for row in rows]


def fetch_slot(slot_id):
    with get_db_connection() as connection:
        row = connection.execute(
            "SELECT id, slot_number, status FROM parking_slots WHERE id = ?",
            (slot_id,),
        ).fetchone()
    return dict(row) if row else None


@app.route("/")
def index():
    return render_template("index.html")


@app.get("/slots")
def get_slots():
    return jsonify(fetch_all_slots())


@app.post("/slots")
def create_slot():
    payload = request.get_json(silent=True) or {}

    slot_number = str(payload.get("slot_number", "")).strip().upper()
    status = str(payload.get("status", "FREE")).strip().upper()

    if not slot_number:
        return jsonify({"error": "slot_number is required"}), 400

    if status not in VALID_STATUSES:
        return jsonify({"error": "status must be FREE or OCCUPIED"}), 400

    try:
        with get_db_connection() as connection:
            cursor = connection.execute(
                "INSERT INTO parking_slots (slot_number, status) VALUES (?, ?)",
                (slot_number, status),
            )
            connection.commit()
            new_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        return jsonify({"error": "slot_number must be unique"}), 409

    # inline fetch (since we removed fetch_slot)
    with get_db_connection() as connection:
        row = connection.execute(
            "SELECT id, slot_number, status FROM parking_slots WHERE id = ?",
            (new_id,),
        ).fetchone()

    return jsonify(dict(row)), 201


@app.put("/slots/<int:slot_id>")
def update_slot(slot_id):
    payload = request.get_json(silent=True) or {}
    slot_number = payload.get("slot_number")
    status = payload.get("status")

    existing_slot = fetch_slot(slot_id)
    if not existing_slot:
        return jsonify({"error": "slot not found"}), 404

    if slot_number is None:
        slot_number = existing_slot["slot_number"]
    else:
        slot_number = str(slot_number).strip().upper()

    if status is None:
        status = existing_slot["status"]
    else:
        status = str(status).strip().upper()

    if not slot_number:
        return jsonify({"error": "slot_number is required"}), 400

    if status not in VALID_STATUSES:
        return jsonify({"error": "status must be FREE or OCCUPIED"}), 400

    try:
        with get_db_connection() as connection:
            connection.execute(
                "UPDATE parking_slots SET slot_number = ?, status = ? WHERE id = ?",
                (slot_number, status, slot_id),
            )
            connection.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "slot_number must be unique"}), 409

    return jsonify(fetch_slot(slot_id))


@app.delete("/slots/<int:slot_id>")
def delete_slot(slot_id):
    with get_db_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM parking_slots WHERE id = ?",
            (slot_id,),
        )
        connection.commit()

    if cursor.rowcount == 0:
        return jsonify({"error": "slot not found"}), 404

    return jsonify({"message": "slot deleted"})


init_db()

if __name__ == "__main__":
    app.run(debug=True)
