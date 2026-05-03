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




module.exports = {createUser, loginUser, getUserById};