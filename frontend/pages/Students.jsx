import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import api from "../utils/api"

function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem("access")) { navigate("/"); return }
    api.get("/students/").then((res) => {
      setStudents(res.data)
      setLoading(false)
    })
  }, [])

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <Navbar />
      <div style={{ padding: "32px" }}>
        <h2 style={{ color: "#333", marginBottom: "24px" }}>👨‍🎓 Students</h2>
        {loading ? <p>Loading...</p> : (
          <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                  {["ID", "First Name", "Last Name", "Class", "Gender"].map((h) => (
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