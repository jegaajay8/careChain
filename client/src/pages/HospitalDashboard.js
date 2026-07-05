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
    <div className="card card-lg" style={{ padding: "2rem" }}>
      <style>{`
        .fade-in { animation: fadeIn 0.4s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div className="dashboard-header">
         <div>
            <h2 style={{ margin: 0, color: "var(--accent)" }}>Hospital Dashboard</h2>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>Welcome back, <b style={{ color: "var(--primary)" }}>{user.username}</b></p>
         </div>
         <button className="btn btn-secondary" onClick={logout} style={{ width: "auto", padding: "0.5rem 1.5rem" }}>Logout</button>
      </div>

      {/* Navigation */}
      <div className="tabs">
        <div className={`tab ${section === "patients" ? "active" : ""}`} onClick={() => setSection("patients")}>Manage Patients</div> 
        <div className={`tab ${section === "requests" ? "active" : ""}`} onClick={() => setSection("requests")}>Blood Requests</div>
        <div className={`tab ${section === "accepted" ? "active" : ""}`} onClick={() => { setSection("accepted"); loadAcceptedDonors(); }}>Accepted Donors ({acceptedDonors.length})</div>
      </div>

      {error && (
        <div style={{ color: "#721c24", background: "#f8d7da", padding: "12px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #f5c6cb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {error} 
            <button className="btn btn-secondary" onClick={loadAcceptedDonors} style={{ padding: "0.25rem 0.75rem", width: "auto", fontSize: "0.875rem" }}>Retry</button>
        </div>
      )}

      {/* Sections */}
      {section === "patients" && <div className="fade-in"><PatientSection user={user} /></div>}
      {section === "requests" && <div className="fade-in"><RequestSection user={user} /></div>}
      {section === "accepted" && (
        <div className="fade-in">
          <AcceptedDonorsSection 
            donors={acceptedDonors} 
            reload={loadAcceptedDonors} 
            loading={loading}
          />
        </div>
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
      <h3 style={{ marginBottom: "1.5rem" }}>Register New Patient</h3>
      <div className="card" style={{ padding: "2rem", background: "rgba(255, 255, 255, 0.5)", marginBottom: "2rem" }}>
          <div className="grid-2-col">
              <div className="form-group">
                  <label>Full Name</label>
                  <input placeholder="Enter full name" value={form.fullname} onChange={e => setForm({ ...form, fullname: e.target.value })} />
              </div>
              <div className="form-group">
                  <label>NIC Number</label>
                  <input placeholder="Enter NIC" value={form.nic} onChange={e => setForm({ ...form, nic: e.target.value })} />
              </div>
          </div>
          <div className="form-group">
              <label>Blood Group</label>
              <select 
                value={form.blood_group} 
                onChange={e => setForm({ ...form, blood_group: e.target.value })}
              >
                <option value="">Select Blood Group</option>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
          </div>
          <button className="btn btn-primary" onClick={handleSubmit} style={{ marginTop: "1rem" }}>Add Patient Record</button>
      </div>

      <h4 style={{ marginTop: "30px", marginBottom: "1rem" }}>Registered Patients</h4>
      {loading ? (
          <div className="flex-center" style={{ padding: "2rem" }}>
              <div className="loader"></div>
              <p>Loading patients...</p>
          </div>
      ) : patients.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No patients registered yet.</p>
      ) : (
        patients.map(p => (
          <div key={p.id} className="alert-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeftColor: "var(--secondary)" }}>
            <div>
                <strong style={{ fontSize: "1.1rem", color: "var(--accent)" }}>{p.fullname}</strong>
                <p style={{ margin: 0, fontSize: "0.875rem" }}>NIC: {p.nic}</p>
            </div>
            <span style={{ color: "var(--primary)", fontWeight: "700", fontSize: "1.25rem", backgroundColor: "rgba(230, 57, 70, 0.1)", padding: "0.5rem 1rem", borderRadius: "8px" }}>
                {p.blood_group}
            </span>
          </div>
        ))
      )}
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
      <h3 style={{ marginBottom: "0.5rem" }}>Broadcast Urgent Blood Request</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Sending this will alert all nearby donors and highlight your hospital on the map.</p>
      
      <div className="card" style={{ background: "rgba(230, 57, 70, 0.03)", border: "1px solid rgba(230, 57, 70, 0.2)", padding: "2rem" }}>
          <div className="form-group">
              <label>Required Blood Group</label>
              <select 
                value={blood_group} 
                onChange={e => setBloodGroup(e.target.value)}
              >
                <option value="">Select Blood Group</option>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
          </div>

          <div className="form-group">
              <label>District</label>
              <input placeholder="e.g. Colombo" value={district} onChange={e => setDistrict(e.target.value)} />
          </div>
          
          <button className="btn btn-primary" onClick={handleRequest} style={{ marginTop: "1rem" }}>
            <span style={{ marginRight: "0.5rem" }}>🚨</span> Broadcast Urgent Request
          </button>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0 }}>Donors On Their Way</h3>
          <button className="btn btn-secondary" onClick={reload} style={{ width: "auto", fontSize: "0.875rem", padding: "0.5rem 1rem" }}>Refresh List</button>
      </div>
 
      {loading ? (
          <div className="flex-center" style={{ padding: "3rem" }}>
              <div className="loader"></div>
              <p style={{ color: "var(--text-muted)" }}>Updating donor status...</p>
          </div>
      ) : donors.length === 0 ? (
          <div style={{ color: "var(--text-muted)", padding: "3rem", textAlign: "center", border: "2px dashed #E2E8F0", borderRadius: "var(--radius-md)" }}>
              <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>No donors yet.</p>
              <p style={{ fontSize: "0.875rem" }}>Accepted requests will appear here in real-time.</p>
          </div>
      ) : (
        donors.map(d => (
          <div key={d.request_id} className="alert-card" style={{ borderLeftColor: "var(--success)", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                <div>
                    <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--accent)" }}>{d.fullname}</h4>
                    <p style={{ margin: 0, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ color: "var(--secondary)" }}>📞</span> {d.telephone}
                    </p>
                </div>
                <div style={{ textAlign: "right" }}>
                    <span style={{ color: "var(--primary)", fontWeight: "800", fontSize: "1.5rem", display: "block" }}>{d.blood_group}</span>
                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Requested</span>
                </div>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => handleMarkDone(d.request_id)}
              style={{ backgroundColor: "var(--success)", boxShadow: "0 4px 14px 0 rgba(42, 157, 143, 0.3)" }}
            >
              Confirm Donation Received
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default HospitalDashboard;