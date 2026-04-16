const express = require('express');
const app = express();

const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);

  console.log('x-hub-signature-256:', req.headers['x-hub-signature-256']);
  console.log('Raw body:', req.rawBody);
  console.log('Body:', JSON.stringify(req.body, null, 2));

  res.status(200).end();
});

app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
