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
  const result = await db.query(`SELECT * FROM projects WHERE user_id = $1`, [userId]);
  try{ 
    if (result.rowCount === 0) return 'No projects found for this user.';
    return result.rows;
  } catch (error) { console.error('Error fetching projects:', error);
  throw error;
}};
const createProjects = async (name, description, userId, color) => {
  const result = await db.query(`
    INSERT INTO projects (name, description, user_id, color) VALUES ($1, $2, $3, $4) 
    RETURNING *`, [name, description, userId, color ?? '#6366f1']);

  return result.rows[0];
};
const updateProjects = async (projectId, { name, description, color, status }) => {

  const fields = [];
  const values = [];
  let index = 1; // index++ is post-increment, so it starts at 1 for the first field then increments for the next field, etc.


  if (name)        { fields.push(`name = $${index++}`);        values.push(name); }
  if (description) { fields.push(`description = $${index++}`); values.push(description); }
  if (color)       { fields.push(`color = $${index++}`);       values.push(color); }
  if (status)      { fields.push(`status = $${index++}`);      values.push(status); }

  if (fields.length === 0) throw new Error('No fields to update');

  values.push(projectId); // Add projectId as the last parameter for the WHERE clause

  const update = await db.query(
    `UPDATE projects SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`, values);
  return update.rows[0];
};
  const deleteProjects = async (projectId, userId) => {

    const userRole = await db.query(`SELECT role FROM users WHERE id = $1`, [userId]);
    const owner = await db.query(`SELECT user_id FROM projects WHERE id = $1`, [projectId]);
    
    if (userRole.rows[0].role === 'admin' || owner.rows[0].user_id === userId) {
      const del = await db.query(`DELETE FROM projects WHERE id = $1 RETURNING *`, [projectId]);
      return del.rows[0];
    } else if (!owner.rows[0]) {
        throw new Error('Project not found');}
      else {
      throw new Error('Unauthorized: Only project owner or admin can delete this project.');
    };

  };


   // -------- Tasks ----------
    const getTasks = async (projectId, userId) => {

  const project = await db.query(
    `SELECT * FROM projects WHERE id = $1 AND user_id = $2`, // ownership of the project is required to view its tasks
    [projectId, userId]
  );

  if (!project.rows[0]) throw new Error('Project not found or unauthorized');

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
    else {
        const old = currentTask.rows[0];
    };

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
    const project = await db.query(`SELECT * FROM projects WHERE id = $1 AND user_id = $2`, [projectId, userId]);
    if (!project.rows[0]) throw new Error('Project not found or unauthorized');
    const deleteTask = await db.query(`DELETE FROM tasks WHERE id = $1 AND project_id = $2 RETURNING *`, [taskId, projectId]);
    if (deleteTask.rowCount === 0) throw new Error('Task not found');
    return deleteTask.rows[0];
  };

module.exports = {createUser, loginUser, getUserById, getProjects, createProjects, updateProjects, deleteProjects, getTasks, createTasks, updateTasks, deleteTasks};