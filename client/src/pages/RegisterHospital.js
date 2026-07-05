import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Asset imports
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

function RegisterHospital({ setPage }) {
    const [form, setForm] = useState({
        rep_name: "",
        username: "",
        password: "",
        hospital_name: "",
        hospital_id: "",
        district: "",
        lat: 7.8731, 
        lng: 80.7718
    });

    // 1. Initialize as empty arrays to prevent .filter() and .map() errors
    const [masterHospitals, setMasterHospitals] = useState([]); 
    const [filteredHospitals, setFilteredHospitals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const districts = ["Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"];

    useEffect(() => {
        fetch("http://localhost:5001/api/master-hospitals")
            .then(res => res.json())
            .then(data => {
                // 2. Safety Check: Only set if data is an array
                if (Array.isArray(data)) {
                    setMasterHospitals(data);
                } else {
                    console.error("Expected array but got:", data);
                    setMasterHospitals([]); 
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Error loading hospitals:", err);
                setMasterHospitals([]); // Prevent crash on network error
                setIsLoading(false);
            });
    }, []);

    const handleDistrictChange = (e) => {
        const selectedDist = e.target.value;
        
        // 3. Robust filtering with array check
        const hospitalsToFilter = Array.isArray(masterHospitals) ? masterHospitals : [];
        const filtered = hospitalsToFilter.filter(h => h.district === selectedDist);
        
        setFilteredHospitals(filtered);
        
        setForm({ 
            ...form, 
            district: selectedDist, 
            hospital_name: "", 
            hospital_id: "", 
            lat: 7.8731, 
            lng: 80.7718 
        });
    };

    const handleHospitalSelect = (e) => {
        const selectedName = e.target.value;
        const data = filteredHospitals.find(h => h.name === selectedName);

        if (data) {
            setForm({
                ...form,
                hospital_name: selectedName,
                hospital_id: data.official_id,
                lat: parseFloat(data.lat),
                lng: parseFloat(data.lng)
            });
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!form.username || !form.password || !form.hospital_name || !form.rep_name) {
            alert("Please fill in all details and select your hospital.");
            return;
        }

        try {
            const res = await fetch("http://localhost:5001/register-hospital", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Registration failed");
            
            alert(`Success! ${form.hospital_name} is now registered under ${form.rep_name}.`);
            setPage("login");
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="card card-lg">
            <h2 style={{ textAlign: "center", marginBottom: "0.5rem" }}>Hospital Onboarding</h2>
            <p style={{ textAlign: "center", marginBottom: "2rem" }}>Register your institution to the CareChain network.</p>

            <div className="grid-2-col" style={{ marginBottom: "2rem" }}>
                {/* Representative Details */}
                <div style={{ background: "rgba(255,255,255,0.5)", padding: "1.5rem", borderRadius: "var(--radius-sm)", border: "1px solid #E2E8F0" }}>
                    <h4 style={{ color: "var(--secondary)", marginBottom: "1rem" }}>1. Representative Details</h4>
                    
                    <div className="form-group">
                        <label>Hospital Representative Name</label>
                        <input name="rep_name" value={form.rep_name} placeholder="e.g. Dr. A. Doctor_name" onChange={handleChange} />
                    </div>
                    
                    <div className="form-group">
                        <label>Account Username</label>
                        <input name="username" value={form.username} placeholder="hospital_user_123" onChange={handleChange} />
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" value={form.password} placeholder="••••••••" onChange={handleChange} />
                    </div>
                </div>

                {/* Hospital Linkage */}
                <div style={{ background: "rgba(255,255,255,0.5)", padding: "1.5rem", borderRadius: "var(--radius-sm)", border: "1px solid #E2E8F0" }}>
                    <h4 style={{ color: "var(--secondary)", marginBottom: "1rem" }}>2. Hospital Information</h4>
                    
                    <div className="form-group">
                        <label>District</label>
                        <select name="district" value={form.district} onChange={handleDistrictChange}>
                            <option value="">-- Select District --</option>
                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Select Hospital</label>
                        <select 
                            name="hospital_name" 
                            value={form.hospital_name} 
                            onChange={handleHospitalSelect}
                            disabled={!form.district || isLoading}
                        >
                            <option value="">{isLoading ? "Loading..." : "-- Choose Hospital --"}</option>
                            {Array.isArray(filteredHospitals) && filteredHospitals.map(h => (
                                <option key={h.id || h.official_id} value={h.name}>{h.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Registration ID (Auto)</label>
                        <input name="hospital_id" value={form.hospital_id} readOnly style={{ backgroundColor: "#F1F5F9", cursor: "not-allowed", color: "var(--text-muted)" }} />
                    </div>
                </div>
            </div>

            <div className="map-container" style={{ marginBottom: "2rem" }}>
                <MapContainer 
                    center={[form.lat, form.lng]} 
                    zoom={15} 
                    key={`${form.lat}-${form.lng}`} 
                    style={{height: '100%'}}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[form.lat, form.lng]} icon={DefaultIcon}>
                        <Popup>{form.hospital_name || "Location Preview"}</Popup>
                    </Marker>
                </MapContainer>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", alignItems: "center" }}>
                <button className="btn btn-primary" onClick={handleSubmit} style={{ width: "auto", minWidth: "250px" }}>
                    Complete Registration
                </button>
                <button className="btn-text" onClick={() => setPage("login")}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default RegisterHospital;