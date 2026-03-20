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

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
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
            // This catches "Failed to fetch" (backend down) or other network issues
            console.error("Registration Error:", err);
            alert("Could not connect to the server. Please ensure the backend is running.");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <h2>Donor Registration</h2>

            {/* Added 'value' to inputs to make them controlled components */}
            <input name="username" placeholder="Username" value={form.username} onChange={handleChange} /><br /><br />
            <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} /><br /><br />
            <input name="fullname" placeholder="Full Name" value={form.fullname} onChange={handleChange} /><br /><br />
            <input name="nic" placeholder="NIC Number" value={form.nic} onChange={handleChange} /><br /><br />
            <input name="telephone" placeholder="Telephone" value={form.telephone} onChange={handleChange} /><br /><br />
            <input name="blood_group" placeholder="Blood Group" value={form.blood_group} onChange={handleChange} /><br /><br />
            <input name="district" placeholder="District" value={form.district} onChange={handleChange} /><br /><br />
            <input name="city" placeholder="City" value={form.city} onChange={handleChange} /><br /><br />
            <input name="road" placeholder="Road" value={form.road} onChange={handleChange} /><br /><br />
            <input name="postal_code" placeholder="Postal Code" value={form.postal_code} onChange={handleChange} /><br /><br />

            <button onClick={handleSubmit} style={{ padding: "10px 20px", cursor: "pointer" }}>Submit</button>
            <br /><br />
            <button onClick={() => setPage("login")} style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}>
                Back to Login
            </button>
        </div>
    );
}

export default RegisterDonor;