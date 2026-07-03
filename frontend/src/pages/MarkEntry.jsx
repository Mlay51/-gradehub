import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import api from "../utils/api"

function MarkEntry() {
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [students, setStudents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [marks, setMarks] = useState({})
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem("access")) { navigate("/"); return }
    api.get("/exams/").then((res) => setExams(res.data))
  }, [])

  const handleExamSelect = async (examId) => {
    setGrades([])
    setMessage("")
    setMarks({})
    const exam = exams.find((e) => e.id === parseInt(examId))
    setSelectedExam(exam)
    if (!exam) return
    const [studentsRes, subjectsRes] = await Promise.all([
      api.get(`/students/?student_class=${exam.student_class}`),
      api.get(`/subjects/?student_class=${exam.student_class}`),
    ])
    const allStudents = studentsRes.data.filter(s => s.student_class === exam.student_class)
    const allSubjects = subjectsRes.data.filter(s => s.student_class === exam.student_class)
    setStudents(allStudents)
    setSubjects(allSubjects)
    const initialMarks = {}
    allStudents.forEach(s => {
      allSubjects.forEach(sub => {
        initialMarks[`${s.id}_${sub.id}`] = ""
      })
    })
    setMarks(initialMarks)
  }

  const handleMarkChange = (studentId, subjectId, value) => {
    setMarks(prev => ({ ...prev, [`${studentId}_${subjectId}`]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setMessage("")
    const marksData = []
    students.forEach(s => {
      subjects.forEach(sub => {
        const val = marks[`${s.id}_${sub.id}`]
        if (val !== "") {
          marksData.push({ student_id: s.id, subject_id: sub.id, marks: parseFloat(val) })
        }
      })
    })
    try {
      await api.post(`/exams/${selectedExam.id}/enter-marks/`, { marks: marksData })
      const gradesRes = await api.post(`/exams/${selectedExam.id}/calculate-grades/`)
      setGrades(gradesRes.data)
      setMessage("✅ Marks saved and grades calculated successfully!")
    } catch (err) {
      setMessage("❌ Error saving marks. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <Navbar />
      <div style={{ padding: "32px" }}>
        <h2 style={{ color: "#333", marginBottom: "24px" }}>📝 Mark Entry</h2>

        <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "24px" }}>
          <label style={{ fontWeight: "500", color: "#555", marginBottom: "8px", display: "block" }}>Select Exam</label>
          <select
            onChange={(e) => handleExamSelect(e.target.value)}
            style={{ width: "100%", padding: "12px", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "15px" }}
          >
            <option value="">-- Select an exam --</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>{e.name} — {e.date}</option>
            ))}
          </select>
        </div>

        {selectedExam && students.length > 0 && (
          <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden", marginBottom: "24px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                  <th style={{ padding: "14px 16px", color: "white", textAlign: "left" }}>Student</th>
                  {subjects.map((sub) => (
                    <th key={sub.id} style={{ padding: "14px 16px", color: "white", textAlign: "center" }}>
                      {sub.name}<br/>
                      <span style={{ fontSize: "11px", opacity: 0.8 }}>Max: {sub.max_marks}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id} style={{ background: i % 2 === 0 ? "white" : "#f9f9f9", borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "500", color: "#333" }}>
                      {s.first_name} {s.last_name}
                    </td>
                    {subjects.map((sub) => (
                      <td key={sub.id} style={{ padding: "8px 12px", textAlign: "center" }}>
                        <input
                          type="number"
                          min="0"
                          max={sub.max_marks}
                          value={marks[`${s.id}_${sub.id}`]}
                          onChange={(e) => handleMarkChange(s.id, sub.id, e.target.value)}
                          style={{
                            width: "70px", padding: "6px", textAlign: "center",
                            border: "2px solid #e0e0e0", borderRadius: "6px", fontSize: "14px"
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ padding: "16px", borderTop: "1px solid #eee", display: "flex", alignItems: "center", gap: "16px" }}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: "12px 32px", background: "linear-gradient(135deg, #667eea, #764ba2)",
                  color: "white", border: "none", borderRadius: "8px",
                  fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold"
                }}
              >
                {loading ? "Saving..." : "💾 Save Marks & Calculate Grades"}
              </button>
              {message && <span style={{ color: message.includes("✅") ? "green" : "red", fontWeight: "500" }}>{message}</span>}
            </div>
          </div>
        )}

        {grades.length > 0 && (
          <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee" }}>
              <h3 style={{ margin: 0, color: "#333" }}>🏆 Grade Results</h3>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  {["Rank", "Student", "Total Marks", "Percentage", "Grade", "Remarks"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#555", fontSize: "13px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grades.map((g, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #eee", background: i === 0 ? "#fffde7" : "white" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        background: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "#eee",
                        padding: "2px 10px", borderRadius: "12px", fontWeight: "bold", fontSize: "13px"
                      }}>#{g.rank}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: "500" }}>{g.student}</td>
                    <td style={{ padding: "12px 16px", color: "#666" }}>{g.total}</td>
                    <td style={{ padding: "12px 16px", color: "#666" }}>{g.percentage}%</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        background: g.grade === "A" ? "#e8f5e9" : g.grade === "B" ? "#e3f2fd" : g.grade === "C" ? "#fff3e0" : g.grade === "D" ? "#fce4ec" : "#ffebee",
                        color: g.grade === "A" ? "#2e7d32" : g.grade === "B" ? "#1565c0" : g.grade === "C" ? "#e65100" : g.grade === "D" ? "#c62828" : "#b71c1c",
                        padding: "4px 12px", borderRadius: "12px", fontWeight: "bold"
                      }}>{g.grade}</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#666", fontSize: "13px" }}>{g.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default MarkEntry
