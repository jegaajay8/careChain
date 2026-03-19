import React, { useState } from "react";

function HospitalDashboard({ user, logout }) {
    const [acceptedDonors, setAcceptedDonors] = useState([]);

    const loadAcceptedDonors = async () => {
        const res = await fetch("http://localhost:5000/accepted-donors/" + user.id);
        const data = await res.json();
        setAcceptedDonors(data);
    };

    const [section, setSection] = useState("");

    return (
        <div>
            <button onClick={logout}>Logout</button>
            <br /><br />
            <h2>Hospital Dashboard</h2>

            <p>Welcome: {user.username}</p>

            <button onClick={() => setSection("patient")}>
                Patients
            </button>

            <br /><br />

            <button onClick={() => setSection("request")}>
                Send Blood Request
            </button>

            <br /><br />

            <button onClick={() => {
                setSection("accepted");
                loadAcceptedDonors();
            }}>
                Accepted Donors
            </button>

            <br /><br />

            {section === "patient" && <PatientSection user={user} />}
            {section === "request" && <RequestSection user={user} />}
            {section === "accepted" && (
                <div>
                    <h3>Accepted Donors</h3>

                    {acceptedDonors.length === 0 && <p>No accepted donors yet</p>}

                    {acceptedDonors.map((d, index) => (
                        <div key={index} style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
                            <p>Name: {d.fullname}</p>
                            <p>Telephone: {d.telephone}</p>
                            <p>Blood Group: {d.blood_group}</p>

                            <button onClick={async () => {

                                const res = await fetch("http://localhost:5000/donor-details/" + d.donor_id);
                                const data = await res.json();

                                alert(
                                    "Full Name: " + data.fullname +
                                    "\nNIC: " + data.nic +
                                    "\nTelephone: " + data.telephone +
                                    "\nDistrict: " + data.district +
                                    "\nCity: " + data.city +
                                    "\nRoad: " + data.road +
                                    "\nPostal Code: " + data.postal_code
                                );

                            }}>
                                Details
                            </button>

                            <button onClick={async () => {

                                await fetch("http://localhost:5000/complete-request", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        request_id: d.request_id
                                    })
                                });

                                alert("Donation Completed");

                                loadAcceptedDonors();

                            }}>
                                Done
                            </button>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default HospitalDashboard;



/* =========================
   PATIENT SECTION
========================= */

function PatientSection({ user }) {

    const [form, setForm] = useState({
        fullname: "",
        nic: "",
        blood_group: ""
    });

    const [patients, setPatients] = useState([]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const loadPatients = async () => {
        const res = await fetch("http://localhost:5000/get-patients/" + user.id);
        const data = await res.json();
        setPatients(data);
    };

    const handleSubmit = async () => {

        await fetch("http://localhost:5000/add-patient", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                hospital_user_id: user.id,
                ...form
            })
        });

        alert("Patient Added");

        loadPatients();
    };

    const deletePatient = async (id) => {

        await fetch("http://localhost:5000/delete-patient", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patient_id: id })
        });

        alert("Patient Deleted");

        loadPatients();
    };

    return (
        <div>
            <h3>Register Patient</h3>

            <input name="fullname" placeholder="Full Name" onChange={handleChange} /><br /><br />
            <input name="nic" placeholder="NIC" onChange={handleChange} /><br /><br />
            <input name="blood_group" placeholder="Blood Group" onChange={handleChange} /><br /><br />

            <button onClick={handleSubmit}>Add Patient</button>

            <br /><br />

            <button onClick={loadPatients}>Show Patients</button>

            <br /><br />

            <h3>Patient List</h3>

            {patients.map((p) => (
                <div key={p.id} style={{ border: "1px solid black", padding: "10px", margin: "10px" }}>
                    <p>Name: {p.fullname}</p>
                    <p>NIC: {p.nic}</p>
                    <p>Blood Group: {p.blood_group}</p>

                    <button onClick={() => deletePatient(p.id)}>
                        Remove
                    </button>
                </div>
            ))}
        </div>
    );
}


/* =========================
   REQUEST SECTION
========================= */

function RequestSection({ user }) {

    const [blood_group, setBloodGroup] = useState("");
    const [district, setDistrict] = useState("");

    const handleRequest = async () => {

        await fetch("http://localhost:5000/send-request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                hospital_user_id: user.id,
                blood_group,
                district
            })
        });

        alert("Request Sent");
    };

    return (
        <div>
            <h3>Send Blood Request</h3>

            <input
                placeholder="Blood Group"
                onChange={(e) => setBloodGroup(e.target.value)}
            />
            <br /><br />

            <input
                placeholder="District"
                onChange={(e) => setDistrict(e.target.value)}
            />
            <br /><br />

            <button onClick={handleRequest}>Send</button>
        </div>
    );
}