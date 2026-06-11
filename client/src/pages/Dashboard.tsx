import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { getDashboardData } from '../api';
import type { ActivityLog, Activity, Projectt } from '../types';

// comes from app for having all projects
interface DashboardProps {
  projects: Projectt[];
};


const log = (model: ActivityLog): Activity => {

  return {
    id: model.id,
    userId: model.user_id,
    action: model.action,
    title: model.entity_name,
    type: model.entity_type,
    time: model.created_at,
  }
};


export default function Dashboard({ projects }: DashboardProps) {

const [activity, setActivity] = useState<Activity[]>([]); // should be activity

 useEffect(() => {
  getDashboardData()
  .then((data) => {
    setActivity(data.map(log))
  })
  }, [])

 function countActiveProjects(projects: Projectt[]) {
  return projects.filter((p) => p.status === 'active').length;
}

const activeProjectsCount = countActiveProjects(projects);

  

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b0b0b',
        padding: '40px 20px',
      }}
    >
      <Container>
        <div style={{ marginBottom: '28px' }}>
          <h1
            style={{
              color: '#f5f5f5',
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              color: '#9a9a9a',
              margin: 0,
              fontSize: '1rem',
            }}
          >
            Overview of your recent work and project activity
          </p>
        </div>

        <Row className="g-4">
          <Col lg={8}>
            <Card
              style={{
                backgroundColor: '#151515',
                border: '1px solid #2a2a2a',
                borderRadius: '18px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.28)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '5px',
                  background: 'linear-gradient(90deg, #b38f1f, #c9a227)',
                }}
              />

              <Card.Body style={{ padding: '28px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        color: '#f5f5f5',
                        marginBottom: '6px',
                        fontWeight: 700,
                      }}
                    >
                      Recent Activity
                    </h3>
                    <p
                      style={{
                        color: '#8f8f8f',
                        margin: 0,
                      }}
                    >
                      Your latest actions in the workspace
                    </p>
                  </div>

                  <Link to="/project" style={{ textDecoration: 'none' }}>
                    <Button
                      style={{
                        backgroundColor: '#c9a227',
                        border: 'none',
                        color: '#111111',
                        fontWeight: 700,
                        padding: '10px 18px',
                        borderRadius: '10px',
                      }}
                    >
                      Go to Projects
                    </Button>
                  </Link>
                                  </div>

                <div>
                  {activity.map((activity) => (
                    <div
                      key={activity.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 0',
                        borderBottom: '1px solid #262626',
                        gap: '16px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <div
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: '#c9a227',
                            flexShrink: 0,
                          }}
                        />

                        <span
                          style={{
                            color: '#eaeaea',
                            fontSize: '0.98rem',
                          }}
                        >
                           {activity.action} titled "{activity.title}"
                        </span>
                      </div>

                      <span
                        style={{
                          color: '#8b8b8b',
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {new Date(activity.time).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card
              style={{
                backgroundColor: '#151515',
                border: '1px solid #2a2a2a',
                borderRadius: '18px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.28)',
                height: '100%',
              }}
            >
              <Card.Body style={{ padding: '28px' }}>
                <h3
                  style={{
                    color: '#f5f5f5',
                    marginBottom: '12px',
                    fontWeight: 700,
                  }}
                >
                  Quick Overview
                </h3>

                <p
                  style={{
                    color: '#8f8f8f',
                    marginBottom: '24px',
                  }}
                >
                  Keep track of your current workspace progress.
                </p>

                <div style={{ marginBottom: '18px' }}>
                  <p style={{ color: '#8f8f8f', marginBottom: '6px' }}>
                    Active Projects 
                  </p>
                  <h2 style={{ color: '#f5f5f5', margin: 0 }}>{activeProjectsCount}</h2>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <p style={{ color: '#8f8f8f', marginBottom: '6px' }}>
                    Open Tasks
                  </p>
                  <h2 style={{ color: '#f5f5f5', margin: 0 }}>11</h2>
                </div>

                <div>
                  <p style={{ color: '#8f8f8f', marginBottom: '6px' }}>
                    Completed This Week
                  </p>
                  <h2 style={{ color: '#c9a227', margin: 0 }}>7</h2>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}