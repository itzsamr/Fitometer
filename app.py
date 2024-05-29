import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import io
from flask import Flask, render_template, request, redirect, url_for, send_file
import datetime

app = Flask(__name__)


activity_data = []


def generate_graph():
    global activity_data
    dates = [
        datetime.datetime.strptime(entry["date"], "%Y-%m-%d") for entry in activity_data
    ]
    durations = [entry["duration"] for entry in activity_data]

    today = datetime.date.today()
    start_date = today - datetime.timedelta(days=365)
    date_list = [
        start_date + datetime.timedelta(days=x)
        for x in range((today - start_date).days + 1)
    ]

    counts = {date: 0 for date in date_list}
    for date, duration in zip(dates, durations):
        counts[date.date()] += duration

    x = list(counts.keys())
    y = list(counts.values())

    fig, ax = plt.subplots(figsize=(10, 2))
    ax.bar(x, y, width=1, color="green")
    ax.set_xlim(start_date, today)
    ax.set_ylim(0, max(y) + 1e-5)
    ax.axis("off")

    img = io.BytesIO()
    plt.savefig(img, format="png", bbox_inches="tight")
    plt.close(fig)
    img.seek(0)
    return img


@app.route("/", methods=["GET", "POST"])
def index():
    global activity_data
    if request.method == "POST":
        date = request.form["date"]
        duration = int(request.form["duration"])
        activity_data.append({"date": date, "duration": duration})
        return redirect(url_for("index"))
    return render_template("index.html")


@app.route("/graph.png")
def graph():
    img = generate_graph()
    return send_file(img, mimetype="image/png")


@app.route("/reset")
def reset():
    global activity_data
    activity_data = []
    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True)
