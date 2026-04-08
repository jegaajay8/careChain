import React, { useState } from "react";

function RegisterDonor({ setPage }) {
    const [form, setForm] = useState({
        username: "",
        password: "",
        fullname: "",
        nic: "",
        telephone: "",
        blood_group: "",
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
        if (!form.username || !form.password || !form.fullname) {
            setError("Please fill all required fields");
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
            const res = await fetch("http://localhost:5001/register-donor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (!res.ok) {
                // Handle server-side errors (e.g., 400 or 500)
                const errorData = await res.json();
                throw new Error(errorData.message || "Registration failed");
            }

            const data = await res.json();
            alert(data.message || "Registration successful!");
            setPage("login");

        } catch (err) {
            console.error("Registration Error:", err);
            setError("Could not connect to server");
        }finally {
        setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Donor Registration</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <div className="form-group">
                <input name="username" placeholder="Username" value={form.username} onChange={handleChange} />
            </div>

            <div className="form-group password-group">
                
                <div className="password-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                    />
                    
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
                </div>
            </div>

            <div className="form-group">
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>
            
            <div className="form-group">
            <input name="fullname" placeholder="Full Name" value={form.fullname} onChange={handleChange} />
            </div>
            <div className="form-group">
            <input name="nic" placeholder="NIC Number" value={form.nic} onChange={handleChange} />
            </div>
            <div className="form-group">
            <input name="telephone" placeholder="Telephone" value={form.telephone} onChange={handleChange} />
            </div>
            <div className="form-group">
            <input name="blood_group" placeholder="Blood Group" value={form.blood_group} onChange={handleChange} />
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
                {loading ? "Registering..." : "Submit"}
            </button>
            <br /><br />
            <button onClick={() => setPage("login")} style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}>
                Back to Login
            </button>
        </div>
    );
}

export default RegisterDonor;