import { useNavigate } from "react-router-dom"

function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  const handleLogout = () => {
    localStorage.removeItem("access")
    localStorage.removeItem("refresh")
    localStorage.removeItem("user")
    navigate("/")
  }

  return (
    <nav style={{
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      padding: "0 24px", height: "60px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <span style={{ color: "white", fontSize: "20px", fontWeight: "bold" }}>🎓 GradeHub</span>
        <button onClick={() => navigate("/dashboard")} style={{
          background: "none", border: "none", color: "white",
          cursor: "pointer", fontSize: "14px", padding: "4px 8px"
        }}>Dashboard</button>
        <button onClick={() => navigate("/students")} style={{
          background: "none", border: "none", color: "white",
          cursor: "pointer", fontSize: "14px", padding: "4px 8px"
        }}>Students</button>
        <button onClick={() => navigate("/exams")} style={{
          background: "none", border: "none", color: "white",
          cursor: "pointer", fontSize: "14px", padding: "4px 8px"
        }}>Exams</button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ color: "white", fontSize: "14px" }}>👤 {user.username} ({user.role})</span>
        <button onClick={handleLogout} style={{
          background: "rgba(255,255,255,0.2)", border: "none", color: "white",
          cursor: "pointer", padding: "6px 14px", borderRadius: "6px", fontSize: "14px"
        }}>Logout</button>
      </div>
    </nav>
  )
}

export default Navbar