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
        setStats({ students: students.data.length, exams: exams.data.length, subjects: subjects.data.length, classes: classes.data.length })
      } catch (err) { console.error(err) }
    }
    fetchStats()
  }, [])

  const cards = [
    { label: "Total Students", value: stats.students, icon: "👨‍🎓", color: "#667eea", path: "/students" },
    { label: "Total Exams", value: stats.exams, icon: "📝", color: "#f093fb", path: "/exams" },
    { label: "Total Subjects", value: stats.subjects, icon: "📚", color: "#4facfe", path: "/" },
    { label: "Total Classes", value: stats.classes, icon: "🏫", color: "#43e97b", path: "/" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <Navbar />
      <div style={{ padding: "32px" }}>
        <h2 style={{ color: "#333", marginBottom: "8px" }}>Welcome back, {user.username}! 👋</h2>
        <p style={{ color: "#666", marginBottom: "32px" }}>Here is what is happening in your school today.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
          {cards.map((card, i) => (
            <div key={i} onClick={() => navigate(card.path)} style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", cursor: "pointer", borderLeft: `4px solid ${card.color}` }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>{card.icon}</div>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: card.color }}>{card.value}</div>
              <div style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>{card.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
