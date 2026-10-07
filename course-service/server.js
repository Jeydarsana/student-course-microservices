const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ================================
// Middleware
// ================================
app.use(cors());
app.use(express.json());

// ================================
// Configuration
// ================================
const PORT = process.env.PORT || 5002;

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/coursedb";

// ================================
// Course Schema
// ================================
const courseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    courseName: {
      type: String,
      required: true,
      trim: true,
    },

    credits: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// ================================
// Course Model
// ================================
const Course = mongoose.model("Course", courseSchema);

// ================================
// Home Route
// ================================
app.get("/", (req, res) => {
  res.json({
    message: "Course Service is running",
    port: PORT,
  });
});

// ================================
// Add Course
// POST /courses
// ================================
app.post("/courses", async (req, res) => {
  try {
    const { courseId, courseName, credits } = req.body;

    // Validate input
    if (!courseId || !courseName || credits === undefined) {
      return res.status(400).json({
        message: "courseId, courseName and credits are required",
      });
    }

    // Check whether course already exists
    const existingCourse = await Course.findOne({ courseId });

    if (existingCourse) {
      return res.status(409).json({
        message: "Course ID already exists",
        course: existingCourse,
      });
    }

    // Create new course
    const course = new Course({
      courseId,
      courseName,
      credits,
    });

    await course.save();

    res.status(201).json({
      message: "Course added successfully",
      course,
    });
  } catch (error) {
    console.error("Error adding course:", error);

    res.status(500).json({
      message: "Failed to add course",
      error: error.message,
    });
  }
});

// ================================
// Get All Courses
// GET /courses
// ================================
app.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find();

    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);

    res.status(500).json({
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
});

// ================================
// Get Course by Course ID
// GET /courses/:id
// ================================
app.get("/courses/:id", async (req, res) => {
  try {
    const course = await Course.findOne({
      courseId: req.params.id,
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course:", error);

    res.status(500).json({
      message: "Failed to fetch course",
      error: error.message,
    });
  }
});

// ================================
// Connect to MongoDB
// ================================
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Course MongoDB Connected");
    console.log(`Using MongoDB: ${MONGO_URI}`);

    // ================================
    // Start Course Service
    // ================================
    app.listen(PORT, () => {
      console.log(`Course Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Course MongoDB Connection Error:", error);
  });