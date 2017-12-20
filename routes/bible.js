var express = require('express');
var router = express.Router();
const dbtService = require('../helpers/dbt_service.js')
const biblesorgService = require('../helpers/biblesorg-service.js')

router.get('/versions', (req, res, next) => {
  const versions = require('../helpers/versions/versions.json')
  res.json(versions)
})

router.get('/text/:id', (req, res, next) => {
  const parts = req.params.id.split('-')
  if (parts[0] === 'biblesorg') {
    biblesorgService.fetch(req.params.id.substring(10), req.query.osis)
    .then(response => {
      res.json(response)
    })
    .catch(err => {
      console.error(err)
      res.sendStatus(500)
    })
  } else if (parts[0] === 'DBT') {
    dbtService.fetch(parts[1], req.query.osis)
    .then(response => {
      res.json(response)
    })
    .catch(err => {
      console.error(err)
      res.sendStatus(500)
    })
  } else if (parts[0] === 'variant') {
    res.json({text: 'Bible text not currently available'})
  } else {
    res.sendStatus(404)
  }
})

module.exports = router
