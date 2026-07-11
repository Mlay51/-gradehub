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
  const [search, setSearch] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem("access")) { navigate("/"); return }
    Promise.all([api.get("/students/"), api.get("/exams/")]).then(([s, e]) => {
      setStudents(s.data)
      setExams(e.data)
      setLoading(false)
    })
  }, [])

  const handleDownloadReport = async (studentId) => {
    if (!selectedExam) { alert("Please select an exam first!"); return }
    setDownloading(studentId)
    try {
      const token = localStorage.getItem("access")
      const response = await fetch(
        `http://127.0.0.1:8000/api/students/${studentId}/exams/${selectedExam}/report-card/`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) throw new Error("Failed")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `report_card_${studentId}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert("Error generating report card. Make sure marks are entered!")
    } finally {
      setDownloading(null)
    }
  }

  const filtered = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <Navbar />
      <div style={{ padding: "32px 40px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ color: "#333", margin: "0 0 4px 0", fontSize: "24px" }}>👨‍🎓 Students</h2>
            <p style={{ color: "#888", margin: 0 }}>{students.length} students registered</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <label style={{ fontWeight: "500", color: "#555", marginBottom: "8px", display: "block", fontSize: "13px" }}>
              🔍 Search Students
            </label>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ background: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <label style={{ fontWeight: "500", color: "#555", marginBottom: "8px", display: "block", fontSize: "13px" }}>
              📋 Select Exam for Report Card
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "14px" }}
            >
              <option value="">-- Select an exam --</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>{e.name} — {e.date}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#888" }}>Loading students...</div>
        ) : (
          <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                  {["#", "First Name", "Last Name", "Class", "Gender", "Report Card"].map((h) => (
                    <th key={h} style={{ padding: "16px 20px", color: "white", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0", transition: "background 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f8f9ff"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ padding: "14px 20px", color: "#999", fontSize: "13px" }}>#{s.id}</td>
                    <td style={{ padding: "14px 20px", color: "#333", fontWeight: "500" }}>{s.first_name}</td>
                    <td style={{ padding: "14px 20px", color: "#333" }}>{s.last_name}</td>
                    <td style={{ padding: "14px 20px", color: "#666" }}>{s.student_class}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        background: s.gender === "male" ? "#dbeafe" : "#fce7f3",
                        color: s.gender === "male" ? "#1d4ed8" : "#be185d",
                        padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "500"
                      }}>{s.gender}</span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <button
                        onClick={() => handleDownloadReport(s.id)}
                        disabled={downloading === s.id}
                        style={{
                          padding: "8px 16px",
                          background: downloading === s.id ? "#e0e0e0" : "linear-gradient(135deg, #667eea, #764ba2)",
                          color: downloading === s.id ? "#999" : "white",
                          border: "none", borderRadius: "8px",
                          cursor: downloading === s.id ? "not-allowed" : "pointer",
                          fontSize: "13px", fontWeight: "500"
                        }}
                      >
                        {downloading === s.id ? "Generating..." : "📄 Download PDF"}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#888" }}>
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Students
