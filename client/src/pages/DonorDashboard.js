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
  html: `<div class="blood-drop-icon" style="margin: 5px auto;"></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34]
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

  if (loading) return (
      <div className="flex-center" style={{ minHeight: "50vh" }}>
          <div className="loader"></div>
          <h3 style={{ color: "var(--text-muted)" }}>Syncing CareChain Data...</h3>
      </div>
  );

  return (
    <div className="card card-lg" style={{ padding: "2rem" }}>
      <style>{`
        .fade-in { animation: fadeIn 0.4s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div className="dashboard-header">
         <div>
            <h2 style={{ margin: 0, color: "var(--accent)" }}>Donor Dashboard</h2>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>Welcome back, <b style={{ color: "var(--primary)" }}>{profile?.fullname || user.username}</b></p>
         </div>
         <button className="btn btn-secondary" onClick={logout} style={{ width: "auto", padding: "0.5rem 1.5rem" }}>Logout</button>
      </div>

      {error && (
        <div style={{ color: "#721c24", background: "#f8d7da", padding: "12px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #f5c6cb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {error} 
            <button className="btn btn-secondary" onClick={loadDashboardData} style={{ padding: "0.25rem 0.75rem", width: "auto", fontSize: "0.875rem" }}>Retry</button>
        </div>
      )}
      
      {/* Navigation */}
      <div className="tabs">
        <div className={`tab ${section === "map" ? "active" : ""}`} onClick={() => setSection("map")}>Hospital Map</div> 
        <div className={`tab ${section === "requests" ? "active" : ""}`} onClick={() => setSection("requests")}>List View</div>
        <div className={`tab ${section === "profile" ? "active" : ""}`} onClick={() => setSection("profile")}>My Profile</div>
      </div>

      {/* SECTION: MAP */}
      {section === "map" && (
        <div className="fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, color: "var(--accent)", fontSize: "1.25rem" }}>Sri Lanka Urgent Needs</h3>
            <span style={{ fontSize: "0.875rem", color: "var(--primary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="blood-drop-icon" style={{ width: "12px", height: "12px", borderWidth: "1px", animationDuration: "1s" }}></span> Blinking = Urgent
            </span>
          </div>
          
          <div className="map-container">
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
                      <div style={{ minWidth: "160px" }}>
                        <b style={{ color: "var(--primary)", fontSize: "1rem" }}>{h.hospital_name}</b><br />
                        <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{h.district}</span>
                        <hr style={{ margin: "10px 0", border: "0", borderTop: "1px solid #E2E8F0" }} />
                        
                        {activeReq ? (
                          <div style={{ textAlign: "center" }}>
                            <p style={{ color: "var(--primary)", fontWeight: "600", margin: "5px 0" }}>Need: {activeReq.blood_group}</p>
                            <button className="btn btn-primary" onClick={() => acceptRequest(activeReq.id)} style={{ padding: "0.5rem", fontSize: "0.875rem", width: "100%", marginTop: "0.5rem" }}>Accept Now</button>
                          </div>
                        ) : (
                          <p style={{ color: "var(--success)", margin: 0, fontSize: "0.875rem", fontWeight: "500", textAlign: "center" }}>✅ Stock Stable</p>
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
          <h3 style={{ marginBottom: "1.5rem" }}>Available Blood Requests</h3>
          {requests.length === 0 ? <p style={{color: "var(--text-muted)", fontStyle: "italic"}}>No active requests found at this moment.</p> :
            requests.map(r => (
              <div key={r.id} className="alert-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--accent)" }}>{r.hospital_name}</h4>
                    <span style={{ color: "var(--primary)", fontWeight: "600", fontSize: "0.875rem", display: "inline-block", backgroundColor: "rgba(230, 57, 70, 0.1)", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                        🩸 {r.blood_group} Needed
                    </span>
                </div>
                <button className="btn btn-primary" onClick={() => acceptRequest(r.id)} style={{ width: "auto", padding: "0.5rem 1.5rem" }}>Accept</button>
              </div>
            ))
          }
        </div>
      )}

      {/* SECTION: PROFILE */}
      {section === "profile" && profile && (
        <div style={{ textAlign: "left" }} className="fade-in">
          <h3 style={{ marginBottom: "1.5rem" }}>Your Donor Profile</h3>
          <div style={{ background: "rgba(255, 255, 255, 0.5)", padding: "2rem", borderRadius: "var(--radius-md)", border: "1px solid #E2E8F0" }}>
              <div className="grid-2-col">
                  <div style={{ marginBottom: "1rem" }}><span style={{ color: "var(--text-muted)", fontSize: "0.875rem", display: "block" }}>Full Name</span><strong style={{ fontSize: "1.1rem" }}>{profile.fullname}</strong></div>
                  <div style={{ marginBottom: "1rem" }}><span style={{ color: "var(--text-muted)", fontSize: "0.875rem", display: "block" }}>NIC Number</span><strong style={{ fontSize: "1.1rem" }}>{profile.nic}</strong></div>
                  <div style={{ marginBottom: "1rem" }}><span style={{ color: "var(--text-muted)", fontSize: "0.875rem", display: "block" }}>Blood Type</span><strong style={{ fontSize: "1.5rem", color: "var(--primary)" }}>{profile.blood_group}</strong></div>
                  <div style={{ marginBottom: "1rem" }}><span style={{ color: "var(--text-muted)", fontSize: "0.875rem", display: "block" }}>District</span><strong style={{ fontSize: "1.1rem" }}>{profile.district}</strong></div>
                  <div style={{ marginBottom: "1rem" }}><span style={{ color: "var(--text-muted)", fontSize: "0.875rem", display: "block" }}>Contact</span><strong style={{ fontSize: "1.1rem" }}>{profile.telephone}</strong></div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonorDashboard;