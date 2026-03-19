import React, { useState } from "react";
import "./style.css";
import Login from "./pages/Login";
import RegisterDonor from "./pages/RegisterDonor";
import RegisterHospital from "./pages/RegisterHospital";
import DonorDashboard from "./pages/DonorDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";

function App() {

  const [page, setPage] = useState("login");

  const logout = () => {
  setUser(null);
  setPage("login");
};

  const [user, setUser] = useState(null);

  if (page === "login")
    return <Login setPage={setPage} setUser={setUser} />;

  if (page === "registerDonor")
    return <RegisterDonor setPage={setPage} />;

  if (page === "registerHospital")
    return <RegisterHospital setPage={setPage} />;

 if (page === "donorDashboard")
    return <DonorDashboard user={user} logout={logout} />;

if (page === "hospitalDashboard")
    return <HospitalDashboard user={user} logout={logout} />;

}

export default App;