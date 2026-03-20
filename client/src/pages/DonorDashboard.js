import React, { useState, useEffect } from "react";

function DonorDashboard({ user, logout }) {

    const [section, setSection] = useState("");
    const [requests, setRequests] = useState([]);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const closeRequest = async (request_id) => {

        await fetch("http://localhost:5001/close-request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ request_id })
        });

        alert("Request Closed");
        loadRequests();
    };

    const loadProfile = async () => {
        const res = await fetch("http://localhost:5001/donor-profile/" + user.id);
        const data = await res.json();
        setProfile(data);
    };

    const loadRequests = async () => {
        const res = await fetch("http://localhost:5001/get-requests/" + user.id);
        const data = await res.json();
        setRequests(data);
    };

    const acceptRequest = async (request_id) => {
        await fetch("http://localhost:5001/accept-request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                request_id,
                donor_user_id: user.id
            })
        });

        alert("Request Accepted");
        loadRequests();
    };

    return (
        <div>
            <button onClick={async () => {

                const confirmDelete = window.confirm("Are you sure you want to delete account?");

                if (!confirmDelete) return;

                await fetch("http://localhost:5001/delete-donor-account", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: user.id })
                });

                alert("Account Deleted");

                logout();

            }}>
                Delete Account
            </button>

            <br /><br />

            <button onClick={logout}>Logout</button>
            <br /><br />
            <h2>Donor Dashboard</h2>

            <p>Welcome: {user.username}</p>

            <button onClick={() => setSection("profile")}>
                Profile
            </button>

            <br /><br />

            <button onClick={() => {
                setSection("messages");
                loadRequests();
            }}>
                Messages
            </button>

            <br /><br />

            {section === "profile" && profile && (
                <div>
                    <h3>Your Profile</h3>

                    <p>Blood Group: {profile.blood_group}</p>
                    <br />

                    <input
                        value={profile.fullname}
                        onChange={(e) =>
                            setProfile({ ...profile, fullname: e.target.value })
                        }
                    />
                    <br /><br />

                    <input
                        value={profile.telephone}
                        onChange={(e) =>
                            setProfile({ ...profile, telephone: e.target.value })
                        }
                    />
                    <br /><br />

                    <input
                        value={profile.district}
                        onChange={(e) =>
                            setProfile({ ...profile, district: e.target.value })
                        }
                    />
                    <br /><br />

                    <input
                        value={profile.city}
                        onChange={(e) =>
                            setProfile({ ...profile, city: e.target.value })
                        }
                    />
                    <br /><br />

                    <input
                        value={profile.road}
                        onChange={(e) =>
                            setProfile({ ...profile, road: e.target.value })
                        }
                    />
                    <br /><br />

                    <input
                        value={profile.postal_code}
                        onChange={(e) =>
                            setProfile({ ...profile, postal_code: e.target.value })
                        }
                    />
                    <br /><br />

                    <button onClick={async () => {
                        await fetch("http://localhost:5001/update-donor", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                user_id: user.id,
                                fullname: profile.fullname,
                                telephone: profile.telephone,
                                district: profile.district,
                                city: profile.city,
                                road: profile.road,
                                postal_code: profile.postal_code
                            })
                        });

                        alert("Profile Updated");
                    }}>
                        Save Changes
                    </button>
                </div>
            )}

            {section === "messages" && (
                <div>
                    <h3>Blood Requests</h3>

                    {requests.length === 0 && <p>No requests</p>}

                    {requests.map((r) => (
                        <div key={r.id} style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
                            <p>Hospital: {r.hospital_name}</p>
                            <p>District: {r.district}</p>
                            <p>Blood Needed: {r.blood_group}</p>

                            {r.status === "open" && (
                                <>
                                    <button onClick={() => acceptRequest(r.id)}>
                                        Accept
                                    </button>

                                    <button onClick={() => closeRequest(r.id)} style={{ marginLeft: "10px" }}>
                                        Close
                                    </button>
                                </>
                            )}

                            {r.status === "closed" && <p>Closed</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DonorDashboard;