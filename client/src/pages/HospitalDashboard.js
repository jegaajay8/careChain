import React, { useState, useEffect, useCallback } from "react";

function HospitalDashboard({ user, logout }) {
  const [section, setSection] = useState("patients");
  const [acceptedDonors, setAcceptedDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------- Load Accepted Donors ----------------
  const loadAcceptedDonors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5001/accepted-donors/${user.id}`);
      if (!res.ok) throw new Error("Failed to load accepted donors");
      const data = await res.json();
      setAcceptedDonors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
   }, [user.id]);

  // ----------------- RENDER -----------------
  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <p>Hospital: <strong>{user.username}</strong></p>
        <button onClick={logout} style={{ backgroundColor: "#e74c3c", color: "white", padding: "5px 10px" }}>Logout</button>
      </div>

      <h2>Hospital Dashboard</h2>

      {/* Tabs */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setSection("patients")}
          style={section === "patients" ? activeTabStyle : tabStyle}
        >
          Patients
        </button>
        <button
          onClick={() => setSection("requests")}
          style={section === "requests" ? activeTabStyle : tabStyle}
        >
          Send Blood Request
        </button>
        <button
          onClick={() => { setSection("accepted"); loadAcceptedDonors(); }}
          style={section === "accepted" ? activeTabStyle : tabStyle}
        >
          Accepted Donors
        </button>
      </div>

      <hr />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {/* Sections */}
      {section === "patients" && <PatientSection user={user} />}
      {section === "requests" && <RequestSection user={user} />}
      {section === "accepted" && <AcceptedDonorsSection donors={acceptedDonors} reload={loadAcceptedDonors} />}
    </div>
  );
}

// ---------- STYLES ----------
const tabStyle = {
  padding: "8px 15px",
  marginRight: "5px",
  cursor: "pointer",
  backgroundColor: "#ecf0f1",
  border: "1px solid #bdc3c7",
};

const activeTabStyle = {
  ...tabStyle,
  backgroundColor: "#3498db",
  color: "white",
  border: "1px solid #2980b9",
};

// ---------------- PATIENT SECTION ----------------
function PatientSection({ user }) {
  const [form, setForm] = useState({ fullname: "", nic: "", blood_group: "" });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5001/get-patients/${user.id}`);
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);


  useEffect(() => {
    loadPatients();
  }, [loadPatients]);


  const handleSubmit = async () => {
    if (!form.fullname || !form.nic || !form.blood_group) return alert("Fill all fields");
    try {
      await fetch("http://localhost:5001/add-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospital_user_id: user.id, ...form }),
      });
      alert("Patient Added");
      setForm({ fullname: "", nic: "", blood_group: "" });
      loadPatients();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h3>Manage Patients</h3>
      <input placeholder="Full Name" value={form.fullname} onChange={e => setForm({ ...form, fullname: e.target.value })} /><br />
      <input placeholder="NIC" value={form.nic} onChange={e => setForm({ ...form, nic: e.target.value })} /><br />
      <input placeholder="Blood Group" value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })} /><br />
      <button onClick={handleSubmit} style={{ marginTop: "10px" }}>Register Patient</button>

      <h4>Current Patients</h4>
      {loading ? <p>Loading...</p> :
        patients.map(p => (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: "10px", margin: "5px 0" }}>
            {p.fullname} ({p.blood_group}) - NIC: {p.nic}
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
    if (!blood_group || !district) return alert("Fill all fields");
    try {
      await fetch("http://localhost:5001/send-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospital_user_id: user.id, blood_group, district }),
      });
      alert("Blood Request Broadcasted!");
      setBloodGroup("");
      setDistrict("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h3>Send Urgent Blood Request</h3>
      <input placeholder="Blood Group (e.g. O+)" value={blood_group} onChange={e => setBloodGroup(e.target.value)} /><br />
      <input placeholder="District" value={district} onChange={e => setDistrict(e.target.value)} /><br />
      <button onClick={handleRequest} style={{ marginTop: "10px" }}>Broadcast Request</button>
    </div>
  );
}

// ---------------- ACCEPTED DONORS SECTION ----------------
function AcceptedDonorsSection({ donors, reload }) {
  const handleMarkDone = async (request_id) => {
    try {
      await fetch("http://localhost:5001/complete-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id }),
      });
      alert("Donation marked as completed");
      reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h3>Donors Who Accepted Requests</h3>
      {donors.length === 0 ? <p>No active donor matches yet.</p> :
        donors.map(d => (
          <div key={d.request_id} style={{ border: "1px solid #27ae60", padding: "10px", margin: "5px 0", backgroundColor: "#f0fff0" }}>
            <p><strong>Donor:</strong> {d.fullname}</p>
            <p><strong>Blood:</strong> {d.blood_group} | <strong>Tel:</strong> {d.telephone}</p>
            <button onClick={async () => {
              const res = await fetch(`http://localhost:5001/donor-details/${d.donor_id}`);
              const data = await res.json();
              alert(`Full Details:\nName: ${data.fullname}\nNIC: ${data.nic}\nLocation: ${data.city}, ${data.district}`);
            }}>View Details</button>
            <button style={{ marginLeft: "10px", backgroundColor: "#27ae60", color: "white" }} onClick={() => handleMarkDone(d.request_id)}>Mark as Done</button>
          </div>
        ))
      }
    </div>
  );
}

export default HospitalDashboard;