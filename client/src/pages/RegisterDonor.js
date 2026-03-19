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

        const res = await fetch("http://localhost:5000/register-donor", {
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
            <h2>Donor Registration</h2>

            <input name="username" placeholder="Username" onChange={handleChange} /><br /><br />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} /><br /><br />
            <input name="fullname" placeholder="Full Name" onChange={handleChange} /><br /><br />
            <input name="nic" placeholder="NIC Number" onChange={handleChange} /><br /><br />
            <input name="telephone" placeholder="Telephone" onChange={handleChange} /><br /><br />
            <input name="blood_group" placeholder="Blood Group" onChange={handleChange} /><br /><br />
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

export default RegisterDonor;