import { useEffect, useState } from "react";
import type { Project } from "../types";
import { getProjects } from "../api";
import { Container, Row, Col, Card, Badge, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  if (loading) return (
    <Container className="mt-5 text-center">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2 text-muted">Loading projects...</p>
    </Container>
  );

  return (
    <Container className="py-5">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Your Projects</h2>
          <p className="text-muted mb-0">{projects.length} project{projects.length !== 1 ? "s" : ""} total</p>
        </div>
        <button className="btn btn-primary">+ New Project</button>
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize: "3rem" }}>📁</div>
          <h5 className="mt-3">No projects yet</h5>
          <p className="text-muted">Create your first project to get started.</p>
          <button className="btn btn-primary mt-2">Create Project</button>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {projects.map((project) => (
            <Col key={project.id}>
              <Card
                className="h-100 border-0"
                style={{
                  borderRadius: "12px",
                  background: "#1e1e2e",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                  overflow: "hidden",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.6)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.4)";
                }}
              >
                {/* Color bar */}
                <div style={{
                  height: "5px",
                  backgroundColor: project.color || "#6366f1",
                }} />

                <Card.Body className="p-4">

                  {/* Status badge */}
                  <div className="mb-3">
                    <Badge
                      style={{
                        backgroundColor: project.status === "active" ? "#22c55e22" : "#71717a22",
                        color: project.status === "active" ? "#22c55e" : "#a1a1aa",
                        border: `1px solid ${project.status === "active" ? "#22c55e55" : "#71717a55"}`,
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        padding: "4px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      {project.status === "active" ? "● Active" : "● Archived"}
                    </Badge>
                  </div>

                  {/* Name */}
                  <Card.Title
                    className="fw-semibold mb-2"
                    style={{ color: "#f1f5f9", fontSize: "1.1rem" }}
                  >
                    {project.name}
                  </Card.Title>

                  {/* Description */}
                  <Card.Text
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.9rem",
                      lineHeight: "1.5",
                      minHeight: "40px",
                    }}
                  >
                    {project.description || "No description provided."}
                  </Card.Text>

                </Card.Body>

                {/* Footer */}
                <Card.Footer
                  className="px-4 py-3 d-flex justify-content-end"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <Link
                    to={`/projects/${project.id}`}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: project.color || "#6366f1",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "6px 18px",
                      fontWeight: 500,
                      fontSize: "0.85rem",
                    }}
                  >
                    Open →
                  </Link>
                </Card.Footer>

              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}