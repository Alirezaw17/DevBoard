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
    const { name, description, color} = req.body;
    const userId = req.session.userId;
    const result = await dao.createProjects(name, description, userId, color);
    if (result) {
        res.status(201).json(result);
    } else {
        res.status(500).json({ error: 'Failed to create project' });
}});

app.patch('/projects/:id', requireAuth, async (req, res) => {
  const projectId = req.params.id;
  const userId = req.session.userId;
  const { name, description, color, status } = req.body;

  try {
    const result = await dao.updateProjects(
      projectId,
      { name, description, color, status },
      userId
    );

    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/projects/:id', requireAuth, async (req, res) => {
    const projectId = req.params.id;
    const userId = req.session.userId;
    const result = await dao.deleteProjects(projectId, userId);
    if (result) {
        res.status(200).json({ message: 'Project deleted successfully' });
    } else {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// _______________________________Tasks Routes___________________________________________

app.get('/projects/:id/tasks', requireAuth, async (req, res) => {
    const projectId = req.params.id;
    const userId = req.session.userId; // added ownership so i have to add userId to dao.getTasks function in dao.js and also in dao.sql file
    try {
         
        const tasks = await dao.getTasks(projectId, userId);
        
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message || 'Something wrong happened!' });
    }
});

app.post('/projects/:id/tasks', requireAuth, async (req, res) => {
    const projectId = req.params.id;
    const { title, description, priority, status, due_date } = req.body;

    try {
        const newTask = await dao.createTasks(projectId, title, description, priority, status, due_date);
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: error.message || 'Something wrong happened!' });
    }
});

app.patch('/projects/:projectId/tasks/:taskId', requireAuth, async (req, res) => {

    const { projectId, taskId } = req.params;
    const body = {title: req.body.title, description: req.body.description,
         priority: req.body.priority, status: req.body.status, due_date: req.body.due_date};

    const validatePriority = ['low', 'medium', 'high'];
    const validateStatus = ['todo', 'in_progress', 'done'];
    
    try {

        if (body.status && !validateStatus.includes(body.status)) {
         return res.status(400).json({ error: 'Invalid status value'})};
        
        if (body.priority && !validatePriority.includes(body.priority)) {
        return res.status(400).json({ error: 'Invalid priority value' });}

        const updatedTask = await dao.updateTasks(projectId, taskId, body);
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: error.message || 'Something wrong happened!' });
    }
});

app.delete('/projects/:projectId/tasks/:taskId', requireAuth, async (req, res) => {
    const { projectId, taskId } = req.params;
    const userId = req.session.userId;
    
    try {
        const deletedTask = await dao.deleteTasks(taskId, projectId, userId);
        res.status(200).json(deletedTask);
    } catch (error) {
        res.status(500).json({ error: error.message || 'Something wrong happened!' });
    }
});

const PORT = 3000;
app.listen(3000, () => {
    console.log(`Server running on port ${PORT}`)
});