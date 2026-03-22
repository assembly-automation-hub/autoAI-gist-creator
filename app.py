from pathlib import Path

from flask import Flask, send_from_directory

PROJECT_ROOT = Path(__file__).resolve().parent

app = Flask(__name__, static_folder="static")


@app.route("/")
def index():
    return send_from_directory(PROJECT_ROOT, "index.html")


if __name__ == "__main__":
    app.run(debug=True)
