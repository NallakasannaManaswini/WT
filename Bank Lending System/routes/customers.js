const express = require('express');
const db = require('../db');

const router = express.Router();
router.post('/customers', (req, res) => {
    const { customer_id, name } = req.body;
    if (!customer_id || !name) {
    return res.status(400).json({ error: 'customer_id and name are required' });
    }

    const query = `INSERT INTO Customers (customer_id, name) VALUES (?, ?)`;

    db.run(query, [customer_id, name], function (err) {
    if (err) {
        return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ customer_id, name, message: "Customer created successfully" });
    });
});

module.exports = router;
