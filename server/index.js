require('dotenv').config(); // -> to use cors and secret_key in session we need it in index.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dao = require('./dao.js');
//const helmet = require('helmet');         
const { RedisStore } = require('connect-redis');  
const redisClient = require('./redis.js');   
const requireAuth = require('./requireAuth.js');


const corsOption = {
    origin: process.env.CLIENT_URL,
    credentials: true
};





// ___________________________Start the application____________________________________

const app = express();

//__________middlewares



app.use(express.json());
app.use(cors(corsOption));

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,       // false = HTTP (local dev)
    sameSite: 'lax',     // works for same-origin; change to 'none' in production
    maxAge: 1000 * 60 * 60 * 24  // 24 hours
  }
}));



// ________________________________Auth Routes_____________________________________

app.post('/auth/register', async (req, res) => {
    try {
        const {email, password, display_name} = req.body;
        const user = await dao.createUser(email, password, display_name);
        req.session.userId = user.id;
        res.status(201).json(user);
        console.log(req.session);
        
    } catch (err) {
        if (err.code == '23505') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        res.status(500).json({err: 'Server error, user was not registered!'})
    }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await dao.loginUser(email, password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

 req.session.regenerate((err) => {       // ← generates new session ID
    if (err) return res.status(500).json({ error: 'Server error' });
    req.session.userId = user.id;
    res.status(200).json(user);
  });
});

app.post('/auth/logout', async (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'Logout failed' }); // ← add return
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

app.get('/session', (req, res) => {
    res.json(req.session);
    console.log(req.session);
}); //to see the session route one must login and visit session afterward in the same browser not another one.

app.get('/auth/me', requireAuth, async (req, res) => {
  const user = await dao.getUserById(req.session.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
}); 
//GET /auth/me answers "is this cookie still valid, and who does it belong to?"
// when use requireAuth -> if (!req.session.userId) is gone.





//_______________________________Projects Routes___________________________________________

app.get('/projects', requireAuth, async (req, res) => {
    const userId = req.session.userId;
    const projects = await dao.getProjects(userId);

    if (projects){res.status(200).json(projects);}
    else {res.status(500).json({ error: 'Failed to fetch projects' });
}
});

app.post('/projects', requireAuth, async (req, res) => {
    const { name, description } = req.body;
    const userId = req.session.userId;
    const result = await dao.createProjects(name, description, userId);
    if (result) {
        res.status(201).json(result);
    } else {
        res.status(500).json({ error: 'Failed to create project' });
    }});


const PORT = 3000;
app.listen(3000, () => {
    console.log(`Server running on port ${PORT}`)
});