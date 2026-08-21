const gplay = require('google-play-scraper');

gplay.app({appId: 'com.bugun.neyemekvar', lang: 'tr', country: 'tr'})
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);
