import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Custom Blinking Icon for Urgent Needs
const BloodDropIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="blood-drop-inner"></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

function DonorDashboard({ user, logout }) {
  const [section, setSection] = useState("map");
  const [requests, setRequests] = useState([]);
  const [hospitals, setHospitals] = useState([]); 
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Memoized data loader to prevent infinite loops
  const loadDashboardData = useCallback(async () => {
    try {
      const [hospRes, reqRes, profRes] = await Promise.all([
        fetch(`http://localhost:5001/api/hospital-locations`),
        fetch(`http://localhost:5001/api/all-requests`),
        fetch(`http://localhost:5001/api/donor-profile/${user.id}`)
      ]);

      if (!hospRes.ok || !reqRes.ok) throw new Error("Server communication failed.");

      const hospData = await hospRes.json();
      const reqData = await reqRes.json();
      
      // Safety check: ensure we always have arrays
      setHospitals(Array.isArray(hospData) ? hospData : []);
      setRequests(Array.isArray(reqData) ? reqData : []);

      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData);
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
      setError("Unable to load map data. Please check your server connection.");
    }
  }, [user.id]);

  useEffect(() => {
    setLoading(true);
    loadDashboardData().finally(() => setLoading(false));
  }, [loadDashboardData]);

  const acceptRequest = async (request_id) => {
    try {
        const res = await fetch("http://localhost:5001/api/accept-request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ request_id, donor_user_id: user.id }),
        });
        if (!res.ok) throw new Error("Failed to accept request.");
        alert("Success! Request accepted. Please visit the hospital.");
        loadDashboardData(); // Refresh both map and list
    } catch (err) {
        alert(err.message);
    }
  };

  if (loading) return <div className="App" style={{padding: "50px"}}><h3>Syncing CareChain Data...</h3></div>;

  return (
    <div className="App" style={{ maxWidth: "1000px", margin: "20px auto" }}>
      <style>{`
        .blood-drop-inner {
            width: 16px; height: 16px;
            background-color: #c0392b;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            margin: 7px auto;
            animation: pulse-red 1.2s infinite;
            border: 2px solid white;
            box-shadow: 0 0 10px rgba(192, 57, 43, 0.6);
        }
        @keyframes pulse-red {
            0% { transform: rotate(-45deg) scale(0.9); opacity: 0.8; }
            50% { transform: rotate(-45deg) scale(1.2); opacity: 1; }
            100% { transform: rotate(-45deg) scale(0.9); opacity: 0.8; }
        }
        .fade-in { animation: fadeIn 0.4s ease-in; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
         <div style={{ textAlign: "left" }}>
            <h2 style={{margin: 0, color: "#c0392b"}}>Donor Dashboard</h2>
            <p style={{margin: 0, fontSize: "14px", color: "#666"}}>Welcome back, <b>{profile?.fullname || user.username}</b></p>
         </div>
         <button onClick={logout} style={{background: "#2c3e50", width: "auto"}}>Logout</button>
      </div>

      {error && (
        <div style={{ color: "#721c24", background: "#f8d7da", padding: "12px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #f5c6cb" }}>
            {error} <button onClick={loadDashboardData} style={{padding: "2px 10px", marginLeft: "10px", width: "auto", fontSize: "12px"}}>Retry</button>
        </div>
      )}
      
      {/* Navigation */}
      <div style={{ marginBottom: "25px", display: "flex", gap: "10px" }}>
        <button onClick={() => setSection("map")} style={{ backgroundColor: section === "map" ? "#c0392b" : "#95a5a6", flex: 1 }}>Hospital Map</button> 
        <button onClick={() => setSection("requests")} style={{ backgroundColor: section === "requests" ? "#c0392b" : "#95a5a6", flex: 1 }}>List View</button>
        <button onClick={() => setSection("profile")} style={{ backgroundColor: section === "profile" ? "#c0392b" : "#95a5a6", flex: 1 }}>My Profile</button>
      </div>

      {/* SECTION: MAP */}
      {section === "map" && (
        <div className="fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{margin: 0}}>Sri Lanka Urgent Needs</h3>
            <span style={{ fontSize: "12px", color: "#c0392b", fontWeight: "bold" }}>🚨 Blinking = Urgent</span>
          </div>
          
          <div style={{ height: "480px", border: "1px solid #ddd", borderRadius: "12px", overflow: "hidden" }}>
            <MapContainer center={[7.8731, 80.7718]} zoom={7.5} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              
              {hospitals.map((h) => {
                // Check if this specific hospital has an open request
                const hasUrgent = h.urgent_count > 0;
                const activeReq = requests.find(req => req.hospital_id === h.id);

                return (
                  <Marker 
                    key={h.id} 
                    position={[parseFloat(h.lat), parseFloat(h.lng)]} 
                    icon={hasUrgent ? BloodDropIcon : DefaultIcon}
                  >
                    <Popup>
                      <div style={{ minWidth: "140px" }}>
                        <b style={{ color: "#c0392b" }}>{h.hospital_name}</b><br />
                        <span style={{ fontSize: "11px" }}>{h.district}</span>
                        <hr style={{ margin: "8px 0", border: "0.5px solid #eee" }} />
                        
                        {activeReq ? (
                          <div style={{ textAlign: "center" }}>
                            <p style={{ color: "#c0392b", fontWeight: "bold", margin: "5px 0" }}>Need: {activeReq.blood_group}</p>
                            <button onClick={() => acceptRequest(activeReq.id)} style={{ padding: "6px", fontSize: "12px", width: "100%" }}>Accept Now</button>
                          </div>
                        ) : (
                          <p style={{ color: "#27ae60", margin: 0, fontSize: "12px" }}>✅ Stock Stable</p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      )}

      {/* SECTION: LIST VIEW */}
      {section === "requests" && (
        <div className="fade-in" style={{ textAlign: "left" }}>
          <h3>Available Blood Requests</h3>
          {requests.length === 0 ? <p style={{color: "#999"}}>No active requests found at this moment.</p> :
            requests.map(r => (
              <div key={r.id} style={{ background: "white", border: "1px solid #eee", padding: "15px", borderRadius: "10px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                <div>
                    <h4 style={{margin: "0 0 5px 0"}}>{r.hospital_name}</h4>
                    <span style={{color: "#c0392b", fontWeight: "bold"}}>{r.blood_group} Needed</span>
                </div>
                <button onClick={() => acceptRequest(r.id)} style={{ width: "auto", padding: "8px 20px" }}>Accept</button>
              </div>
            ))
          }
        </div>
      )}

      {/* SECTION: PROFILE */}
      {section === "profile" && profile && (
        <div style={{ textAlign: "left" }} className="fade-in">
          <h3>Your Donor Profile</h3>
          <div style={{ background: "white", padding: "25px", borderRadius: "12px", border: "1px solid #eee" }}>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px"}}>
                  <p><b>Name:</b> {profile.fullname}</p>
                  <p><b>NIC:</b> {profile.nic}</p>
                  <p><b>Blood Type:</b> <span style={{color: "#c0392b", fontWeight: "bold"}}>{profile.blood_group}</span></p>
                  <p><b>District:</b> {profile.district}</p>
                  <p><b>Contact:</b> {profile.telephone}</p>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonorDashboard;