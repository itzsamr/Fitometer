from flask import Flask, render_template, request, redirect, url_for, send_file
import matplotlib.pyplot as plt
import datetime
import io

# Use 'Agg' backend for Matplotlib
import matplotlib

matplotlib.use("Agg")

app = Flask(__name__)

# In-memory storage for activity data
activity_data = []


# Function to generate the contribution graph
def generate_graph():
    dates = [
        datetime.datetime.strptime(entry["date"], "%Y-%m-%d") for entry in activity_data
    ]
    durations = [entry["duration"] for entry in activity_data]

    # Create a list of dates for the past year
    today = datetime.date.today()
    start_date = today - datetime.timedelta(days=365)
    date_list = [
        start_date + datetime.timedelta(days=x)
        for x in range(0, (today - start_date).days + 1)
    ]

    counts = {date: 0 for date in date_list}
    for date, duration in zip(dates, durations):
        counts[date.date()] += duration

    x = list(counts.keys())
    y = list(counts.values())

    fig, ax = plt.subplots(figsize=(10, 2))
    ax.bar(x, y, width=1, color="green")
    ax.set_xlim(start_date, today)
    ax.set_ylim(0, max(y) + 1e-5)  # Ensure a non-zero range
    ax.axis("off")

    # Save the plot to a BytesIO object
    img = io.BytesIO()
    plt.savefig(img, format="png", bbox_inches="tight")
    plt.close(fig)
    img.seek(0)
    return img


@app.route("/", methods=["GET", "POST"])
def index():
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
