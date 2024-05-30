# Fitness Tracker - Fitometer

Fitometer is a fitness tracking web application built using Flask. It allows users to log their daily activities and view a graphical representation of their activity over the past year.

## Features

- Log daily fitness activities including exercise name, muscle group, sets, and reps.
- View a line graph of activity duration over the past year.
- Reset activity data.

## Requirements

- Python 3.x
- Flask
- pyodbc
- matplotlib
- SQL Server

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/itzsamr/Fitometer.git
    cd Fitometer
    ```

2. Create and activate a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. Set up your SQL Server database and create the necessary table:
    ```sql
    CREATE DATABASE Fitometer;

    USE Fitometer;

    CREATE TABLE FitnessActivity (
        id INT IDENTITY(1,1) PRIMARY KEY,
        activity_date DATE NOT NULL,
        duration_minutes INT NOT NULL,
        exercise_name VARCHAR(100) NOT NULL,
        muscle_group VARCHAR(100) NOT NULL,
        sets INT NOT NULL,
        reps INT NOT NULL
    );
    ```

4. Configure the database connection in `app.py`:
    ```python
    connection = pyodbc.connect(
        "Driver={SQL Server};"
        "Server=YOUR_SERVER_NAME;"
        "Database=Fitometer;"
        "Trusted_Connection=yes;"
    )
    ```

## Usage

1. Run the Flask application:
    ```bash
    python app.py
    ```

2. Open your web browser and go to `http://127.0.0.1:5000`.

3. Log your daily fitness activities and view the activity graph.

## File Structure

- `app.py`: The main Flask application file.
- `templates/index.html`: The HTML template for the web interface.
- `static/`: Directory for static files like CSS and JavaScript (if any).
- `requirements.txt`: List of Python dependencies.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Flask](https://flask.palletsprojects.com/)
- [pyodbc](https://github.com/mkleehammer/pyodbc)
- [matplotlib](https://matplotlib.org/)
