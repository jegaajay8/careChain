import React, { useState } from "react";

function Login({ setPage, setUser }) {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {

        const res = await fetch("http://localhost:5000/login", {
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
        <div>
            <h2>careChain Login</h2>

            <input
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
            />
            <br /><br />

            <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
            />
            <br /><br />

            <button onClick={handleLogin}>Login</button>

            <br /><br />

            <button onClick={() => setPage("registerDonor")}>
                Register as Donor
            </button>

            <br /><br />

            <button onClick={() => setPage("registerHospital")}>
                Register as Hospital
            </button>
        </div>
    );
}

export default Login;