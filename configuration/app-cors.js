const whitelist = ['http://localhost:8855', 'http://localhost:3300', 'https://songs.truewordsapp.com']

var cors = {
  baseCors: (req, callback) => {
    var corsOptions;
    const origin = req.header('Origin')
    if (whitelist.indexOf(origin) > -1 || (!origin && req.path.startsWith('/auth'))) {
      callback(null, { origin: true, credentials: true })
    } else {
      console.log(`rejected: ${req.path}`)
      callback(new Error('Not allowed by CORS'))
    }
  }
}

module.exports = cors
