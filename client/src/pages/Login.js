import React, { useState } from "react";

function Login({ setPage, setUser }) {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="form-container">
            <h2>careChain Login</h2>

            <div className="form-group">
                <input
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="password-wrapper">
                <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="eye-icon"
                    >
                    {showPassword ? "🙈" : "👁️"}
                </span>
            </div><br/>
            

            <button onClick={handleLogin}>Login</button>

            <br/>

            <button onClick={() => setPage("registerDonor")}>
                Register as Donor
            </button>

            <br/>

            <button onClick={() => setPage("registerHospital")}>
                Register as Hospital
            </button>
        </div>
    );
}

export default Login;