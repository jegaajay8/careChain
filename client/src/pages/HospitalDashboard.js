import React, { useState, useEffect } from "react";

function HospitalDashboard({ user, logout }) {
    const [acceptedDonors, setAcceptedDonors] = useState([]);
    const [section, setSection] = useState("patient"); // Default section

    const loadAcceptedDonors = async () => {
        try {
            const res = await fetch("http://localhost:5001/accepted-donors/" + user.id);
            const data = await res.json();
            setAcceptedDonors(data);
        } catch (err) {
            console.error("Error loading donors:", err);
        }
    };

    return (
        <div className="App" style={{ maxWidth: "800px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="back-btn" onClick={logout}>Logout</button>
                <p>Hospital: <strong>{user.username}</strong></p>
            </div>
            
            <h2>Hospital Dashboard</h2>

            <div className="tab-menu" style={{ marginBottom: "20px" }}>
                <button onClick={() => setSection("patient")}>Patients</button>
                <button onClick={() => setSection("request")}>Send Blood Request</button>
                <button onClick={() => { setSection("accepted"); loadAcceptedDonors(); }}>Accepted Donors</button>
            </div>

            <hr />

            {section === "patient" && <PatientSection user={user} />}
            {section === "request" && <RequestSection user={user} />}
            {section === "accepted" && (
                <div className="accepted-section">
                    <h3>Donors Who Accepted Requests</h3>
                    {acceptedDonors.length === 0 ? <p>No active donor matches yet.</p> : (
                        acceptedDonors.map((d) => (
                            <div key={d.request_id} className="request-card" style={{ border: "1px solid #e74c3c" }}>
                                <p><strong>Donor:</strong> {d.fullname}</p>
                                <p><strong>Blood:</strong> {d.blood_group} | <strong>Tel:</strong> {d.telephone}</p>

                                <button onClick={async () => {
                                    const res = await fetch("http://localhost:5001/donor-details/" + d.donor_id);
                                    const data = await res.json();
                                    alert(`Full Details:\nName: ${data.fullname}\nNIC: ${data.nic}\nLocation: ${data.city}, ${data.district}`);
                                }}>View Details</button>

                                <button style={{ marginLeft: "10px", backgroundColor: "#27ae60" }} onClick={async () => {
                                    await fetch("http://localhost:5001/complete-request", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ request_id: d.request_id })
                                    });
                                    alert("Donation process completed and archived.");
                                    loadAcceptedDonors();
                                }}>Mark as Done</button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

/* --- PATIENT SECTION --- */
function PatientSection({ user }) {
    const [form, setForm] = useState({ fullname: "", nic: "", blood_group: "" });
    const [patients, setPatients] = useState([]);

    useEffect(() => { loadPatients(); }, []);

    const loadPatients = async () => {
        const res = await fetch("http://localhost:5001/get-patients/" + user.id);
        const data = await res.json();
        setPatients(Array.isArray(data) ? data : []);
    };

    const handleSubmit = async () => {
        await fetch("http://localhost:5001/add-patient", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hospital_user_id: user.id, ...form })
        });
        alert("Patient Added");
        setForm({ fullname: "", nic: "", blood_group: "" });
        loadPatients();
    };

    return (
        <div>
            <h3>Manage Patients</h3>
            <input name="fullname" placeholder="Full Name" value={form.fullname} onChange={(e) => setForm({...form, fullname: e.target.value})} /><br />
            <input name="nic" placeholder="NIC" value={form.nic} onChange={(e) => setForm({...form, nic: e.target.value})} /><br />
            <input name="blood_group" placeholder="Blood Group" value={form.blood_group} onChange={(e) => setForm({...form, blood_group: e.target.value})} /><br />
            <button onClick={handleSubmit}>Register Patient</button>
            
            <h4>Current Patients</h4>
            {patients.map((p) => (
                <div key={p.id} className="request-card">
                    <p>{p.fullname} ({p.blood_group}) - NIC: {p.nic}</p>
                </div>
            ))}
        </div>
    );
}

/* --- REQUEST SECTION --- */
function RequestSection({ user }) {
    const [blood_group, setBloodGroup] = useState("");
    const [district, setDistrict] = useState("");

    const handleRequest = async () => {
        if(!blood_group || !district) return alert("Please fill all fields");
        await fetch("http://localhost:5001/send-request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hospital_user_id: user.id, blood_group, district })
        });
        alert("Blood Request Broadcasted to Donors!");
    };

    return (
        <div>
            <h3>Urgent Blood Request</h3>
            <p>This will notify donors in the selected district.</p>
            <input placeholder="Blood Group (e.g. O+)" onChange={(e) => setBloodGroup(e.target.value)} /><br />
            <input placeholder="District (e.g. Colombo)" onChange={(e) => setDistrict(e.target.value)} /><br />
            <button onClick={handleRequest}>Broadcast Request</button>
        </div>
    );
}

export default HospitalDashboard;