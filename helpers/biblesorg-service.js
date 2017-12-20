const key = 'IklW6N43QDF4FHWLFsks0djEFjAMMEKfLrtghpRu:X'
const baseUrl = `https://${key}@bibles.org/v2/passages.js`

const service = {
  versions: function () {
    const versions = require('./versions/biblesorg.json')
    return versions
  },
  fetch (bibleId, osis) {
    const url = `${baseUrl}?q[]=${osis}&version=${bibleId}`

    return new Promise((resolve, reject) => {
      const request = require('request')
      request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          const data = JSON.parse(body)
          const passages = data.response.search.result.passages
          resolve(passages.find(p => p.version === bibleId))
        } else {
          console.log(error)
          reject(error)
        }
      })
    })
  }
}

module.exports = service
