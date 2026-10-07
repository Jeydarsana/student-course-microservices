const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const Student = require("./models/Student");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = "mongodb://127.0.0.1:27017/studentDB";

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("Student MongoDB Connected");
    })
    .catch((error) => {
        console.error("MongoDB Connection Error:", error);
    });

// Home route
app.get("/", (req, res) => {
    res.json({
        service: "Student Service",
        status: "Running"
    });
});

// ------------------------------------
// POST - Add Student
// ------------------------------------
app.post("/students", async (req, res) => {
    try {
        const { studentId, name, email, courseId } = req.body;

        if (!studentId || !name || !email || !courseId) {
            return res.status(400).json({
                message: "studentId, name, email and courseId are required"
            });
        }

        const existingStudent = await Student.findOne({ studentId });

        if (existingStudent) {
            return res.status(409).json({
                message: "Student ID already exists"
            });
        }

        const student = new Student({
            studentId,
            name,
            email,
            courseId
        });

        const savedStudent = await student.save();

        res.status(201).json(savedStudent);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to add student",
            error: error.message
        });
    }
});

// ------------------------------------
// GET - Get All Students
// ------------------------------------
app.get("/students", async (req, res) => {
    try {
        const students = await Student.find();

        res.json(students);

    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve students",
            error: error.message
        });
    }
});

// ------------------------------------
// GET - Get Student by ID
// ------------------------------------
app.get("/students/:id", async (req, res) => {
    try {
        const student = await Student.findOne({
            studentId: req.params.id
        });

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json(student);

    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve student",
            error: error.message
        });
    }
});

// ------------------------------------
// GET - Student + Course Details
// ------------------------------------
app.get("/students/:id/details", async (req, res) => {
    try {
        // Find student
        const student = await Student.findOne({
            studentId: req.params.id
        });

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        console.log(
            `Requesting course ${student.courseId} from Course Service`
        );

        // Call Course Service
        const courseResponse = await fetch(
            `http://localhost:5002/courses/${student.courseId}`
        );

        if (!courseResponse.ok) {
            return res.status(404).json({
                message: "Course not found in Course Service"
            });
        }

        const course = await courseResponse.json();

        // Combine Student + Course
        res.json({
            student: {
                studentId: student.studentId,
                name: student.name,
                email: student.email,
                courseId: student.courseId
            },
            course: course
        });

    } catch (error) {
        console.error("Inter-service communication error:", error);

        res.status(500).json({
            message: "Inter-service communication failed",
            error: error.message
        });
    }
});

// Start Server
const PORT = 5001;

app.listen(PORT, () => {
    console.log(`Student Service running on port ${PORT}`);
});