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
