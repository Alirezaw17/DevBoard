import { registerUser } from '../api';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await registerUser({
        email,
        password,
        displayName
      });
    } catch (error) {
      console.error(error);
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
                Create Account
              </h2>

              <p
                style={{
                  color: '#a3a3a3',
                  margin: 0,
                  fontSize: '0.95rem'
                }}
              >
                Join and start managing your work in one place
              </p>
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="registerEmail">
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
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    backgroundColor: '#101010',
                    color: '#f5f5f5',
                    border: '1px solid #2f2f2f',
                    padding: '12px 14px',
                    borderRadius: '10px'
                  }}
                />
                <Form.Text style={{ color: '#8f8f8f' }}>
                  We’ll never share your email with anyone else.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3" controlId="registerPassword">
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
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    backgroundColor: '#101010',
                    color: '#f5f5f5',
                    border: '1px solid #2f2f2f',
                    padding: '12px 14px',
                    borderRadius: '10px'
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="registerDisplayName">
                <Form.Label
                  style={{
                    color: '#f5f5f5',
                    fontWeight: 600,
                    marginBottom: '8px'
                  }}
                >
                  Display Name
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
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
                  Register
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
              Already have an account?{' '}
              <span
                style={{
                  color: '#c9a227',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Login
              </span>
            </p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}