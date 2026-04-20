# Parking Slot Tracker

A simple end-to-end parking management web app built with Flask, SQLite, HTML, CSS, and JavaScript.

## Features

- Grid-based parking slot dashboard
- Green `FREE` slots and red `OCCUPIED` slots
- Add new slots from the UI
- Update slot status instantly with API calls
- SQLite database created automatically on first run
- Pre-seeded parking slots (`A1-A6`, `B1-B6`)

## Project Structure

```text
parking-slots/
|-- app.py
|-- requirements.txt
|-- templates/
|   `-- index.html
`-- static/
    |-- app.js
    `-- styles.css
```

## APIs

- `GET /slots` returns all parking slots
- `POST /slots` creates a new slot
- `PUT /slots/<id>` updates a slot status

### Example Request Bodies

Create a slot:

```json
{
  "slot_number": "C1",
  "status": "FREE"
}
```

Update a slot:

```json
{
  "status": "OCCUPIED"
}
```

## Run Locally

1. Open a terminal in the project folder
2. Create a virtual environment:

```powershell
python -m venv .venv
```

3. Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

4. Install dependencies:

```powershell
pip install -r requirements.txt
```

5. Start the app:

```powershell
flask --app app run --debug
```

6. Open [http://127.0.0.1:5000](http://127.0.0.1:5000)

## Notes

- The SQLite database file is `parking_slots.db` and is created automatically.
- If `python` is not available in your shell, use the full path to your Python installation.
