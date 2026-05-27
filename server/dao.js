const db = require('./db.js');
const bcrypt = require('bcrypt');


const createUser = async (email, password, display_name) => {
    
const countResult = await db.query(`SELECT COUNT(*) FROM users `);
const count = parseInt(countResult.rows[0].count);
const role = count === 0 ? 'admin' : 'member';

const hashedPassword = await bcrypt.hash(password, 12);

    const query = await db.query(`
    INSERT INTO users (email, password_hash, display_name, role) VALUES ($1, $2, $3, $4) 
    returning id, email, display_name, role`, [email, hashedPassword, display_name, role])

    return query.rows[0];
};
const loginUser = async (email, password) => {
    
    const result = await db.query(`SELECT * FROM users WHERE email=$1`, [email]);
    const user = result.rows[0];

    if (!user) return null; // ← email not found

    //compare passwords:
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return null
    return user;
};
const getUserById = async (id) => {
  const result = await db.query(
    'SELECT id, email, display_name FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};



 // -------- Projects ----------

 const getProjects = async (userId) => {
  try {
    const role = await db.query(`SELECT role FROM users WHERE id = $1`, [userId]);
    const isAdmin = role.rows[0]?.role === 'admin';

    if (isAdmin) {
      const result = await db.query(`SELECT * FROM projects`);
      return result.rows; // [] if empty
    } else {
      const result = await db.query(
        `SELECT * FROM projects WHERE user_id = $1`, [userId]
      );
      return result.rows; // [] if empty
    }

  } catch (err) {
    throw new Error('Error fetching projects');
  }
};
// better way to maanage as a real projet is to use three layers: 
// route -> service -> dao

const getProjectById = async (projectId) => {
  const result = await db.query(
    `SELECT * FROM projects WHERE id = $1`,
    [projectId]
  );
  return result.rows[0] || null;
};


const createProjects = async (name, description, userId, color) => {
  const client = await db.connect(); // gets a dedicated client for the transaction

  // wrap two queries in a transaction, if one fails the other rollback.
  // begin commit wraps queries automatically.
  // ROLLBACK undoes everything if either query fails
  // client.release() returns the connection to the pool no matter what
  try {
    await client.query('BEGIN');

    const result = await client.query(`
      INSERT INTO projects (name, description, user_id, color) 
      VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description, userId, color ?? '#6366f1']
    );

    await client.query(`
      INSERT INTO activity_log (user_id, action, entity_type, entity_name, project_name)
      VALUES ($1, $2, $3, $4, $5)`,
      [userId, 'Created a Project', 'project', name, name]
    );

    await client.query('COMMIT');
    return result.rows[0];

  } catch (err) {
    await client.query('ROLLBACK'); // undo everything if anything fails
    throw err;
  } finally {
    client.release(); // always return connection to pool
  }
};
const updateProjects = async (projectId, { name, description, color, status}, userId) => {


  const fields = [];
  const values = [];
  let index = 1; // index++ is post-increment, so it starts at 1 for the first field then increments for the next field, etc.


  if (name)        { fields.push(`name = $${index++}`);        values.push(name); }
  if (description) { fields.push(`description = $${index++}`); values.push(description); }
  if (color)       { fields.push(`color = $${index++}`);       values.push(color); }
  if (status)      { fields.push(`status = $${index++}`);      values.push(status); }

  if (fields.length === 0) throw new Error('No fields to update');

  values.push(projectId); // Add projectId as the last parameter for the WHERE clause

    // check ownership 
    const ownership = await db.query(`SELECT id
       FROM projects WHERE user_id = $1 and id = $2`, [userId, projectId]);

    if(!ownership.rows[0]) {
      throw new Error('Unauthorized');
    };
  
    const client = await db.connect();

  try {
    await client.query('BEGIN');

  const update = await client.query(
    `UPDATE projects SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`, values);

    if (update.rowCount === 0) {
      throw new Error('Project not found');
    }

    // inert into activity log:
    await client.query(`INSERT INTO activity_log (user_id, action, entity_type, entity_name, project_name)
    VALUES ($1, $2, $3, $4, $5)`,
    [update.rows[0].user_id, 'Updated a Project', 'project', update.rows[0].name, update.rows[0].name]
  );
    await client.query('COMMIT');
    return update.rows[0]; 
} catch (err) {
    await client.query('ROLLBACK'); // undo everything if anything fails
    throw err;
  } finally {
    client.release(); // always return connection to pool
  }
};
  const deleteProjects = async (projectId, userId) => {

    const client = await db.connect();

    try {
      await client.query('BEGIN');

    const userRole = await client.query(`SELECT role FROM users WHERE id = $1`, [userId]);
    const owner = await client.query(`SELECT user_id FROM projects WHERE id = $1`, [projectId]);
    
   if (!owner.rows[0]) throw new Error('Project not found');

  if (userRole.rows[0].role !== 'admin' && owner.rows[0].user_id !== userId) throw new Error('Unauthorized');

  const del = await client.query(`DELETE FROM projects WHERE id = $1 RETURNING *`, [projectId]);

  const activityLog = await client.query(`INSERT INTO activity_log (user_id, action, entity_type, entity_name, project_name)
  VALUES ($1, $2, $3, $4, $5)`,
  [userId, 'Deleted a Project', 'project', del.rows[0].name, del.rows[0].name]
);
  await client.query('COMMIT');
  return del.rows[0];
} catch (err) {
    await client.query('ROLLBACK'); 
    throw err;
} finally {
    client.release();
}
};


   // -------- Tasks ----------
    const getTasks = async (projectId, userId) => {

  const project = await db.query(
    `SELECT * FROM projects WHERE id = $1 AND user_id = $2`, // ownership of the project is required to view its tasks
    [projectId, userId]
  );

  if (!project.rows[0]) throw new Error('unauthorized');

  const tasks = await db.query(
    `SELECT * FROM tasks WHERE project_id = $1`,
    [projectId]  //  
  );

  if (tasks.rowCount === 0) throw new Error('No tasks found for the project');

  return tasks.rows;
};
  const createTasks = async (projectId, title, description, priority, status, due_date) => {
    const newTask = await db.query(`INSERT INTO tasks (project_id, title, description, priority, status, due_date) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
       [projectId, title, description, priority ?? 'medium', status ?? "todo", due_date ?? null]);
       return newTask.rows[0];

};
  const updateTasks = async (projectId, taskId, body) => {
    
    // fetch current task first:
    const currentTask = await db.query(`SELECT * FROM tasks WHERE id = $1 AND project_id = $2`, [taskId, projectId]);
    if (currentTask.rowCount === 0) throw new Error('Task not found');
    const old = currentTask.rows[0];  // ← declare outside

    // use new value if sent, otherwise use old value:
    const title = body.title ?? old.title;
    const description = body.description ?? old.description;
    const priority = body.priority ?? old.priority;
    const status = body.status ?? old.status;
    const due_date = body.due_date ?? old.due_date; 

    const result = await db.query(`UPDATE tasks SET title = $1, description = $2, priority = $3, status = $4, due_date = $5
  `+`WHERE id = $6 AND project_id = $7 RETURNING *`, 
  [title, description, priority, status, due_date, taskId, projectId]);
  return result.rows[0];
};
  const deleteTasks = async (taskId, projectId, userId) => {

    const isAuthorized = await db.query(`SELECT role FROM users WHERE id = $1`, [userId]);
    const isAdmin = isAuthorized.rows[0]?.role === 'admin'; // With ?.  — returns undefined instead of crashing

      // If not admin, verify project ownership
    if (!isAdmin) {
      const project = await db.query(
      `SELECT * FROM projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    );
    if (!project.rows[0]) throw new Error('Project not found or unauthorized');
  };

    // Both admin and owner reach here -> admin is checked first, but normal user reaches normally and is checked for ownership, so both can delete the task if they have the right permissions.
    const deleteTask = await db.query(
    `DELETE FROM tasks WHERE id = $1 AND project_id = $2 RETURNING *`,
    [taskId, projectId]
  );
  
  if (deleteTask.rowCount === 0) throw new Error('Task not found');
  return deleteTask.rows[0];
};









  //----------------------------- DASHBOARD AND USERS -----------------------------

  const getSummsById = async (userId) => {
    const summery = await db.query(`SELECT * FROM activity_log WHERE user_id = $1`, [userId]);
    return summery.rows;
  };

module.exports = {createUser, loginUser, getUserById, getProjects, createProjects, updateProjects, deleteProjects, getTasks, createTasks, updateTasks, deleteTasks, getSummsById};