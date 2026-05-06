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
  

const createProjects = async (name, description, userId) => {
  const result = await db.query(`
    INSERT INTO projects (name, description, user_id) VALUES ($1, $2, $3) 
    RETURNING *`, [name, description, userId]);

  return result.rows[0];
};

const updateProjects = async (projectId, name, description) => {  
  const update = await db.query(`
    UPDATE projects SET name = $1, description = $2 WHERE id = $3 
    RETURNING *`, [name, description, projectId]);
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

module.exports = {createUser, loginUser, getUserById, getProjects, createProjects, updateProjects, deleteProjects};