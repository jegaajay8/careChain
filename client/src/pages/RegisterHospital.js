import React, { useState } from "react";

function RegisterHospital({ setPage }) {
    const [form, setForm] = useState({
        username: "",
        password: "",
        hospital_name: "",
        hospital_id: "",
        district: "",
        city: "",
        road: "",
        postal_code: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };
    const validateForm = () => {
        if (!form.username || !form.password || !form.hospital_name) {
            setError("Please fill required fields");
            return false;
        }

        if (form.password !== confirmPassword) {
            setError("Passwords do not match");
            return false;
        }

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters");
            return false;
        }

        return true;
    };


    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError("");
        try {
            // Using the new Port 5001
            const res = await fetch("http://localhost:5001/register-hospital", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Hospital registration failed");
            }

            const data = await res.json();
            alert(data.message || "Hospital Registered Successfully!");
            setPage("login");

        } catch (err) {
            console.error("Hospital Registration Error:", err);
            setError("Server connection failed");
        }finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Hospital Registration</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div className="form-group">
                <input name="username" placeholder="Username" value={form.username} onChange={handleChange} />
            </div>
            <div className="password-wrapper">
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={form.password} onChange={handleChange} />

                {form.password && (
                    <small style={{
                        color:
                            form.password.length < 6
                                ? "red"
                                : form.password.length < 10
                                ? "orange"
                                : "green"
                    }}>
                        Strength: {form.password.length < 6 ? "Weak" : form.password.length < 10 ? "Medium" : "Strong"}
                    </small>
                )}
                <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="eye-icon"
                    >
                    {showPassword ? "🙈" : "👁️"}
                </span>
            </div><br/>
            
            <div className="form-group">
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>

            <div className="form-group">
                <input name="hospital_name" placeholder="Hospital Name" value={form.hospital_name} onChange={handleChange} />
            </div>
            <div className="form-group">
                <input name="hospital_id" placeholder="Official Hospital ID" value={form.hospital_id} onChange={handleChange} />
            </div>
            <div className="form-group">
                <input name="district" placeholder="District" value={form.district} onChange={handleChange} />
            </div>
            <div className="form-group">
                <input name="city" placeholder="City" value={form.city} onChange={handleChange} />
            </div>
            <div className="form-group">
                <input name="road" placeholder="Road" value={form.road} onChange={handleChange} />
            </div>
            <div className="form-group">
                <input name="postal_code" placeholder="Postal Code" value={form.postal_code} onChange={handleChange} />
            </div>

            <button onClick={handleSubmit} disabled={loading}>
                {loading ? "Registering..." : "Register Hospital"}
            </button>
            <br />
            <button className="back-btn" onClick={() => setPage("login")}>
                Back to Login
            </button>
        </div>
    );
}

export default RegisterHospital;