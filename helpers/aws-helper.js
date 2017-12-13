var AWS = require('aws-sdk')

var helper = {}

// FETCHING

helper.loadAllSongs = function () {
  configureDynamoDb()
  var params = {
    TableName: 'Songs'
  }

  var docClient = new AWS.DynamoDB.DocumentClient()
  return new Promise((resolve, reject) => {
    var songs = []
    docClient.scan(params, onScan)

    function onScan(err, data) {
      if (err) {
        const message = `Unable to scan the table. Error JSON: ${JSON.stringify(err, null, 2)}`
        console.error(message)
        reject(message)
      } else {
        data.Items.forEach(song => {
          songs.push(song)
        })

        if (typeof data.LastEvaluatedKey != 'undefined') {
          params.ExclusiveStartKey = data.LastEvaluatedKey
          docClient.scan(params, onScan)
        } else {
          resolve(songs)
        }
      }
    }
  })
}

helper.getSongUrl = function (key) {
  configureS3()
  var s3 = new AWS.S3({apiVersion: '2006-03-01'})
  var params = {Bucket: 'truesongs', Key: key, Expires: 10}
  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', params, (error, url) => {
      error ? reject(error) : resolve(url)
    })
  })
}

helper.streamSong = function (key) {
  configureS3()
  var s3 = new AWS.S3({apiVersion: '2006-03-01'})
  var params = {Bucket: 'truesongs', Key: key}
  return new Promise((resolve, reject) => {
    s3.getObject(params, (error, data) => {
      if (error) {
        console.log('Error loading song')
        console.log(error)
        reject(error)
      } else {
        resolve(data)
      }
    })
  })
}

// WRITING

helper.uploadSongFile = function (fileStream, filename, encoding, mimeType) {
  configureS3()
  var s3 = new AWS.S3({apiVersion: '2006-03-01'})

  const key = `Song-${filename}-${new Date().toISOString()}`
  var params = {
    Bucket: 'truesongs',
    Key: key,
    ContentEncoding: encoding,
    ContentType: mimeType,
    Body: fileStream
  }

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      err ? reject(err) : resolve(key)
    })
  })
}

helper.createSong = function (fields) {
  configureDynamoDb()
  var params = {
    TableName: 'Songs',
    Item: {
      'passage':  fields.passage,
      'artist': fields.artist,
      'book': fields.passage.split('.')[0],
      'bible_version': fields.version,
      'labels': fields.labels,
      'user': fields.user,
      'key': fields.key
    }
  }

  return new Promise((resolve, reject) => {
    var docClient = new AWS.DynamoDB.DocumentClient()
    docClient.put(params, (err, data) => {
      err
      ? reject(`Unable to create, ${fields.passage}. Error JSON: ${JSON.stringify(err, null, 2)}`)
      : resolve(data)
    })
  })
}

// INITIALIZATION

helper.createSongsTable = function () {
  configureDynamoDb()
  var params = {
    TableName : 'Songs',
    KeySchema: [
      { AttributeName: 'passage', KeyType: 'HASH'},
      { AttributeName: 'artist', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'passage', AttributeType: 'S' },
      { AttributeName: 'artist', AttributeType: 'S' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10
    }
  }

  return new Promise((res, rej) => {
    var dynamodb = new AWS.DynamoDB()
    dynamodb.createTable(params, (err, data) => {
      if (err) {
        console.log(err)
        rej(JSON.stringify(err, undefined, 2))
      } else {
        console.log(data)
        res(JSON.stringify(data, undefined, 2))
      }
    })
  })
}

// UTIL

function configureS3 () {
  AWS.config.update({
    region: 'us-east-2',
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET
  })
}

function configureDynamoDb () {
  AWS.config.update({
    region: 'us-west-2',
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET
  })
}

module.exports = helper
