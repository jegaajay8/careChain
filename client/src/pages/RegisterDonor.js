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
        <div className="App" style={{ marginTop: "20px" }}>
            <h2>Donor Registration</h2>

            <input name="username" placeholder="Username / Email" value={form.username} onChange={handleChange} />
            <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />
            <input name="fullname" placeholder="Full Name" value={form.fullname} onChange={handleChange} />
            <input name="nic" placeholder="NIC Number" value={form.nic} onChange={handleChange} />
            <input type="tel" name="telephone" placeholder="Telephone (e.g. 0771234567)" value={form.telephone} onChange={handleChange} />

            <select name="blood_group" value={form.blood_group} onChange={handleChange}>
                <option value="">Select Blood Group</option>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                ))}
            </select>

            <select name="district" value={form.district} onChange={handleChange}>
                <option value="">Select District</option>
                {districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                ))}
            </select>

            <input name="city" placeholder="City" value={form.city} onChange={handleChange} />
            <input name="road" placeholder="Road Name" value={form.road} onChange={handleChange} />
            <input type="number" name="postal_code" placeholder="Postal Code" value={form.postal_code} onChange={handleChange} />

            <button onClick={handleSubmit}>Register as Donor</button>
            
            <button className="back-btn" onClick={() => setPage("login")}>
                Already have an account? Back to Login
            </button>
        </div>
    );
}

export default RegisterDonor;