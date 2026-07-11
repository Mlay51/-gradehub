import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setLoading(true)
    setMessage("")
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/auth/login/", { username, password })
      localStorage.setItem("access", res.data.access)
      localStorage.setItem("refresh", res.data.refresh)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      
      const role = res.data.user.role
      console.log("User role:", role)
      
      if (role === "parent") {
        navigate("/parent")
      } else {
        navigate("/dashboard")
      }
    } catch (err) {
      setMessage("Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', Arial, sans-serif"
    }}>
      <div style={{
        background: "white", padding: "48px 40px", borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)", width: "100%", maxWidth: "420px"
      }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ fontSize: "64px", marginBottom: "8px" }}>🎓</div>
          <h2 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "28px", fontWeight: "700" }}>GradeHub</h2>
          <p style={{ color: "#888", margin: 0, fontSize: "15px" }}>Sign in to your account</p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "600", fontSize: "14px" }}>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%", padding: "13px 16px", border: "2px solid #e0e0e0",
              borderRadius: "10px", fontSize: "15px", boxSizing: "border-box",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.borderColor = "#667eea"}
            onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
          />
        </div>

        <div style={{ marginBottom: "28px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "600", fontSize: "14px" }}>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%", padding: "13px 16px", border: "2px solid #e0e0e0",
              borderRadius: "10px", fontSize: "15px", boxSizing: "border-box",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.borderColor = "#667eea"}
            onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "14px",
            background: loading ? "#ccc" : "linear-gradient(135deg, #667eea, #764ba2)",
            color: "white", border: "none", borderRadius: "10px",
            fontSize: "16px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "600"
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {message && (
          <div style={{
            marginTop: "16px", padding: "12px 16px", background: "#fee2e2",
            borderRadius: "10px", color: "#dc2626", textAlign: "center", fontSize: "14px"
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
