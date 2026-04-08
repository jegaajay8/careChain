import React, { useState, useEffect } from "react";

function Login({ setPage, setUser }) {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);

            if (userData.role === "donor") {
                setPage("donorDashboard");
            } else if (userData.role === "hospital") {
                setPage("hospitalDashboard");
            }
        }
    }, []);

    const handleLogin = async () => {
        if (!username || !password) {
            setError("Please fill all fields");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("http://localhost:5001/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (data.role === "donor") {
                if (rememberMe) localStorage.setItem("user", JSON.stringify(data));
                setUser(data);
                setPage("donorDashboard");
            }
            else if (data.role === "hospital") {
                if (rememberMe) localStorage.setItem("user", JSON.stringify(data));
                setUser(data);
                setPage("hospitalDashboard");
            }
            else {
                setError("Invalid Login");
            }
        } catch (err) {
            setError("Server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>careChain Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <div className="form-group">
                <input
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="password-wrapper">
                <input
                    type={showPassword ? "text" : "password"}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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

            <label>
                <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
            </label>
            <br />
            

            <button onClick={handleLogin} disabled={loading}>
                {loading ? "Logging in..." : "Login"}
            </button>

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