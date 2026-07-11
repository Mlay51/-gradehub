import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"

function ParentPortal() {
  const [children, setChildren] = useState([])
  const [results, setResults] = useState({})
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState("")
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  useEffect(() => {
    if (!localStorage.getItem("access")) { navigate("/"); return }
    if (user.role !== "parent") { navigate("/dashboard"); return }
    const fetchData = async () => {
      try {
        const [studentsRes, examsRes] = await Promise.all([
          api.get("/students/"),
          api.get("/exams/"),
        ])
        const myChildren = studentsRes.data.filter(s => s.parent === user.id)
        setChildren(myChildren)
        setExams(examsRes.data)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleViewResults = async (examId) => {
    setSelectedExam(examId)
    const resultsData = {}
    for (const child of children) {
      try {
        const res = await api.get(`/results/?student=${child.id}&exam=${examId}`)
        resultsData[child.id] = res.data
      } catch (err) {
        resultsData[child.id] = []
      }
    }
    setResults(resultsData)
  }

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
      alert("Error generating report card!")
    } finally {
      setDownloading(null)
    }
  }

  const getGradeColor = (grade) => {
    const colors = {
      A: { bg: "#dcfce7", color: "#16a34a" },
      B: { bg: "#dbeafe", color: "#1d4ed8" },
      C: { bg: "#fef9c3", color: "#ca8a04" },
      D: { bg: "#fce7f3", color: "#be185d" },
      F: { bg: "#fee2e2", color: "#dc2626" },
    }
    return colors[grade] || { bg: "#f0f0f0", color: "#666" }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* Navbar */}
      <nav style={{
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        padding: "0 40px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 20px rgba(102,126,234,0.4)"
      }}>
        <span style={{ color: "white", fontSize: "22px", fontWeight: "700" }}>🎓 GradeHub</span>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "white", fontSize: "14px", fontWeight: "600" }}>{user.username}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>Parent Portal</div>
          </div>
          <button onClick={() => { localStorage.clear(); navigate("/") }} style={{
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
            color: "white", cursor: "pointer", padding: "8px 18px",
            borderRadius: "8px", fontSize: "14px"
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: "32px 40px" }}>

        {/* Welcome Banner */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "16px", padding: "32px 40px", marginBottom: "32px",
          boxShadow: "0 4px 20px rgba(102,126,234,0.4)"
        }}>
          <h1 style={{ color: "white", margin: "0 0 8px 0", fontSize: "26px" }}>
            Welcome, {user.username}! 👋
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", margin: 0 }}>
            View your children's academic performance and download report cards.
          </p>
        </div>

        {/* Exam Selector */}
        <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "24px" }}>
          <label style={{ fontWeight: "600", color: "#333", marginBottom: "12px", display: "block" }}>
            📋 Select Exam to View Results
          </label>
          <select
            value={selectedExam}
            onChange={(e) => handleViewResults(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", border: "2px solid #e0e0e0", borderRadius: "10px", fontSize: "15px" }}
          >
            <option value="">-- Select an exam --</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>{e.name} — {e.date}</option>
            ))}
          </select>
        </div>

        {/* Children Cards */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#888" }}>Loading...</div>
        ) : children.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "16px", color: "#888" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>👨‍👩‍👧</div>
            <p>No children linked to your account yet.</p>
            <p style={{ fontSize: "13px" }}>Please contact the school administrator.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(500px, 1fr))", gap: "24px" }}>
            {children.map((child) => (
              <div key={child.id} style={{ background: "white", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>

                {/* Child Header */}
                <div style={{
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                      width: "50px", height: "50px", borderRadius: "50%",
                      background: "rgba(255,255,255,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px"
                    }}>
                      {child.gender === "male" ? "👦" : "👧"}
                    </div>
                    <div>
                      <h3 style={{ color: "white", margin: "0 0 4px 0", fontSize: "18px" }}>
                        {child.first_name} {child.last_name}
                      </h3>
                      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>
                        Class ID: {child.student_class}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadReport(child.id)}
                    disabled={!selectedExam || downloading === child.id}
                    style={{
                      padding: "8px 16px",
                      background: !selectedExam ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.25)",
                      border: "1px solid rgba(255,255,255,0.4)",
                      color: "white", borderRadius: "8px", cursor: !selectedExam ? "not-allowed" : "pointer",
                      fontSize: "13px", fontWeight: "500"
                    }}
                  >
                    {downloading === child.id ? "Generating..." : "📄 Download PDF"}
                  </button>
                </div>

                {/* Results Table */}
                {selectedExam && results[child.id] ? (
                  results[child.id].length > 0 ? (
                    <div>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#f8f9ff" }}>
                            {["Subject", "Marks", "Max", "Percentage", "Grade"].map((h) => (
                              <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", color: "#888", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {results[child.id].map((r, i) => {
                            const percentage = Math.round((r.marks / 100) * 100)
                            const grade = r.remarks.includes("Grade:") ? r.remarks.split("Grade:")[1].split("|")[0].trim() : "N/A"
                            const gradeStyle = getGradeColor(grade)
                            return (
                              <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                <td style={{ padding: "12px 16px", color: "#333", fontWeight: "500" }}>{r.subject}</td>
                                <td style={{ padding: "12px 16px", color: "#333", fontWeight: "600" }}>{r.marks}</td>
                                <td style={{ padding: "12px 16px", color: "#888" }}>100</td>
                                <td style={{ padding: "12px 16px", color: "#666" }}>{r.marks}%</td>
                                <td style={{ padding: "12px 16px" }}>
                                  <span style={{
                                    background: gradeStyle.bg, color: gradeStyle.color,
                                    padding: "4px 12px", borderRadius: "20px",
                                    fontSize: "12px", fontWeight: "600"
                                  }}>{grade}</span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ padding: "32px", textAlign: "center", color: "#888" }}>
                      No results found for this exam yet.
                    </div>
                  )
                ) : (
                  <div style={{ padding: "32px", textAlign: "center", color: "#888" }}>
                    Select an exam above to view results.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ParentPortal
