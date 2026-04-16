const express = require('express');
const crypto = require('crypto');
const app = express();

const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;
const appSecret = process.env.APP_SECRET; // '1234zxcv!'

// Middleware para capturar raw body
app.use((req, res, next) => {
  let rawBody = '';
  req.on('data', chunk => {
    rawBody += chunk.toString('utf8');
  });
  req.on('end', () => {
    req.rawBody = rawBody;
    next();
  });
});

// Después del raw body middleware, parsear JSON normalmente
app.use(express.json());

// Route GET
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route POST
app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);

  // Verificar firma con raw body
  const signature = req.headers['x-hub-signature-256'];
  if (signature && appSecret) {
    const expectedSig = 'sha256=' + crypto
      .createHmac('sha256', appSecret)
      .update(req.rawBody, 'utf8')
      .digest('hex');

    console.log('Signature received: ', signature);
    console.log('Signature expected: ', expectedSig);
    console.log('Match:', signature === expectedSig);
  }

  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));

  res.status(200).end();
});

app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
