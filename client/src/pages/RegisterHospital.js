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

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {

        const res = await fetch("http://localhost:5000/register-hospital", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });

        const data = await res.json();

        alert(data.message);
        setPage("login");
    };

    return (
        <div>
            <h2>Hospital Registration</h2>

            <input name="username" placeholder="Username" onChange={handleChange} /><br /><br />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} /><br /><br />
            <input name="hospital_name" placeholder="Hospital Name" onChange={handleChange} /><br /><br />
            <input name="hospital_id" placeholder="Hospital ID" onChange={handleChange} /><br /><br />
            <input name="district" placeholder="District" onChange={handleChange} /><br /><br />
            <input name="city" placeholder="City" onChange={handleChange} /><br /><br />
            <input name="road" placeholder="Road" onChange={handleChange} /><br /><br />
            <input name="postal_code" placeholder="Postal Code" onChange={handleChange} /><br /><br />

            <button onClick={handleSubmit}>Submit</button>
            <br /><br />
            <button onClick={() => setPage("login")}>Back to Login</button>
        </div>
    );
}

export default RegisterHospital;