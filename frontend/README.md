# careChain Frontend

This folder contains the React frontend for the Comprehensive Organ & Blood Donation Emergency System.

Tech Stack:
- React.js
- HTML
- CSS
- JavaScript

- ┌───────────────┐
│     HOME      │
└───────────────┘
        |
        |----------------------|
        v                      v
┌───────────────┐      ┌───────────────┐
│     LOGIN     │      │    SIGN UP    │
└───────────────┘      └───────────────┘
        |                      |
        v                      v
┌───────────────────┐   ┌───────────────────────┐
│ AUTH / ROLE CHECK │   │   SELECT USER ROLE    │
│ (Hospital/Donor)  │   │ (Hospital or Donor)   │
└───────────────────┘   └───────────────────────┘
        |                      |
        |----------|-----------|
                   v
        ┌─────────────────────────────────┐
        │         USER DASHBOARD           │
        │  ┌────────────────────────────┐ │
        │  │ Hospital → Hospital Panel  │ │
        │  │ Donor    → Donor Panel     │ │
        │  └────────────────────────────┘ │
        └─────────────────────────────────┘
