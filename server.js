/* ============================================================
   server.js — Express.js Development Server
   Smart Incident Indicator
   ============================================================
   Serves static files and provides API endpoints for JSON data.
   Run: npm start → http://localhost:3000
   ============================================================ */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

/* ------------------------------------------------------------
   Middleware
   ------------------------------------------------------------ */

// Parse JSON request bodies (for future POST endpoints)
app.use(express.json());

// Serve static files from the project root
app.use(express.static(path.join(__dirname)));

// CORS headers (allow frontend dev on different ports)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

/* ------------------------------------------------------------
   API Routes — Serve JSON Data
   ------------------------------------------------------------ */

// GET /api/shipments — Return all shipments
app.get('/api/shipments', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'shipments.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to load shipments data' });
        res.json(JSON.parse(data));
    });
});

// GET /api/incidents — Return all incidents
app.get('/api/incidents', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'incidents.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to load incidents data' });
        res.json(JSON.parse(data));
    });
});

// GET /api/ports — Return all ports
app.get('/api/ports', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'ports.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to load ports data' });
        res.json(JSON.parse(data));
    });
});

// GET /api/dashboard/stats — Aggregated dashboard statistics
app.get('/api/dashboard/stats', (req, res) => {
    try {
        const shipments = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'shipments.json'), 'utf8'));
        const incidents = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'incidents.json'), 'utf8'));

        const stats = {
            totalShipments: shipments.length,
            activeShipments: shipments.filter(s => s.status === 'In Transit').length,
            todayIncidents: incidents.filter(i => i.status === 'Active').length,
            criticalAlerts: incidents.filter(i => i.severity === 'critical').length,
            highRiskShipments: shipments.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length,
            averageRiskScore: Math.round(shipments.reduce((sum, s) => sum + s.riskScore, 0) / shipments.length),
            riskPercentage: Math.round((shipments.filter(s => s.riskScore > 60).length / shipments.length) * 100)
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: 'Failed to compute dashboard stats' });
    }
});

/* ------------------------------------------------------------
   SPA-Friendly Routing — Serve HTML pages
   ------------------------------------------------------------ */

const pages = ['dashboard', 'incidents', 'shipments', 'analytics', 'map', 'settings', 'login'];

pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, `${page}.html`));
    });
});

// Root serves landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/* ------------------------------------------------------------
   Start Server
   ------------------------------------------------------------ */

app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════════════╗
    ║                                                  ║
    ║   🚢  SMART INCIDENT INDICATOR                   ║
    ║   Real-Time Maritime Intelligence Platform        ║
    ║                                                  ║
    ║   Server running at:                             ║
    ║   → http://localhost:${PORT}                        ║
    ║                                                  ║
    ║   Pages:                                         ║
    ║   → Landing:    http://localhost:${PORT}/            ║
    ║   → Login:      http://localhost:${PORT}/login       ║
    ║   → Dashboard:  http://localhost:${PORT}/dashboard   ║
    ║   → Incidents:  http://localhost:${PORT}/incidents   ║
    ║   → Shipments:  http://localhost:${PORT}/shipments   ║
    ║   → Analytics:  http://localhost:${PORT}/analytics   ║
    ║   → Map:        http://localhost:${PORT}/map         ║
    ║   → Settings:   http://localhost:${PORT}/settings    ║
    ║                                                  ║
    ╚══════════════════════════════════════════════════╝
    `);
});
