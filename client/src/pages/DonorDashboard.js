import React, { useState, useEffect } from "react";

function DonorDashboard({ user, logout }) {
  const [section, setSection] = useState("profile");
  const [requests, setRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5001/donor-profile/${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user.id]);

  
  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5001/get-requests/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch requests");
      const data = await res.json();
      setRequests(data.filter(r => r.status === "open"));
      setAcceptedRequests(data.filter(r => r.status === "accepted"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (request_id) => {
    try {
      const res = await fetch("http://localhost:5001/accept-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id, donor_user_id: user.id }),
      });
      if (!res.ok) throw new Error("Failed to accept request");
      alert("Request Accepted");
      loadRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  const closeRequest = async (request_id) => {
    try {
      const res = await fetch("http://localhost:5001/close-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id }),
      });
      if (!res.ok) throw new Error("Failed to close request");
      alert("Request Closed");
      loadRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  const updateProfile = async () => {
    if (!profile.fullname || !profile.telephone) {
      alert("Fullname and Telephone are required");
      return;
    }
    try {
      const res = await fetch("http://localhost:5001/update-donor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          fullname: profile.fullname,
          telephone: profile.telephone,
          district: profile.district,
          city: profile.city,
          road: profile.road,
          postal_code: profile.postal_code,
        }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      alert("Profile Updated");
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete account?");
    if (!confirmDelete) return;
    try {
      const res = await fetch("http://localhost:5001/delete-donor-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (!res.ok) throw new Error("Failed to delete account");
      alert("Account Deleted");
      logout();
    } catch (err) {
      alert(err.message);
    }
  };

  // ----------------- RENDER -----------------
  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>Donor Dashboard</h2>
      <p>Welcome, <strong>{user.username}</strong></p>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setSection("profile")}>Profile</button>
        <button onClick={() => { setSection("requests"); loadRequests(); }} style={{ marginLeft: "10px" }}>Blood Requests</button>
        <button onClick={() => setSection("accepted")} style={{ marginLeft: "10px" }}>Accepted Donations</button>
        <button onClick={logout} style={{ marginLeft: "10px" }}>Logout</button>
        <button onClick={deleteAccount} style={{ marginLeft: "10px", color: "red" }}>Delete Account</button>
      </div>

      {section === "profile" && profile && (
        <div>
          <h3>Your Profile</h3>
          <p>Blood Group: {profile.blood_group}</p>

          <input value={profile.fullname} placeholder="Fullname"
            onChange={e => setProfile({ ...profile, fullname: e.target.value })} /><br /><br />
          <input value={profile.telephone} placeholder="Telephone"
            onChange={e => setProfile({ ...profile, telephone: e.target.value })} /><br /><br />
          <input value={profile.district} placeholder="District"
            onChange={e => setProfile({ ...profile, district: e.target.value })} /><br /><br />
          <input value={profile.city} placeholder="City"
            onChange={e => setProfile({ ...profile, city: e.target.value })} /><br /><br />
          <input value={profile.road} placeholder="Road"
            onChange={e => setProfile({ ...profile, road: e.target.value })} /><br /><br />
          <input value={profile.postal_code} placeholder="Postal Code"
            onChange={e => setProfile({ ...profile, postal_code: e.target.value })} /><br /><br />

          <button onClick={updateProfile}>Save Changes</button>
        </div>
      )}

      {section === "requests" && (
        <div>
          <h3>Open Blood Requests</h3>
          {requests.length === 0 ? <p>No open requests</p> :
            requests.map(r => (
              <div key={r.id} style={{ border: "1px solid black", padding: "10px", margin: "10px 0" }}>
                <p>Hospital: {r.hospital_name}</p>
                <p>District: {r.district}</p>
                <p>Blood Needed: {r.blood_group}</p>
                <p>Status: {r.status}</p>
                {r.status === "open" && (
                  <>
                    <button onClick={() => acceptRequest(r.id)}>Accept</button>
                    <button onClick={() => closeRequest(r.id)} style={{ marginLeft: "10px" }}>Close</button>
                  </>
                )}
              </div>
            ))
          }
        </div>
      )}

      {section === "accepted" && (
        <div>
          <h3>Accepted Requests</h3>
          {acceptedRequests.length === 0 ? <p>No accepted requests yet</p> :
            acceptedRequests.map(r => (
              <div key={r.id} style={{ border: "1px solid green", padding: "10px", margin: "10px 0", backgroundColor: "#f0fff0" }}>
                <p>Hospital: {r.hospital_name}</p>
                <p>District: {r.district}</p>
                <p>Blood Needed: {r.blood_group}</p>
                <p>Status: {r.status}</p>
                <button onClick={() => closeRequest(r.id)}>Mark Closed</button>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

export default DonorDashboard;