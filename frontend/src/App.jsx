import { useState } from "react";
import "./App.css";

function App() {
    const [studentId, setStudentId] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const getStudentDetails = async () => {
        if (!studentId.trim()) {
            setError("Please enter a Student ID");
            return;
        }

        setLoading(true);
        setError("");
        setData(null);

        try {
            const response = await fetch(
                `http://localhost:5001/students/${studentId}/details`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to get student details");
            }

            setData(result);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">

            <div className="card">

                <h1>Student-Course Management System</h1>

                <p className="subtitle">
                    MERN Microservices Application
                </p>

                <div className="search-box">

                    <input
                        type="text"
                        placeholder="Enter Student ID"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                getStudentDetails();
                            }
                        }}
                    />

                    <button onClick={getStudentDetails}>
                        {loading ? "Loading..." : "Get Details"}
                    </button>

                </div>

                {error && (
                    <div className="error">
                        {error}
                    </div>
                )}

                {data && (
                    <div className="details">

                        <div className="section">
                            <h2>Student Details</h2>

                            <p>
                                <strong>Student ID:</strong>{" "}
                                {data.student.studentId}
                            </p>

                            <p>
                                <strong>Name:</strong>{" "}
                                {data.student.name}
                            </p>

                            <p>
                                <strong>Email:</strong>{" "}
                                {data.student.email}
                            </p>
                        </div>

                        <div className="section">
                            <h2>Course Details</h2>

                            <p>
                                <strong>Course ID:</strong>{" "}
                                {data.course.courseId}
                            </p>

                            <p>
                                <strong>Course Name:</strong>{" "}
                                {data.course.courseName}
                            </p>

                            <p>
                                <strong>Credits:</strong>{" "}
                                {data.course.credits}
                            </p>
                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}

export default App;