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
        <div className="flex-center" style={{ minHeight: "50vh" }}>
          <div className="loader"></div>
          <h3 style={{ color: "var(--text-muted)" }}>Connecting to CareChain...</h3>
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
      <header className="flex-center" style={{ marginBottom: "2rem" }}>
          <h1 style={{ color: "var(--primary)", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="blood-drop-icon" style={{ width: "20px", height: "20px", border: "none" }}></span>
            CareChain
          </h1>
          <p style={{ color: "var(--text-muted)", fontWeight: "500", marginTop: "0.5rem" }}>Sri Lanka Blood Management System</p>
      </header>

      {renderPage()}
      
      <footer className="flex-center" style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid #E2E8F0", fontSize: "0.875rem" }}>
        <strong style={{ color: "var(--accent)" }}>CareChain Sri Lanka</strong>
        <p style={{ margin: "0.5rem 0" }}>Bridging Donors and Hospitals • 2026</p>
        <span style={{ color: "var(--primary)", fontWeight: "500" }}>University of Moratuwa CSE Project</span>
      </footer>
    </div>
  );
}

export default App;