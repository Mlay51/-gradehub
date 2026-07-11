import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import api from "../utils/api"

function Dashboard() {
  const [stats, setStats] = useState({ students: 0, exams: 0, subjects: 0, classes: 0 })
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  useEffect(() => {
    if (!localStorage.getItem("access")) { navigate("/"); return }
    const fetchStats = async () => {
      try {
        const [students, exams, subjects, classes] = await Promise.all([
          api.get("/students/"),
          api.get("/exams/"),
          api.get("/subjects/"),
          api.get("/classes/"),
        ])
        setStats({
          students: students.data.length,
          exams: exams.data.length,
          subjects: subjects.data.length,
          classes: classes.data.length,
        })
      } catch (err) { console.error(err) }
    }
    fetchStats()
  }, [])

  const cards = [
    { label: "Total Students", value: stats.students, icon: "👨‍🎓", color: "#667eea", bg: "#ede9fe", path: "/students" },
    { label: "Total Exams", value: stats.exams, icon: "📝", color: "#f093fb", bg: "#fce7f3", path: "/exams" },
    { label: "Total Subjects", value: stats.subjects, icon: "📚", color: "#4facfe", bg: "#dbeafe", path: "/" },
    { label: "Total Classes", value: stats.classes, icon: "🏫", color: "#43e97b", bg: "#dcfce7", path: "/" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', Arial, sans-serif", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ flex: 1, padding: "32px 40px" }}>
        
        {/* Welcome Banner */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "16px", padding: "32px 40px", marginBottom: "32px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          boxShadow: "0 4px 20px rgba(102,126,234,0.4)"
        }}>
          <div>
            <h1 style={{ color: "white", margin: "0 0 8px 0", fontSize: "28px" }}>
              Welcome back, {user.username}! 👋
            </h1>
            <p style={{ color: "rgba(255,255,255,0.8)", margin: 0, fontSize: "16px" }}>
              Here is what is happening in your school today.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "white", fontSize: "14px", opacity: 0.8 }}>Role</div>
            <div style={{ color: "white", fontSize: "20px", fontWeight: "bold", textTransform: "capitalize" }}>
              {user.role}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", marginBottom: "32px" }}>
          {cards.map((card, i) => (
            <div key={i} onClick={() => navigate(card.path)} style={{
              background: "white", borderRadius: "16px", padding: "28px 24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)", cursor: "pointer",
              borderTop: `4px solid ${card.color}`, transition: "all 0.3s",
              display: "flex", flexDirection: "column", gap: "12px"
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)"
                e.currentTarget.style.boxShadow = `0 12px 30px rgba(0,0,0,0.15)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)"
              }}
            >
              <div style={{
                width: "56px", height: "56px", borderRadius: "14px",
                background: card.bg, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "28px"
              }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: "36px", fontWeight: "700", color: card.color, lineHeight: 1 }}>
                  {card.value}
                </div>
                <div style={{ color: "#888", fontSize: "14px", marginTop: "6px", fontWeight: "500" }}>
                  {card.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#333", fontSize: "18px" }}>⚡ Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "📝 Enter Marks", path: "/marks", color: "#667eea" },
                { label: "👨‍🎓 View Students", path: "/students", color: "#43e97b" },
                { label: "📋 View Exams", path: "/exams", color: "#f093fb" },
              ].map((action, i) => (
                <button key={i} onClick={() => navigate(action.path)} style={{
                  padding: "14px 20px", background: "#f8f9fa", border: `2px solid ${action.color}`,
                  borderRadius: "10px", cursor: "pointer", textAlign: "left",
                  fontSize: "15px", fontWeight: "500", color: "#333",
                  transition: "all 0.2s"
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = action.color; e.currentTarget.style.color = "white" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#f8f9fa"; e.currentTarget.style.color = "#333" }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#333", fontSize: "18px" }}>📊 System Info</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { label: "System", value: "GradeHub v1.0" },
                { label: "Status", value: "🟢 Online" },
                { label: "User", value: user.username },
                { label: "Role", value: user.role },
                { label: "Email", value: user.email },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", paddingBottom: "12px" }}>
                  <span style={{ color: "#888", fontSize: "14px" }}>{item.label}</span>
                  <span style={{ color: "#333", fontSize: "14px", fontWeight: "500" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard
