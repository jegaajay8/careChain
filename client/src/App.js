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
      {renderPage()}
    </div>
  );
}

export default App;