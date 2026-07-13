import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import api from "../utils/api"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from "recharts"

const COLORS = ["#667eea", "#43e97b", "#f093fb", "#f5a623", "#e24b4a"]

function Analytics() {
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState("")
  const [results, setResults] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem("access")) { navigate("/"); return }
    Promise.all([api.get("/exams/"), api.get("/students/")]).then(([e, s]) => {
      setExams(e.data)
      setStudents(s.data)
    })
  }, [])

  const handleExamSelect = async (examId) => {
    setSelectedExam(examId)
    if (!examId) return
    setLoading(true)
    try {
      const res = await api.get(`/results/?exam=${examId}`)
      setResults(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getGradeFromRemarks = (remarks) => {
    if (remarks.includes("Grade:")) {
      return remarks.split("Grade:")[1].split("|")[0].trim()
    }
    return "N/A"
  }

  const getGradeDistribution = () => {
    const grades = { A: 0, B: 0, C: 0, D: 0, F: 0 }
    results.forEach(r => {
      const grade = getGradeFromRemarks(r.remarks)
      if (grades[grade] !== undefined) grades[grade]++
    })
    return Object.entries(grades).map(([grade, count]) => ({ grade, count }))
  }

  const getStudentPerformance = () => {
    const studentMap = {}
    results.forEach(r => {
      const studentId = r.student
      if (!studentMap[studentId]) {
        const student = students.find(s => s.id === studentId)
        studentMap[studentId] = {
          name: student ? `${student.first_name} ${student.last_name}` : `Student ${studentId}`,
          total: 0, count: 0
        }
      }
      studentMap[studentId].total += r.marks
      studentMap[studentId].count++
    })
    return Object.values(studentMap).map(s => ({
      name: s.name,
      average: s.count > 0 ? Math.round(s.total / s.count) : 0,
      total: s.total
    })).sort((a, b) => b.total - a.total)
  }

  const getPassFail = () => {
    let pass = 0, fail = 0
    results.forEach(r => {
      const grade = getGradeFromRemarks(r.remarks)
      if (grade === "F") fail++
      else pass++
    })
    return [
      { name: "Pass", value: pass },
      { name: "Fail", value: fail }
    ]
  }

  const getClassAverage = () => {
    if (results.length === 0) return 0
    const total = results.reduce((sum, r) => sum + r.marks, 0)
    return Math.round(total / results.length)
  }

  const gradeDistribution = getGradeDistribution()
  const studentPerformance = getStudentPerformance()
  const passFailData = getPassFail()
  const classAverage = getClassAverage()
  const topStudent = studentPerformance[0]
  const bottomStudent = studentPerformance[studentPerformance.length - 1]

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <Navbar />
      <div style={{ padding: "32px 40px" }}>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ color: "#333", margin: "0 0 4px 0", fontSize: "24px" }}>📊 Analytics Dashboard</h2>
          <p style={{ color: "#888", margin: 0 }}>Visual performance insights for your class</p>
        </div>

        {/* Exam Selector */}
        <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "24px" }}>
          <label style={{ fontWeight: "600", color: "#333", marginBottom: "12px", display: "block" }}>
            📋 Select Exam to Analyze
          </label>
          <select
            value={selectedExam}
            onChange={(e) => handleExamSelect(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", border: "2px solid #e0e0e0", borderRadius: "10px", fontSize: "15px" }}
          >
            <option value="">-- Select an exam --</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>{e.name} — {e.date}</option>
            ))}
          </select>
        </div>

        {selectedExam && !loading && results.length > 0 && (
          <>
            {/* Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "24px" }}>
              {[
                { label: "Total Results", value: results.length, icon: "📝", color: "#667eea", bg: "#ede9fe" },
                { label: "Class Average", value: `${classAverage}%`, icon: "📈", color: "#43e97b", bg: "#dcfce7" },
                { label: "Top Student", value: topStudent?.name.split(" ")[0] || "N/A", icon: "🥇", color: "#f5a623", bg: "#fef3c7" },
                { label: "Pass Rate", value: `${Math.round((passFailData[0].value / results.length) * 100)}%`, icon: "✅", color: "#4facfe", bg: "#dbeafe" },
              ].map((card, i) => (
                <div key={i} style={{
                  background: "white", borderRadius: "16px", padding: "24px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)", borderTop: `4px solid ${card.color}`
                }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "12px",
                    background: card.bg, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "24px", marginBottom: "12px"
                  }}>{card.icon}</div>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: card.color }}>{card.value}</div>
                  <div style={{ color: "#888", fontSize: "13px", marginTop: "4px" }}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "24px" }}>

              {/* Grade Distribution Bar Chart */}
              <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <h3 style={{ margin: "0 0 24px 0", color: "#333", fontSize: "16px" }}>📊 Grade Distribution</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="grade" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pass/Fail Pie Chart */}
              <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <h3 style={{ margin: "0 0 24px 0", color: "#333", fontSize: "16px" }}>✅ Pass vs Fail</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={passFailData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#43e97b" />
                      <Cell fill="#e24b4a" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Student Performance Bar Chart */}
            <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "24px" }}>
              <h3 style={{ margin: "0 0 24px 0", color: "#333", fontSize: "16px" }}>👨‍🎓 Student Performance Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={studentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Total Marks" fill="#667eea" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="average" name="Average Marks" fill="#43e97b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top & Bottom Performers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <h3 style={{ margin: "0 0 20px 0", color: "#333", fontSize: "16px" }}>🏆 Top Performers</h3>
                {studentPerformance.slice(0, 3).map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : "#cd7f32",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: "bold", color: "white", fontSize: "14px"
                    }}>#{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", color: "#333" }}>{s.name}</div>
                      <div style={{ color: "#888", fontSize: "13px" }}>Total: {s.total} marks</div>
                    </div>
                    <div style={{ fontWeight: "700", color: "#667eea", fontSize: "18px" }}>{s.average}%</div>
                  </div>
                ))}
              </div>

              <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <h3 style={{ margin: "0 0 20px 0", color: "#333", fontSize: "16px" }}>📉 Needs Improvement</h3>
                {studentPerformance.slice(-3).reverse().map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: "#fee2e2", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "18px"
                    }}>⚠️</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", color: "#333" }}>{s.name}</div>
                      <div style={{ color: "#888", fontSize: "13px" }}>Total: {s.total} marks</div>
                    </div>
                    <div style={{ fontWeight: "700", color: "#e24b4a", fontSize: "18px" }}>{s.average}%</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedExam && !loading && results.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "16px", color: "#888" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
            <p>No results found for this exam. Enter marks first!</p>
          </div>
        )}

        {!selectedExam && (
          <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "16px", color: "#888" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
            <p>Select an exam above to see analytics!</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default Analytics
