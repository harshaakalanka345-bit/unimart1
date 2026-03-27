const req = require('http').request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});
req.on('error', console.error);
req.write(JSON.stringify({
  name: "Akalanka Dharmasiri",
  email: "it23837744@sliit.lk",
  password: "Password123",
  faculty: "Faculty of Computing",
  year: 2
}));
req.end();
