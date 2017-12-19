const request = require('request')
const dbtVersions = require('../public/json/dbt_versions.json')

const helper = {
  books () {
    return books.map(b => {
      return [`${b.book_id}`, `${b.book_id} - ${b.book_name}`]
    })
  },
  versions () {
    return dbtVersions
  },
  fetch (damId, osis) {
    const base = 'http://dbt.io/text/verse'
    const key = process.env.DBT_KEY
    const range = osis.split('-')
    const parts = range[0].split('.')
    const book = parts[0]
    const chapter = parts[1]
    const verseStart = parts[2]
    const verseEnd = range.length === 2 ? range[1].split('.')[2] : verseStart
    const url = `${base}?dam_id=${damId}&book_id=${book}&chapter_id=${chapter}&verse_start=${verseStart}&verse_end=${verseEnd}&v=2&key=${key}`

    return new Promise((resolve, reject) => {
      const request = require('request')
      request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(JSON.parse(body))
        } else {
          console.log(body)
          reject(error)
        }
      })
    })
  }
}

function parseChapter (verse) {
  return verse.verse_id === '1' ? `\n[${verse.chapter_id}:` : '['
}

module.exports = helper
