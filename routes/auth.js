var express = require('express')
var router = express.Router()
const bodyParser = require('body-parser')
const cookieSignature = require('cookie-signature')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const GoogleTokenStrategy = require('passport-google-token').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const FacebookTokenStrategy = require('passport-facebook-token')

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET

function buildGoogleUser (accessToken, refreshToken, profile, done) {
  const user = {
    id: `google-${profile.id}`,
    name: profile.displayName,
    email: profile.emails.find(e => e.type === 'account').value,
    image: (profile.photos[0] || {}).value,
    source: 'google'
  }
  done(null, user)
}

function buildGoogleUserFromToken (accessToken, refreshToken, profile, done) {
  const user = {
    id: `google-${profile.id}`,
    name: profile._json.name,
    email: profile._json.email,
    image: profile._json.picture,
    source: 'google'
  }
  done(null, user)
}

function buildFacebookUser (accessToken, refreshToken, profile, done) {
  done(null, {
    id: `facebook-${profile.id}`,
    name: profile.displayName,
    image: (profile.photos[0] || {}).value,
    source: 'facebook'
  })
}

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.HOSTNAME}/auth/google/callback`
}, buildGoogleUser))

passport.use(new GoogleTokenStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.HOSTNAME}/auth/google/callback`
}, buildGoogleUserFromToken))

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.HOSTNAME}/auth/facebook/callback`,
    profileFields: ['id', 'name', 'picture.type(large)', 'emails', 'displayName', 'about', 'gender']
  }, buildFacebookUser))

passport.use(new FacebookTokenStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET
  }, buildFacebookUser))

passport.serializeUser((user, done) => {
  done(null, user)
})
passport.deserializeUser((user, done) => {
  done(null, user)
})

function authenticatedOptions (quiet) {
  return {
    successRedirect: `/auth/success?quiet=${quiet}`,
    failureRedirect: '/auth/failure'
  }
}

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/google/callback', passport.authenticate('google', authenticatedOptions(false)))
router.post('/google/token', passport.authenticate('google-token', authenticatedOptions(true)))

router.get('/facebook', passport.authenticate('facebook'))
router.get('/facebook/callback', passport.authenticate('facebook', authenticatedOptions(false)))
router.post('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    res.json(req.user)
  } else {
    res.status(401).send('Not Facebook Authorized')
  }
})

router.get('/success', (req, res) => {
  if (req.query.quiet === 'true') {
    res.json({authenticated: true})
  } else {
    res.redirect(`${process.env.CLIENT_ROOT}/#/login`)
  }
})

router.get('/failure', (req, res) => {
  res.redirect(process.env.CLIENT_ROOT)
})

module.exports = router
