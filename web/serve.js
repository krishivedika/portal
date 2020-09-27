// server for prod
const express = require('express');
const app = express();

const PORT = process.env.port || 8080;

app.use(express.static('.'));

app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
