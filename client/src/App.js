import React, { useState } from "react";
import "./style.css";

import Login from "./pages/Login";
import RegisterDonor from "./pages/RegisterDonor";
import RegisterHospital from "./pages/RegisterHospital";
import DonorDashboard from "./pages/DonorDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";

const App = () => {

  // Application States
  const [currentPage, setCurrentPage] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage("login");
  };

  // Page Renderer
  const displayPage = () => {

    if (currentPage === "login") {
      return (
        <Login
          setPage={setCurrentPage}
          setUser={setCurrentUser}
        />
      );
    }

    if (currentPage === "registerDonor") {
      return (
        <RegisterDonor
          setPage={setCurrentPage}
        />
      );
    }

    if (currentPage === "registerHospital") {
      return (
        <RegisterHospital
          setPage={setCurrentPage}
        />
      );
    }

    if (currentPage === "donorDashboard") {
      return (
        <DonorDashboard
          user={currentUser}
          logout={handleLogout}
          setPage={setCurrentPage}
        />
      );
    }

    if (currentPage === "hospitalDashboard") {
      return (
        <HospitalDashboard
          user={currentUser}
          logout={handleLogout}
          setPage={setCurrentPage}
        />
      );
    }

    return (
      <Login
        setPage={setCurrentPage}
        setUser={setCurrentUser}
      />
    );
  };

  return (
    <div className="App">

      <header
        style={{
          padding: "20px 0",
          textAlign: "center"
        }}
      >
        <h1
          style={{
            color: "#c0392b",
            margin: 0
          }}
        >
          CareChain
        </h1>

        <small
          style={{
            color: "#7f8c8d",
            fontWeight: "bold"
          }}
        >
          Sri Lanka Blood Management System
        </small>
      </header>

      {displayPage()}

      <footer
        style={{
          marginTop: "40px",
          fontSize: "12px",
          color: "#95a5a6",
          textAlign: "center",
          paddingBottom: "30px"
        }}
      >
        <strong>CareChain Sri Lanka</strong>
        <br />
        Bridging Donors and Hospitals • 2026
        <br />

        <span style={{ color: "#e74c3c" }}>
          University of Moratuwa CSE Project
        </span>
      </footer>

    </div>
  );
};

export default App;