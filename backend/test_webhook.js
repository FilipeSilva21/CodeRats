const crypto = require('crypto');

const secret = 'devrats-webhook-secret';
const payload = {
  ref: 'refs/heads/main',
  repository: {
    id: 12345,
    name: 'CodeRats',
    full_name: 'FilipeSilva21/CodeRats',
    private: false
  },
  sender: {
    id: 12345,
    login: 'FilipeSilva21',
    avatar_url: 'https://example.com/avatar.png'
  },
  commits: [
    {
      id: 'abcdef1234567890',
      message: 'test commit',
      timestamp: '2026-05-07T12:00:00Z',
      added: [],
      removed: [],
      modified: ['README.md']
    }
  ]
};

const body = JSON.stringify(payload);
const hmac = crypto.createHmac('sha256', secret);
const signature = 'sha256=' + hmac.update(body).digest('hex');

fetch('http://localhost:8080/api/webhooks/github', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-GitHub-Event': 'push',
    'X-Hub-Signature-256': signature
  },
  body: body
})
.then(res => res.text().then(text => ({ status: res.status, text })))
.then(console.log)
.catch(console.error);
