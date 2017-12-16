var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
const urlEncodedParser = bodyParser.urlencoded({ extended: true })
const awsHelper = require('../helpers/aws-helper.js')
var fs = require('fs')
var Busboy = require('busboy')
var cors = require('cors')

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'True Songs Server' })
})

router.get('/user', (req, res) => {
  res.json(req.user)
})

router.get('/songs', (req, res, next) => {
  awsHelper.loadAllSongs()
  .then(response => {
    res.json(response)
  })
  .catch(err => { res.json({error: err}) })
})

router.get('/songs/:key', (req, res, next) => {
  awsHelper.getSongUrl(req.params.key)
  .then(data => {
    res.send(data)
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({error: 'unable to get song'})
  })
})

router.delete('/songs', (req, res, next) => {
  if (req.user) {
    awsHelper.deleteSong(req.query.passage, req.query.uploadedAt, req.query.key, req.user.id)
    .then(response => {
      res.json({success: true})
    })
    .catch(err => {
      console.log(err)
      res.sendStatus(500).send('Unable to delete song')
    })
  } else {
    res.sendStatus(401)
  }
})

function createSongRecord (res, fields) {
  awsHelper.createSong(fields)
  .then(response => {
    res.json({data: JSON.stringify(response)})
  })
  .catch(err => {
    res.status(500).json({error: err})
  })
}

router.post('/songs/upload', (req, res, next) => {
  var busboy = new Busboy({ headers: req.headers })
  var parsingFinished = false
  var fields = {}
  var fileCount = 0

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    fileCount++
    awsHelper.uploadSongFile(file, `${req.query.artist}-${fileCount}`, encoding, mimetype)
    .then(key => {
      fields.key = key
      file.resume()
      if (parsingFinished) {
        createSongRecord(res, fields)
      }
    })
    .catch(err => {
      res.send(err)
    })
  })
  busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated) => {
    fields[fieldname] = val
  })
  busboy.on('finish', function() {
    parsingFinished = true
    if (fields.url) {
      createSongRecord(res, fields)
    }
  })
  req.pipe(busboy)
})

// router.get('/db/initialize', (req, res, next) => {
//   awsHelper.createSongsTable()
//   .then(response => {
//     res.json({success: true})
//   })
//   .catch(err => {
//     res.json({error: err})
//   })
// })

// Bible

router.get('/bible/versions', (req, res, next) => {
  const dbtService = require('../helpers/dbt_service.js')
  res.json(dbtService.versions())
})

module.exports = router
