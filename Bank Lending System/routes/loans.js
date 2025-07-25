const express=require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const {
  calculateInterest,
  calculateTotalAmount,
  calculateEMI
} = require('../helpers/calculator');

const router = express.Router();
router.post('/loans', (req, res) => {
  const { customer_id, loan_amount, loan_period_years, interest_rate_yearly } = req.body;

  const interest = calculateInterest(loan_amount, loan_period_years, interest_rate_yearly);
  const total = calculateTotalAmount(loan_amount, interest);
  const emi = calculateEMI(total, loan_period_years);

  const loan_id = uuidv4();

  db.run(`INSERT INTO Loans (loan_id, customer_id, principal_amount, total_amount, interest_rate, loan_period_years, monthly_emi)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [loan_id, customer_id, loan_amount, total, interest_rate_yearly, loan_period_years, emi],
    (err) => {
      if (err) return res.status(400).json({ error: err.message });

      res.status(201).json({
        loan_id,
        customer_id,
        total_amount_payable: total,
        monthly_emi: emi
      });
    });
});
router.post('/loans/:loan_id/payments', (req, res) => {
  const { loan_id } = req.params;
  const { amount, payment_type } = req.body;
  const payment_id = uuidv4();

  db.get(`SELECT * FROM Loans WHERE loan_id = ?`, [loan_id], (err, loan) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    db.run(`INSERT INTO Payments (payment_id, loan_id, amount, payment_type) VALUES (?, ?, ?, ?)`,
      [payment_id, loan_id, amount, payment_type], (err) => {
        if (err) return res.status(400).json({ error: err.message });

        db.all(`SELECT SUM(amount) as total_paid FROM Payments WHERE loan_id = ?`, [loan_id], (err, rows) => {
          if (err) return res.status(500).json({ error: 'Error calculating payments' });

          const paid = rows[0].total_paid || 0;
          const balance = +(loan.total_amount - paid).toFixed(2);
          const emis_left = Math.ceil(balance / loan.monthly_emi);

          res.status(200).json({
            payment_id,
            loan_id,
            message: "Payment recorded successfully.",
            remaining_balance: balance,
            emis_left
          });
        });
      });
  });
});
router.get('/loans/:loan_id/ledger', (req, res) => {
  const { loan_id } = req.params;

  db.get(`SELECT * FROM Loans WHERE loan_id = ?`, [loan_id], (err, loan) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    db.all(`SELECT * FROM Payments WHERE loan_id = ?`, [loan_id], (err, transactions) => {
      if (err) return res.status(500).json({ error: 'Error fetching transactions' });

      const amount_paid = transactions.reduce((acc, t) => acc + t.amount, 0);
      const balance = +(loan.total_amount - amount_paid).toFixed(2);
      const emis_left = Math.ceil(balance / loan.monthly_emi);

      res.json({
        loan_id,
        customer_id: loan.customer_id,
        principal: loan.principal_amount,
        total_amount: loan.total_amount,
        monthly_emi: loan.monthly_emi,
        amount_paid,
        balance_amount: balance,
        emis_left,
        transactions
      });
    });
  });
});
router.get('/customers/:customer_id/overview', (req, res) => {
  const { customer_id } = req.params;

  db.all(`SELECT * FROM Loans WHERE customer_id = ?`, [customer_id], (err, loans) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (loans.length === 0) return res.status(404).json({ error: 'No loans found' });

    const result = [];
    let processed = 0;

    loans.forEach((loan) => {
      db.all(`SELECT * FROM Payments WHERE loan_id = ?`, [loan.loan_id], (err, payments) => {
        if (err) return res.status(500).json({ error: 'Error fetching payments' });

        const total_paid = payments.reduce((sum, p) => sum + p.amount, 0);
        const interest = loan.total_amount - loan.principal_amount;
        const emis_left = Math.ceil((loan.total_amount - total_paid) / loan.monthly_emi);

        result.push({
          loan_id: loan.loan_id,
          principal: loan.principal_amount,
          total_amount: loan.total_amount,
          total_interest: interest,
          emi_amount: loan.monthly_emi,
          amount_paid: total_paid,
          emis_left
        });

        processed++;
        if (processed === loans.length) {
          res.json({ customer_id, total_loans: loans.length, loans: result });
        }
      });
    });
  });
});

module.exports = router;