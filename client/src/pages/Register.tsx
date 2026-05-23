import { useState, type SubmitEvent } from 'react'; // form event type is deprecated, use SubmitEvent instead
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();



  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
      setError(''); // clear previous error before new attempt
      
    try {
      await registerUser({ email, password, display_name: displayName });
      navigate('/login');
    } catch (err) { //actual backend error message instead of a generic one
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError('Failed to register user');
  }
}}; 

// TypeScript treats caught errors as unknown, so narrowing with instanceof
//  Error is the safe pattern.

  return (
    <div>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Display Name</label>
          <br />
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div>
          <label>Email</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Password</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;


