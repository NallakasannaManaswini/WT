const express = require('express');
const bodyParser = require('body-parser');
const customerRoutes = require('./routes/customers');
const loanRoutes = require('./routes/loans');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use('/api/v1', customerRoutes);
app.use('/api/v1', loanRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
