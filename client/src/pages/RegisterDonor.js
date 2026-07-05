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

    // Sri Lankan Districts for consistency
    const districts = ["Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"];

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        // Validation
        const requiredFields = ['username', 'password', 'fullname', 'nic', 'blood_group', 'district'];
        for (let field of requiredFields) {
            if (!form[field]) {
                alert(`Please fill in the ${field.replace('_', ' ')} field.`);
                return;
            }
        }

        try {
            const res = await fetch("http://localhost:5001/register-donor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Registration failed");
            }

            alert("Registration successful! You can now log in.");
            setPage("login");

        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="card card-lg">
            <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Donor Registration</h2>

            <div className="grid-2-col">
                <div className="form-group">
                    <label>Username / Email *</label>
                    <input name="username" placeholder="Enter username" value={form.username} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Password *</label>
                    <input type="password" name="password" placeholder="Create password" value={form.password} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Full Name *</label>
                    <input name="fullname" placeholder="Enter full name" value={form.fullname} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>NIC Number *</label>
                    <input name="nic" placeholder="e.g. 199912345678" value={form.nic} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Blood Group *</label>
                    <select name="blood_group" value={form.blood_group} onChange={handleChange}>
                        <option value="">Select Blood Group</option>
                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Telephone</label>
                    <input type="tel" name="telephone" placeholder="e.g. 0771234567" value={form.telephone} onChange={handleChange} />
                </div>
            </div>

            <h3 style={{ marginTop: "2rem", marginBottom: "1rem", fontSize: "1.2rem", color: "var(--secondary)" }}>Address Details</h3>
            
            <div className="grid-2-col">
                <div className="form-group">
                    <label>District *</label>
                    <select name="district" value={form.district} onChange={handleChange}>
                        <option value="">Select District</option>
                        {districts.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>City</label>
                    <input name="city" placeholder="Enter city" value={form.city} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Road Name</label>
                    <input name="road" placeholder="Enter road" value={form.road} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Postal Code</label>
                    <input type="number" name="postal_code" placeholder="Enter postal code" value={form.postal_code} onChange={handleChange} />
                </div>
            </div>

            <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                <button className="btn btn-primary" onClick={handleSubmit} style={{ width: "100%", maxWidth: "300px" }}>
                    Register as Donor
                </button>
                
                <button className="btn-text" onClick={() => setPage("login")}>
                    Already have an account? Back to Login
                </button>
            </div>
        </div>
    );
}

export default RegisterDonor;