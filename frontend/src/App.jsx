import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Students from "./pages/Students"
import Exams from "./pages/Exams"
import MarkEntry from "./pages/MarkEntry"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/marks" element={<MarkEntry />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
