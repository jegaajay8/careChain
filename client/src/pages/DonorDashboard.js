import React, { useState, useEffect } from "react";

function DonorDashboard({ user, logout }) {
  const [section, setSection] = useState("profile");
  const [requests, setRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

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

  const loadHistory = async () => {
    try {
      const res = await fetch(`http://localhost:5001/donation-history/${user.id}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      alert("Failed to load history");
    }
  };


  const filteredRequests = requests.filter(r =>
    r.hospital_name.toLowerCase().includes(search.toLowerCase()) &&
    (filterDistrict === "" || r.district === filterDistrict)
  );

  const loadNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:5001/donor-notifications/${user.id}`);
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      alert("Failed to load notifications");
    }
  };

  const exportData = () => {
    const data = JSON.stringify(acceptedRequests, null, 2);
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "donation-report.txt";
    a.click();
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
        <button onClick={() => setSearch("")}>Reset Filters</button>
        <button onClick={() => { setSection("history"); loadHistory(); }} style={{ marginLeft: "10px" }}>Donation History</button>
        <button onClick={() => { setSection("notifications"); loadNotifications(); }} style={{ marginLeft: "10px" }}>Notifications ({notifications.length})</button>
        <button onClick={exportData} style={{ marginLeft: "10px" }}>Export Report</button>
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
          <input
            placeholder="Search hospital..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            placeholder="Filter district..."
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            style={{ marginLeft: "10px" }}
          />
          {requests.length === 0 ? <p>No open requests</p> :
            filteredRequests.map(r => (
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

      {section === "history" && (
        <div>
          <h3>Donation History</h3>
          {history.length === 0 ? (<p>No history found</p>) : (
            history.map(h => (
              <div key={h.id} style={{ border: "1px solid blue", margin: "10px", padding: "10px" }}>
                <p>Hospital: {h.hospital_name}</p>
                <p>Date: {h.date}</p>
                <p>Blood Group: {h.blood_group}</p>
              </div>
            ))
          )}
        </div>
      )}

      {section === "notifications" && (
        <div>
          <h3>Notifications</h3>
            {notifications.length === 0 ? (
                <p>No notifications</p>
                ) : (
              notifications.map(n => (
              <div key={n.id} style={{ background: "#fff3cd", padding: "10px", margin: "10px 0" }}>
                <p>{n.message}</p>
                <small>{n.created_at}</small>
              </div>
                ))
            )}
        </div>
      )}
      
    </div>
  );
}

export default DonorDashboard;