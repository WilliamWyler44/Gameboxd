import https from 'https';

const options = {
  method: 'GET',
  hostname: 'video-game-news.p.rapidapi.com',
  path: '/all',
  headers: {
    'x-rapidapi-key': '3ec0d35cffmshea515ccb9fd69f6p1b22e5jsn48fe1fe6a537',
    'x-rapidapi-host': 'video-game-news.p.rapidapi.com',
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, function (res) {
  console.log("Status Code:", res.statusCode);
  console.log("Headers:", res.headers);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log("Body:", body);
  });
});

req.on('error', function (error) {
  console.error("Error:", error.message);
});

req.end();
