require('dotenv').config() // configures environment variables
const db = require('./models')
const express = require('express')
const axios = require('axios')
const ejsLayouts = require('express-ejs-layouts')
const app = express()
const session = require('express-session')
const passport = require('./config/ppConfig.js')
const flash = require('connect-flash')
const isLoggedIn = require('./middleware/isLoggedIn.js')

// set the view engine to ejs
app.set('view engine', 'ejs')
// tells the app to use ejs layouts
app.use(ejsLayouts)

// body parser middleware (allows us to receive form data in req.body)
app.use(express.urlencoded({extended: false}))

// session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

// passport middleware
app.use(passport.initialize())
app.use(passport.session())

// flash middleware
app.use(flash())

// CUSTOM MIDDLEWARE
app.use((req, res, next) => {
// before every route, attach the flash message and current user to res.locals
    res.locals.alerts = req.flash()
    res.locals.currentUser = req.user
    next() // move on to the next piece of middleware
})

// controller middleware
app.use('/auth', require('./controllers/auth'))

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/build', (req, res) => {
    let starwarsUrl = 'https://swgoh.gg/api/ships'
    axios.get(starwarsUrl).then(apiResponse => {
        let ships = apiResponse.data
        res.render('build', { ships: ships })
    })
})

app.post('/ship', function (req, res) {
    db.ship.findOrCreate({
        where: {
            name: req.body.name,
            power: req.body.power,
            role: req.body.role,
            pic: req.body.pic
        }
    }).then(([ship, wasCreated]) => {
        console.log('This is the new ship')
        db.user.findOne({
            where: {
                id: req.user.id
            }
        })
        .then(user => {
            user.addShip(ship)
            limit: 5
        })
        res.redirect('build')
    })
  })

app.get('/profile', isLoggedIn, (req, res) => {
    // console.log(req.body)
    // console.log(res)
    res.render('profile')
})

app.get('*', (req, res) => {
    res.render('404.ejs')
})

app.listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT}`)
})

// module.exports = server

// User.findAll(
//     {
//       where: {
//         $Tasks$: null,
//       },
//       limit: 3,
//       subQuery: false,
//     })