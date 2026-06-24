# 🚢 Smart Incident Indicator
### Real-Time Global Maritime Intelligence Platform (Hackathon MVP)

Welcome to the **Smart Incident Indicator**! 🌊

Imagine you are managing a fleet of massive cargo ships carrying millions of dollars in electronics, vehicles, and raw materials across the globe. Suddenly, a Category 4 cyclone develops in the Indian Ocean, a dockworkers' strike shuts down the Port of Rotterdam, or a major cyberattack knocks out port customs systems. How do you redirect your ships, estimate delays, and protect your crew and cargo?

That is exactly the problem **Smart Incident Indicator** solves. It is a live, enterprise-grade maritime intelligence platform built to monitor maritime incidents worldwide, map affected ports, overlay ship transits, assess shipment risks, and deliver clear, actionable recommendations to logistics coordinators.

---

## ✨ Key Features

This platform is divided into several highly interactive, real-time modules:

*   **📊 Executive Dashboard**: A single control center showing live system stats (Active transits, critical weather/piracy alerts, system health indexes), recent events feeds, and a mini-map layout.
*   **🗺️ Live Maritime Map**: A gorgeous, full-screen map utilizing **Leaflet.js** with a sleek dark-theme map skin. It plots:
    *   *Incident Hotspots*: Color-coded markers indicating severe weather, piracy, or strikes. Critical warnings pulse visually to draw immediate attention.
    *   *Ports*: Track global container ports. Disrupted facilities show red status, while operational channels remain green.
    *   *Ship Routes*: Connects origins to destinations with transit lanes color-coded based on calculation risk (high-risk routes turn red).
*   **📈 Insights & Analytics**: Renders **7 custom graphs** via **Chart.js** displaying trends in incidents, weekly counts, cargo distributions by global shipping regions, and risk splits.
*   **📑 Shipments Ledger**: A detailed cargo registry with search utilities, column sorting, dynamic CSV sheet downloads, and ready-to-print PDF reporting.
*   **⚠️ Incident Feed**: A dedicated directory of incidents containing chronological event logs, geographical coordinates, and suggested diversion steps.
*   **⚙️ Settings Panel**: Control parameters like view layout density, theme transitions, notification channels (SMS/Email toggles), and rotate programmatic API keys.

---

## 🛠️ The Tech Stack

We chose lightweight, high-performance web standards to ensure the application loads in milliseconds and stays buttery smooth:

*   **Core Logic**: Vanilla JavaScript (ES6+ Modules) — clean, standard, browser-native logic without heavy framework bloat.
*   **User Interface**: HTML5 & CSS3 styled with the **Tailwind CSS** system (v3 CDN) for layout and typography (Inter & Poppins Google Fonts).
*   **Maps & Cartography**: [Leaflet.js](https://leafletjs.com/) with CartoDB Dark Matter tile grids.
*   **Data Graphics**: [Chart.js](https://www.chartjs.org/) for beautiful, responsive analytics.
*   **Server Backend**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) serving static web templates and delivering structured JSON streams.

---

## ⚙️ Quick Start (How to Run it Locally)

Follow these simple steps to run this platform on your machine:

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### 2. Install Dependencies
Open your terminal inside the project directory and install the necessary package:
```bash
npm install
```

### 3. Run the Server
Start the Express server using:
```bash
npm start
```

### 4. Open in Browser
Once the server starts up, you will see a banner in the console. Open your web browser and navigate to:
```
http://localhost:3000
```
*You can log in by clicking "Log In" on the landing page, then click "Sign In" (any email/password will work for this MVP demo!).*

---

## 📂 Project Directory Structure

```
SMART-INCIDENT-INDICATOR/
├── index.html               # Landing page & onboarding
├── login.html               # Secure account entry
├── dashboard.html           # Main operational panel
├── incidents.html           # Incident directory and detail drawers
├── shipments.html           # Cargo tracker ledger
├── analytics.html           # Operational graphics and trends
├── map.html                 # Full-screen interactive map
├── settings.html            # User options and integration tokens
├── server.js                # Express app server & API routes
├── package.json             # App manifest and scripts
├── .gitignore               # Ignored local files (like node_modules)
│
├── data/                    # JSON Mock Databases
│   ├── shipments.json       # 30 detailed shipment transits
│   ├── incidents.json       # 20 active global incidents
│   └── ports.json           # 50 global port coordinates
│
├── components/              # HTML Shared Layout Partials
│   ├── navbar.html          # Global header navigation
│   ├── sidebar.html         # Sidebar selector panel
│   └── footer.html          # Bottom copyright bar
│
└── assets/                  # Public resources
    ├── css/                 # Modern styling sheets
    └── js/                  # Page-specific modular controllers
```

---

## 💡 Why We Built This

Global shipping is the backbone of the economy, but it is constantly at the mercy of unpredictable events. By compiling real-time incident reports, linking them automatically to active shipment paths, and displaying risk indexes, the **Smart Incident Indicator** turns raw, chaotic data into simple, actionable intelligence. It helps logistics teams make smart choices, save cargo, and protect crews.

Enjoy tracking the fleet! 🚢⚓
