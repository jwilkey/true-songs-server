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
  fetch (bookId, chapter) {
    const base = 'https://dbt.io/text/verse'
    const key = process.env.DBT_KEY
    const url = `${base}?dam_id=GRKEPTN1ET&book_id=${bookId}&v=2&key=${key}`

    return axios.get(url)
    .then(response => {
      const text = response.data
      .map(verse => {
        const chapter = parseChapter(verse)
        return `${chapter}${verse.verse_id}] ${verse.verse_text.replace(' \n\t\t\t', '')}`
      }).join(' ')

      const words = text.split(/(\s)/g).map(word => {
        return word === '\n'
        ? {word, status: 'break'}
        : {word, status: ''}
      })

      return words
    })
  }
}

function parseChapter (verse) {
  return verse.verse_id === '1' ? `\n[${verse.chapter_id}:` : '['
}

module.exports = helper
