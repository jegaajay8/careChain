import React, { useState, useEffect, useCallback } from "react";

function HospitalDashboard({ user, logout }) {
  const [section, setSection] = useState("patients");
  const [acceptedDonors, setAcceptedDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------- Load Accepted Donors (Memoized) ----------------
  const loadAcceptedDonors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // UPDATED: Added /api/ prefix to match server.js
      const res = await fetch(`http://localhost:5001/api/accepted-donors/${user.id}`);
      if (!res.ok) throw new Error("Failed to load accepted donors");
      const data = await res.json();
      setAcceptedDonors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  return (
    <div className="App" style={{ maxWidth: "900px", margin: "20px auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{textAlign: "left"}}>
            <h2 style={{margin: 0, color: "#c0392b"}}>CareChain Hospital</h2>
            <p style={{margin: 0, fontSize: "14px"}}>Welcome, <strong>{user.username}</strong></p>
        </div>
        <button onClick={logout} style={{ width: "auto", background: "#2c3e50" }}>Logout</button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button 
          onClick={() => setSection("patients")} 
          style={{ flex: 1, backgroundColor: section === "patients" ? "#c0392b" : "#7f8c8d" }}
        >
          Manage Patients
        </button>
        <button 
          onClick={() => setSection("requests")} 
          style={{ flex: 1, backgroundColor: section === "requests" ? "#c0392b" : "#7f8c8d" }}
        >
          Blood Requests
        </button>
        <button 
          onClick={() => { setSection("accepted"); loadAcceptedDonors(); }} 
          style={{ flex: 1, backgroundColor: section === "accepted" ? "#c0392b" : "#7f8c8d" }}
        >
          Accepted Donors ({acceptedDonors.length})
        </button>
      </div>

      <hr style={{ border: "0.5px solid #eee", marginBottom: "20px" }} />

      {error && <p style={{ color: "#721c24", background: "#f8d7da", padding: "10px", borderRadius: "5px" }}>{error}</p>}

      {/* Sections */}
      {section === "patients" && <PatientSection user={user} />}
      {section === "requests" && <RequestSection user={user} />}
      {section === "accepted" && (
        <AcceptedDonorsSection 
          donors={acceptedDonors} 
          reload={loadAcceptedDonors} 
          loading={loading}
        />
      )}
    </div>
  );
}

// ---------------- PATIENT SECTION ----------------
function PatientSection({ user }) {
  const [form, setForm] = useState({ fullname: "", nic: "", blood_group: "" });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      // UPDATED: Added /api/ prefix
      const res = await fetch(`http://localhost:5001/api/get-patients/${user.id}`);
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  const handleSubmit = async () => {
    if (!form.fullname || !form.nic || !form.blood_group) return alert("Please fill all fields");
    try {
      // UPDATED: Added /api/ prefix
      const res = await fetch("http://localhost:5001/api/add-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospital_user_id: user.id, ...form }),
      });
      if (res.ok) {
        alert("Patient Registered Successfully");
        setForm({ fullname: "", nic: "", blood_group: "" });
        loadPatients();
      }
    } catch (err) {
      alert("Error adding patient");
    }
  };

  return (
    <div style={{ textAlign: "left" }}>
      <h3>Register New Patient</h3>
      <div style={{display: "grid", gap: "10px", background: "#f9f9f9", padding: "20px", borderRadius: "8px"}}>
          <input placeholder="Full Name" value={form.fullname} onChange={e => setForm({ ...form, fullname: e.target.value })} />
          <input placeholder="NIC Number" value={form.nic} onChange={e => setForm({ ...form, nic: e.target.value })} />
          <select 
            value={form.blood_group} 
            onChange={e => setForm({ ...form, blood_group: e.target.value })}
            style={{ padding: "12px", borderRadius: "6px", border: "1px solid #ddd" }}
          >
            <option value="">Select Blood Group</option>
            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
          <button onClick={handleSubmit} style={{marginTop: "10px"}}>Add Patient Record</button>
      </div>

      <h4 style={{ marginTop: "30px" }}>Registered Patients</h4>
      {loading ? <p>Loading patients...</p> : 
        patients.map(p => (
          <div key={p.id} style={{ padding: "12px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
            <span><strong>{p.fullname}</strong> (NIC: {p.nic})</span>
            <span style={{ color: "#c0392b", fontWeight: "bold" }}>{p.blood_group}</span>
          </div>
        ))
      }
    </div>
  );
}

// ---------------- REQUEST SECTION ----------------
function RequestSection({ user }) {
  const [blood_group, setBloodGroup] = useState("");
  const [district, setDistrict] = useState("");

  const handleRequest = async () => {
    if (!blood_group || !district) return alert("Fields cannot be empty");
    try {
      // UPDATED: Added /api/ prefix
      const res = await fetch("http://localhost:5001/api/send-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospital_user_id: user.id, blood_group, district }),
      });
      if (res.ok) {
        alert("Urgent Request Broadcasted!");
        setBloodGroup(""); setDistrict("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ textAlign: "left" }}>
      <h3>Broadcast Urgent Blood Request</h3>
      <p style={{ color: "#666", fontSize: "14px" }}>Sending this will alert all nearby donors and highlight your hospital on the map.</p>
      
      <div style={{background: "#fff5f5", padding: "20px", borderRadius: "8px", border: "1px solid #feb2b2"}}>
          <select 
            value={blood_group} 
            onChange={e => setBloodGroup(e.target.value)}
            style={{ padding: "12px", width: "100%", marginBottom: "15px", borderRadius: "6px", border: "1px solid #ddd" }}
          >
            <option value="">Required Blood Group</option>
            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>

          <input placeholder="District (e.g. Colombo)" value={district} onChange={e => setDistrict(e.target.value)} />
          
          <button onClick={handleRequest} style={{ backgroundColor: "#c0392b", marginTop: "10px" }}>Broadcast Request</button>
      </div>
    </div>
  );
}

// ---------------- ACCEPTED DONORS SECTION ----------------
function AcceptedDonorsSection({ donors, reload, loading }) {
  const handleMarkDone = async (request_id) => {
    try {
      // UPDATED: Added /api/ prefix
      const res = await fetch("http://localhost:5001/api/complete-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id }),
      });
      if (res.ok) {
        alert("Donation process completed!");
        reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ textAlign: "left" }}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <h3>Donors On Their Way</h3>
          <button onClick={reload} style={{width: "auto", fontSize: "12px", padding: "5px 15px"}}>Refresh List</button>
      </div>

      {loading ? <p>Updating donor status...</p> : 
        donors.length === 0 ? <p style={{color: "#999", padding: "20px", textAlign: "center", border: "1px dashed #ccc", borderRadius: "8px"}}>No donors have accepted requests yet.</p> :
        donors.map(d => (
          <div key={d.request_id} style={{ border: "1px solid #27ae60", padding: "15px", borderRadius: "8px", margin: "10px 0", backgroundColor: "#f9fffb" }}>
            <div style={{display: "flex", justifyContent: "space-between"}}>
                <div>
                    <p style={{margin: "0 0 5px 0"}}><strong>Donor:</strong> {d.fullname}</p>
                    <p style={{margin: 0, fontSize: "14px"}}><strong>Contact:</strong> {d.telephone}</p>
                </div>
                <div style={{textAlign: "right"}}>
                    <span style={{ color: "#c0392b", fontWeight: "bold", fontSize: "18px" }}>{d.blood_group}</span>
                </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button 
                onClick={() => handleMarkDone(d.request_id)}
                style={{ backgroundColor: "#27ae60", fontSize: "12px", width: "100%" }}
              >
                Confirm Donation Received
              </button>
            </div>
          </div>
        ))
      }
    </div>
  );
}

export default HospitalDashboard;