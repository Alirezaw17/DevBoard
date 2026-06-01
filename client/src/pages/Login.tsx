import { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import { loginUser } from '../api';
import { Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState ('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>):
  Promise<void> => {
    e.preventDefault();
    setError('');

    try {
    await loginUser(email, password);
    navigate('/dashboard');
  } catch (err) {
    if (err instanceof Error) {
      setError(err.message);  // ←  backend error message
    } else {
      setError('Login failed. Please try again.');
    }
  }
};
  

 


  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b0b0b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px'
      }}
    >
      <Container style={{ maxWidth: '520px' }}>
        <Card
          style={{
            backgroundColor: '#151515',
            border: '1px solid #2a2a2a',
            borderRadius: '18px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              height: '5px',
              background: 'linear-gradient(90deg, #b38f1f, #c9a227)'
            }}
          />

          <Card.Body style={{ padding: '32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h2
                style={{
                  color: '#f5f5f5',
                  fontWeight: 700,
                  marginBottom: '8px'
                }}
              >
                Welcome Back
              </h2>

              <p
                style={{
                  color: '#a3a3a3',
                  margin: 0,
                  fontSize: '0.95rem'
                }}
              >
                Log in to continue to your dashboard
              </p>
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="loginEmail">
                <Form.Label
                  style={{
                    color: '#f5f5f5',
                    fontWeight: 600,
                    marginBottom: '8px'
                  }}
                >
                  Email Address
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {setEmail(e.target.value); setError('');}}
                  style={{
                    backgroundColor: '#101010',
                    color: '#f5f5f5',
                    border: '1px solid #2f2f2f',
                    padding: '12px 14px',
                    borderRadius: '10px'
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="loginPassword">
                <Form.Label
                  style={{
                    color: '#f5f5f5',
                    fontWeight: 600,
                    marginBottom: '8px'
                  }}
                >
                  Password
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {setPassword(e.target.value); setError('');}}
                  style={{
                    backgroundColor: '#101010',
                    color: '#f5f5f5',
                    border: '1px solid #2f2f2f',
                    padding: '12px 14px',
                    borderRadius: '10px'
                  }}
                />
              </Form.Group>

              <div className="d-grid">
                <Button
                  type="submit"
                  style={{
                    backgroundColor: '#c9a227',
                    border: 'none',
                    color: '#111111',
                    fontWeight: 700,
                    padding: '12px',
                    borderRadius: '10px'
                  }}
                >
                  Login
                </Button>
              </div>
            </Form>

            <p
              style={{
                color: '#8f8f8f',
                textAlign: 'center',
                marginTop: '20px',
                marginBottom: 0
              }}
            >
              Don’t have an account?{' '}
            <Link
              to="/register"
              style={{
                color: '#c9a227',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Register
            </Link>
            </p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}