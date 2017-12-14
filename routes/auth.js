var express = require('express');
var router = express.Router();

var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

passport.use(
  new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.HOSTNAME}/auth/google/callback`
  },
  (accessToken, refreshToken, profile, done) => {
    const user = {
      id: `google-${profile.id}`,
      name: profile.displayName,
      email: profile.emails.find(e => e.type === 'account').value,
      image: (profile.photos[0] || {}).value,
      source: 'google'
    }
    done(null, user)
  }
))
passport.serializeUser((user, done) => {
  done(null, user)
})
passport.deserializeUser((user, done) => {
  done(null, user)
})

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/auth/success',
  failureRedirect: '/auth/failure'
}))

router.get('/success', (req, res) => {
  res.redirect(`${process.env.CLIENT_ROOT}/#/login`);
})

router.get('/failure', (req, res) => {
  res.redirect(process.env.CLIENT_ROOT);
})

module.exports = router;
