# careChain Frontend

This folder contains the React frontend for the Comprehensive Organ & Blood Donation Emergency System.

Tech Stack:
- React.js
- HTML
- CSS
- JavaScript


frontend/
│
├── index.html          → HOME
│   ├── login.html      → LOGIN page
│   │     └── role-check.js → Redirects to dashboard based on role
│   └── signup.html     → SIGN UP page
│           └── role-select.js → Hospital / Donor selection → Redirects to dashboard
│
└── dashboard.html      → USER DASHBOARD
      ├── Hospital Panel
      └── Donor Panel


                ┌─────────────┐
                │   HOME      │
                └─────────────┘
                   ..     ..
                  ..       ..
                 ..         ..
        ┌─────────────┐   ┌─────────────┐
        │    LOGIN     │   │   SIGN UP    │
        └─────────────┘   └─────────────┘
             ..                 ..
            ..                   ..
   ┌──────────────────┐   ┌──────────────────────┐
   │ AUTH / ROLE CHECK│   │  SELECT USER ROLE    │
   │ (Hospital/Donor) │   │ (Hospital or Donor)  │
   └──────────────────┘   └──────────────────────┘
            ..                   ..
             ..                 ..
              ..               ..
        ┌─────────────────────────────────┐
        │        USER DASHBOARD            │
        │  ┌───────────────────────────┐ │
        │  │ Hospital → Hospital Panel │ │
        │  │ Donor    → Donor Panel    │ │
        │  └───────────────────────────┘ │
        └─────────────────────────────────┘