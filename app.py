from flask import Flask, render_template, request, redirect, url_for, send_file
import datetime
import io
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pyodbc

app = Flask(__name__)


class FitnessTrackerDB:
    def __init__(self):
        self.connection = self.get_db_connection()

    def get_db_connection(self):
        try:
            connection = pyodbc.connect(
                "Driver={SQL Server};"
                "Server=SAMAR\MSSQLSERVER01;"
                "Database=Fitometer;"
                "Trusted_Connection=yes;"
            )
            return connection
        except Exception as e:
            print("Error connecting to database:", e)
            return None

    def create_activity(
        self, activity_date, duration_minutes, exercise_name, muscle_group, sets, reps
    ):
        try:
            cursor = self.connection.cursor()
            cursor.execute(
                "INSERT INTO FitnessActivity (activity_date, duration_minutes, exercise_name, muscle_group, sets, reps) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    activity_date,
                    duration_minutes,
                    exercise_name,
                    muscle_group,
                    sets,
                    reps,
                ),
            )
            self.connection.commit()
            print("Activity logged successfully.")
        except Exception as e:
            print("Error creating activity:", e)

    def generate_graph(self):
        try:
            cursor = self.connection.cursor()
            cursor.execute(
                "SELECT activity_date, duration_minutes FROM FitnessActivity"
            )
            rows = cursor.fetchall()
            activity_data = [{"date": row[0], "duration": row[1]} for row in rows]

            dates = [
                datetime.datetime.strptime(entry["date"], "%Y-%m-%d")
                for entry in activity_data
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
        except Exception as e:
            print("Error generating graph:", e)
            return None

    def reset_activity(self):
        try:
            cursor = self.connection.cursor()
            cursor.execute("TRUNCATE TABLE FitnessActivity")
            self.connection.commit()
            print("Activity data reset successfully.")
        except Exception as e:
            print("Error resetting activity data:", e)

    def close_connection(self):
        if self.connection:
            self.connection.close()
            print("Database connection closed.")


db = FitnessTrackerDB()


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        date = request.form["date"]
        duration = int(request.form["duration"])
        exercise_name = request.form["exercise_name"]
        muscle_group = request.form["muscle_group"]
        sets = int(request.form["sets"])
        reps = int(request.form["reps"])
        db.create_activity(date, duration, exercise_name, muscle_group, sets, reps)
        return redirect(url_for("index"))
    return render_template("index.html")


@app.route("/graph.png")
def graph():
    img = db.generate_graph()
    if img:
        return send_file(img, mimetype="image/png")
    else:
        return "Error generating graph."


@app.route("/reset")
def reset():
    db.reset_activity()
    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True)
