import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import api from "../utils/api"

function Students() {
  const [students, setStudents] = useState([])
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState("")
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem("access")) { navigate("/"); return }
    Promise.all([
      api.get("/students/"),
      api.get("/exams/")
    ]).then(([studentsRes, examsRes]) => {
      setStudents(studentsRes.data)
      setExams(examsRes.data)
      setLoading(false)
    })
  }, [])

  const handleDownloadReport = async (studentId) => {
    if (!selectedExam) {
      alert("Please select an exam first!")
      return
    }
    setDownloading(studentId)
    try {
      const token = localStorage.getItem("access")
      const response = await fetch(
        `http://127.0.0.1:8000/api/students/${studentId}/exams/${selectedExam}/report-card/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      if (!response.ok) throw new Error("Failed to generate report card")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `report_card_${studentId}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert("Error generating report card. Make sure marks are entered for this student!")
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <Navbar />
      <div style={{ padding: "32px" }}>
        <h2 style={{ color: "#333", marginBottom: "24px" }}>👨‍🎓 Students</h2>

        <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "24px" }}>
          <label style={{ fontWeight: "500", color: "#555", marginBottom: "8px", display: "block" }}>
            Select Exam to generate Report Cards:
          </label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            style={{ width: "100%", padding: "12px", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "15px" }}
          >
            <option value="">-- Select an exam --</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>{e.name} — {e.date}</option>
            ))}
          </select>
        </div>

        {loading ? <p>Loading...</p> : (
          <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                  {["ID", "First Name", "Last Name", "Class", "Gender", "Report Card"].map((h) => (
                    <th key={h} style={{ padding: "14px 16px", color: "white", textAlign: "left", fontSize: "14px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id} style={{ background: i % 2 === 0 ? "white" : "#f9f9f9", borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px 16px", color: "#666" }}>#{s.id}</td>
                    <td style={{ padding: "12px 16px", color: "#333" }}>{s.first_name}</td>
                    <td style={{ padding: "12px 16px", color: "#333" }}>{s.last_name}</td>
                    <td style={{ padding: "12px 16px", color: "#666" }}>{s.student_class}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        background: s.gender === "male" ? "#e3f2fd" : "#fce4ec",
                        color: s.gender === "male" ? "#1565c0" : "#c62828",
                        padding: "2px 10px", borderRadius: "12px", fontSize: "12px"
                      }}>{s.gender}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={() => handleDownloadReport(s.id)}
                        disabled={downloading === s.id}
                        style={{
                          padding: "6px 14px",
                          background: downloading === s.id ? "#ccc" : "linear-gradient(135deg, #667eea, #764ba2)",
                          color: "white", border: "none", borderRadius: "6px",
                          cursor: downloading === s.id ? "not-allowed" : "pointer",
                          fontSize: "13px", fontWeight: "500"
                        }}
                      >
                        {downloading === s.id ? "Generating..." : "📄 Download PDF"}
                      </button>
                    </td>
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

export default Students
