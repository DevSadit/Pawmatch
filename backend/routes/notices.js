// =============================================
// Notices Routes - /api/notices
// =============================================
// Reads notices.xml and returns data as JSON
// Demonstrates XML integration requirement
// =============================================

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

const noticesFile = path.join(__dirname, "../data/notices.xml");

// ---- GET /api/notices ----
// Parse XML file and return notices as JSON
router.get("/", (req, res) => {
  const xmlData = fs.readFileSync(noticesFile, "utf-8");

  xml2js.parseString(xmlData, { explicitArray: false }, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error parsing notices XML" });
    }

    // Extract the notices array from the parsed XML
    const notices = result.notices.notice;

    // Handle single notice (xml2js returns object instead of array for single items)
    const noticesArray = Array.isArray(notices) ? notices : [notices];

    res.json(noticesArray);
  });
});

// ---- GET /api/notices/raw ----
// Return raw XML (for frontend XML parsing demo)
router.get("/raw", (req, res) => {
  const xmlData = fs.readFileSync(noticesFile, "utf-8");
  res.set("Content-Type", "application/xml");
  res.send(xmlData);
});

module.exports = router;
