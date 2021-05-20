const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
require('dotenv').config()

const TWO_HOURS = 1000 * 60 * 60 * 2 // in ms -> 2h

const {
    PORT = 3000,
    NODE_ENV = 'dev',
    
    SESS_NAME = 'sid',
    SESS_SECRET = 'ssh!secretyKey',
    SESS_LIFETIME = TWO_HOURS
} = process.env

const IN_PROD = NODE_ENV === 'prod'

const users = [
    {id: 1, name: 'Hoon', email: 'hoon@gmail.com', password: 'secret'},
    {id: 2, name: 'Zoon', email: 'zoon@gmail.com', password: 'secret'},
    {id: 3, name: 'Qoon', email: 'qoon@gmail.com', password: 'secret'}
]

const app = express()

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD
    }
}))

app.get('/', (req, res) => {

    // put userId if authenticated (checks if session has userId)
    //const { userId } = req.session
    
    userId = 1;

    res.send(`
    <h1>Welcome!</h1>
    ${userId? `
    <a href='/dashboard'>Dashboard</a>
    <form method='post' action='/logout'>
        <button>Logout</button>
    </form>
    ` : `
    <a href='/login'>Login</a>
    <a href='/register'>Register</a>
    `}
    `)
})

// middleware functions 
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/login')
    } else {
        next()
    }
}

const redirectDashboard = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/dashboard')
    } else {
        next()
    }
}

app.get('/dashboard', redirectLogin, (req, res) => {
    res.send(`
    <h1>Dashboard</h1>
    <a href='/'>Main</a>
    <ul>
        <li>Name: </li>
        <li>Email: </li>
    </ul>
    
    `)
})

app.get('/login', redirectDashboard, (req, res) => {
    res.send(`
    <h1>Login</h1>
    <form method='post' action='/login'>
        <input type='email' name='email' placeholder='Email' required />
        <input type='password' name='password' placeholder='Password' required />
        <input type='submit' />
    </form>
    <a href='/register'>Register</a>
    `) 
})

app.get('/register', redirectDashboard, (req, res) => {
    res.send(`
    <h1>Register</h1>
    <form method='post' action='/register'>
        <input name='name' placeholder='Name' required />
        <input type='email' name='email' placeholder='Email' required />
        <input type='password' name='password' placeholder='Password' required />
        <input type='submit' />
    </form>
    <a href='/login'>Login</a>
    `) 
})

app.post('/login', redirectDashboard, (req, res) => {
    const { email, password } = req.body
    if (email && password) { //TODO: regex and compare hash password
        const user = users.find(user => user.email === email && user.password === password)
        if (user) {
            req.session.userId = user.id
            return res.redirect('/dashboard')
        }
    }
    res.redirect('/login')
})

app.post('/register', redirectDashboard, (req, res) => {
    const { name, email, password } = req.body
    if (name && email && password) {
        const exists = users.some(
            user => user.email === email
        )

        if (!exists) {
            const user = {
                id: users.length + 1,
                name,
                email,
                password
            }
            users.push(user)
            req.session.userId = user.id
            return res.redirect('/dashboard')
        } 
    }

    res.redirect('/register') // TODO: /register?error=error.auth.userExists
})

app.post('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard')
        }
        res.clearCoockie(SESS_NAME)
        res.redirect('/login')
    })
})


app.listen(PORT, () => console.log(`http://localhost:${PORT}`))