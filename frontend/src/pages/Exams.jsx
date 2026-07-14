import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import api from "../utils/api"

function Exams() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [publishing, setPublishing] = useState(null)
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem("access")) { navigate("/"); return }
    api.get("/exams/").then((res) => { setExams(res.data); setLoading(false) })
  }, [])

  const handlePublish = async (examId, examName) => {
    if (!window.confirm(`Publish report cards for "${examName}"? Parents will receive email notifications.`)) return
    setPublishing(examId)
    setMessage("")
    try {
      const res = await api.post(`/exams/${examId}/publish/`)
      setMessage(`✅ ${res.data.message}`)
    } catch (err) {
      setMessage("❌ Error publishing report cards.")
    } finally {
      setPublishing(null)
    }
  }

  const filtered = exams.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <Navbar />
      <div style={{ padding: "32px 40px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ color: "#333", margin: "0 0 4px 0", fontSize: "24px" }}>📋 Exams</h2>
            <p style={{ color: "#888", margin: 0 }}>{exams.length} exams created</p>
          </div>
          <button onClick={() => navigate("/marks")} style={{
            padding: "12px 24px", background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "white", border: "none", borderRadius: "10px",
            cursor: "pointer", fontSize: "14px", fontWeight: "600"
          }}>
            📝 Enter Marks
          </button>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            padding: "14px 20px", borderRadius: "10px", marginBottom: "20px",
            background: message.includes("✅") ? "#dcfce7" : "#fee2e2",
            color: message.includes("✅") ? "#16a34a" : "#dc2626",
            fontWeight: "500"
          }}>
            {message}
          </div>
        )}

        {/* Search */}
        <div style={{ background: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "24px" }}>
          <input
            type="text"
            placeholder="🔍 Search exams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#888" }}>Loading exams...</div>
        ) : (
          <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                  {["#", "Exam Name", "Class", "Date", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "16px 20px", color: "white", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id} style={{ borderBottom: "1px solid #f0f0f0" }}
                    onMouseEnter={(ev) => ev.currentTarget.style.background = "#f8f9ff"}
                    onMouseLeave={(ev) => ev.currentTarget.style.background = "white"}
                  >
                    <td style={{ padding: "14px 20px", color: "#999", fontSize: "13px" }}>#{e.id}</td>
                    <td style={{ padding: "14px 20px", color: "#333", fontWeight: "500" }}>{e.name}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ background: "#ede9fe", color: "#667eea", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" }}>
                        {e.student_class}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", color: "#666" }}>{e.date}</td>
                    <td style={{ padding: "14px 20px", display: "flex", gap: "8px" }}>
                      <button onClick={() => navigate("/marks")} style={{
                        padding: "8px 14px", background: "#f0f4ff", color: "#667eea",
                        border: "2px solid #667eea", borderRadius: "8px",
                        cursor: "pointer", fontSize: "12px", fontWeight: "500"
                      }}>
                        📝 Marks
                      </button>
                      <button
                        onClick={() => handlePublish(e.id, e.name)}
                        disabled={publishing === e.id}
                        style={{
                          padding: "8px 14px",
                          background: publishing === e.id ? "#e0e0e0" : "linear-gradient(135deg, #43e97b, #38f9d7)",
                          color: publishing === e.id ? "#999" : "white",
                          border: "none", borderRadius: "8px",
                          cursor: publishing === e.id ? "not-allowed" : "pointer",
                          fontSize: "12px", fontWeight: "500"
                        }}
                      >
                        {publishing === e.id ? "Publishing..." : "📧 Publish & Notify"}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#888" }}>
                      No exams found
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

export default Exams
