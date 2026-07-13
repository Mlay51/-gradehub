import { useNavigate, useLocation } from "react-router-dom"

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  const handleLogout = () => {
    localStorage.clear()
    navigate("/")
  }

  const navLinks = [
    { label: "Dashboard", path: "/dashboard", icon: "🏠" },
    { label: "Students", path: "/students", icon: "👨‍🎓" },
    { label: "Exams", path: "/exams", icon: "📋" },
    { label: "Mark Entry", path: "/marks", icon: "📝" },
    { label: "Analytics", path: "/analytics", icon: "📊" },
  ]

  return (
    <nav style={{
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      padding: "0 40px", height: "64px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: "0 2px 20px rgba(102,126,234,0.4)",
      position: "sticky", top: 0, zIndex: 1000, width: "100%"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        <span style={{ color: "white", fontSize: "22px", fontWeight: "700" }}>🎓 GradeHub</span>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {navLinks.map((link) => (
            <button key={link.path} onClick={() => navigate(link.path)} style={{
              background: location.pathname === link.path ? "rgba(255,255,255,0.25)" : "transparent",
              border: "none", color: "white", cursor: "pointer",
              padding: "8px 16px", borderRadius: "8px", fontSize: "14px",
              fontWeight: location.pathname === link.path ? "600" : "400",
              transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px"
            }}
              onMouseEnter={(e) => { if (location.pathname !== link.path) e.currentTarget.style.background = "rgba(255,255,255,0.15)" }}
              onMouseLeave={(e) => { if (location.pathname !== link.path) e.currentTarget.style.background = "transparent" }}
            >
              {link.icon} {link.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "white", fontSize: "14px", fontWeight: "600" }}>{user.username}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", textTransform: "capitalize" }}>{user.role}</div>
        </div>
        <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>👤</div>
        <button onClick={handleLogout} style={{
          background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
          color: "white", cursor: "pointer", padding: "8px 18px",
          borderRadius: "8px", fontSize: "14px", fontWeight: "500"
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar
