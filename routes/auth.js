var express = require('express');
var router = express.Router();
var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
var GoogleTokenStrategy = require('passport-google-token').Strategy

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

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
    name: profile.name,
    email: profile.email,
    image: profile.picture,
    source: 'google'
  }
  done(null, user)
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

passport.serializeUser((user, done) => {
  done(null, user)
})
passport.deserializeUser((user, done) => {
  done(null, user)
})

const authenticatedOptions = {
  successRedirect: '/auth/success',
  failureRedirect: '/auth/failure'
}

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/google/callback', passport.authenticate('google', authenticatedOptions))
router.post('/google/token', passport.authenticate('google-token', authenticatedOptions))

router.get('/success', (req, res) => {
  res.redirect(`${process.env.CLIENT_ROOT}/#/login`)
})

router.get('/failure', (req, res) => {
  res.redirect(process.env.CLIENT_ROOT)
})

module.exports = router
