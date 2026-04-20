# Parking Slot Tracker

A simple parking slot management web app built with Flask, SQLite, HTML, CSS, and JavaScript.

## Live Demo

- Live site: [https://jishumahato.pythonanywhere.com](https://jishumahato.pythonanywhere.com)

## Features

- View all parking slots in a parking-lot style UI
- Add a new parking slot from the form
- Update slot status to `FREE` or `OCCUPIED`
- Edit an existing slot number and status
- Delete a slot from the UI
- SQLite database created automatically on first run
- Default slots seeded automatically (`A1-A6`, `B1-B6`)

## Tech Stack

- Python
- Flask
- SQLite
- HTML
- CSS
- JavaScript

## Project Structure

```text
parking-slots/
|-- app.py
|-- parking_slots.db
|-- requirements.txt
|-- templates/
|   `-- index.html
`-- static/
    |-- app.js
    `-- styles.css
```

## API Routes

- `GET /slots` fetch all parking slots
- `POST /slots` add a new slot
- `PUT /slots/<id>` update slot number or status
- `DELETE /slots/<id>` delete a slot

## Run Locally

1. Open a terminal in the project folder.
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

- The SQLite database file is `parking_slots.db`.
- The project is also deployed on PythonAnywhere.
