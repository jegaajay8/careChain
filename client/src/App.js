import React, { useState, useEffect } from "react";
import "./style.css";
// Pages
import Login from "./pages/Login";
import RegisterDonor from "./pages/RegisterDonor";
import RegisterHospital from "./pages/RegisterHospital";
import DonorDashboard from "./pages/DonorDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // 1. Persistent Login: Check session on startup
  useEffect(() => {
    const savedUser = localStorage.getItem("carechain_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Auto-route based on role found in storage (Matches SQL ENUMs)
        if (parsedUser.role === "donor") setPage("donorDashboard");
        else if (parsedUser.role === "hospital") setPage("hospitalDashboard");
      } catch (e) {
        localStorage.removeItem("carechain_user");
      }
    }
    setIsInitializing(false);
  }, []);

  // 2. Centralized Auth Handler
  const handleSetUser = (userData) => {
    if (userData) {
      setUser(userData);
      localStorage.setItem("carechain_user", JSON.stringify(userData));
      
      // Immediate redirect after successful Login/Registration
      if (userData.role === "donor") setPage("donorDashboard");
      else if (userData.role === "hospital") setPage("hospitalDashboard");
    } else {
      setUser(null);
      localStorage.removeItem("carechain_user");
      setPage("login");
    }
  };

  const logout = () => {
    if (window.confirm("Are you sure you want to logout of CareChain?")) {
      handleSetUser(null);
    }
  };

  // 3. Protected Page Renderer
  const renderPage = () => {
    if (isInitializing) {
      return (
        <div className="App" style={{ textAlign: "center", padding: "100px" }}>
          <div className="loader"></div>
          <h3>Connecting to CareChain...</h3>
        </div>
      );
    }

    // Protection Logic: If already logged in, redirect away from Auth pages
    const isAuthPage = ["login", "registerDonor", "registerHospital"].includes(page);
    if (user && isAuthPage) {
        return user.role === "donor" ? 
            <DonorDashboard user={user} logout={logout} /> : 
            <HospitalDashboard user={user} logout={logout} />;
    }

    switch (page) {
      case "login":
        return <Login setPage={setPage} setUser={handleSetUser} />;
      
      case "registerDonor":
        return <RegisterDonor setPage={setPage} />;
      
      case "registerHospital":
        return <RegisterHospital setPage={setPage} />;
      
      case "donorDashboard":
        // Ensure only users with 'donor' role can see this
        return user?.role === "donor" ? (
          <DonorDashboard user={user} logout={logout} />
        ) : (
          <Login setPage={setPage} setUser={handleSetUser} />
        );
      
      case "hospitalDashboard":
        // Ensure only users with 'hospital' role can see this
        return user?.role === "hospital" ? (
          <HospitalDashboard user={user} logout={logout} />
        ) : (
          <Login setPage={setPage} setUser={handleSetUser} />
        );
      
      default:
        return <Login setPage={setPage} setUser={handleSetUser} />;
    }
  };

  return (
    <div className="container"> 
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