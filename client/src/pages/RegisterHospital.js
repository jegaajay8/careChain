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

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
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
            alert("Could not connect to the server. Please ensure the backend is running on Port 5001.");
        }
    };

    return (
        <div className="form-container">
            <h2>Hospital Registration</h2>

            <div className="form-group">
                <input name="username" placeholder="Username" value={form.username} onChange={handleChange} />
            </div>
            <div className="password-wrapper">
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={form.password} onChange={handleChange} />
                <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="eye-icon"
                    >
                    {showPassword ? "🙈" : "👁️"}
                </span>
            </div><br/>
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

            <button onClick={handleSubmit}>Register Hospital</button>
            <br />
            <button className="back-btn" onClick={() => setPage("login")}>
                Back to Login
            </button>
        </div>
    );
}

export default RegisterHospital;