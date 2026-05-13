import React, { useState } from "react";

function Login({ setPage, setUser }) {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {

        const res = await fetch("http://localhost:5001/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.role === "donor") {
            setUser(data);
            setPage("donorDashboard");
        }
        else if (data.role === "hospital") {
            setUser(data);
            setPage("hospitalDashboard");
        }
        else {
            alert("Invalid Login");
        }
    };

    return (
        <div className="card card-sm">
            <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Login to your account</h2>

            <div className="form-group">
                <label>Username</label>
                <input
                    placeholder="Enter your username"
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Password</label>
                <input
                    type="password"
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button className="btn btn-primary" onClick={handleLogin} style={{ marginTop: "1rem" }}>
                Login
            </button>

            <div style={{ marginTop: "2rem", textAlign: "center", borderTop: "1px solid #E2E8F0", paddingTop: "1.5rem" }}>
                <p style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>Don't have an account?</p>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                    <button className="btn btn-secondary" onClick={() => setPage("registerDonor")} style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                        Register Donor
                    </button>
                    <button className="btn btn-secondary" onClick={() => setPage("registerHospital")} style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                        Register Hospital
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;