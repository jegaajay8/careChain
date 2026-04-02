import React, { useState } from "react";
import "./style.css";
import Login from "./pages/Login";
import RegisterDonor from "./pages/RegisterDonor";
import RegisterHospital from "./pages/RegisterHospital";
import DonorDashboard from "./pages/DonorDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";

function App() {
  // 1. Define all States first
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  // 2. Define Shared Functions
  const logout = () => {
    setUser(null);
    setPage("login");
  };

  // 3. Use a Switch-Case for cleaner navigation
  const renderPage = () => {
    switch (page) {
      case "login":
        return <Login setPage={setPage} setUser={setUser} />;
      
      case "registerDonor":
        return <RegisterDonor setPage={setPage} />;
      
      case "registerHospital":
        return <RegisterHospital setPage={setPage} />;
      
      case "donorDashboard":
        return <DonorDashboard user={user} logout={logout} setPage={setPage} />;
      
      case "hospitalDashboard":
        return <HospitalDashboard user={user} logout={logout} setPage={setPage} />;
      
      default:
        return <Login setPage={setPage} setUser={setUser} />;
    }
  };

  return (
      <div className="App">
        <header style={{ padding: "20px 0", textAlign: "center" }}>
          <h1 style={{ color: "#c0392b", margin: 0 }}>CareChain</h1>
          <small style={{ color: "#7f8c8d", fontWeight: "bold" }}>Sri Lanka Blood Management System</small>
      </header>

      {renderPage()}

      <footer style={{ marginTop: "40px", fontSize: "12px", color: "#95a5a6", textAlign: "center", paddingBottom: "30px" }}>
        <strong>CareChain Sri Lanka</strong><br />
        Bridging Donors and Hospitals • 2026<br />
        <span style={{ color: "#e74c3c" }}>University of Moratuwa CSE Project</span>
      </footer>

    </div>
  );
}

export default App;