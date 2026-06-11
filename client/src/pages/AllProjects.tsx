import type { Projectt } from "../types";
import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import { Link } from "react-router-dom";
import Form from "react-bootstrap/Form";


import { PlusCircle, Folder2Open, Trash, PencilSquare } from "react-bootstrap-icons";
import { getProjects, deleteProject, updateProject, getProjectById, createProject } from "../api";
import { FormGroup, FormLabel, Row } from "react-bootstrap";

export default function AllProjects() {
  const [projects, setProjects] = useState<Projectt[]>([]);
  const [loading, setLoading] = useState(true);// when projects are fetched, remove the loading by setting false.

  // open project 
  const [openedProjectId, setOpenedProjectId] = useState<number | string | null>(null);
  const [openedProject, setOpenedProject] = useState<Projectt | null>(null);
  const [loadingOpen, setLoadingOpen] = useState(false);

  // edit project
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editError, setEditError] = useState("");
  const [editStatus, setEditStatus] = useState<string>('');

  // create project
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createColor, setCreateColor] = useState("#c9a227");
  const [createError, setCreateError] = useState("");

  useEffect(() => {
  getProjects()
    .then(setProjects)
    .catch((err) => {
      console.error("Failed to fetch projects:", err.message); // real server err
    })
    .finally(() => setLoading(false));
}, []);



  // ── Open project ──────────────────────────────────────────────
  const handleOpenProject = async (id: number) => {
    if (openedProjectId === id) {
      setOpenedProjectId(null);
      setOpenedProject(null);
      return;
    }
    try {
      setLoadingOpen(true);
      setOpenedProjectId(id);
      const project = await getProjectById(id);
      setOpenedProject(project);
    } catch {
      setOpenedProject(null);
      setOpenedProjectId(null);
    } finally {
      setLoadingOpen(false);
    }
  };

  // ── Delete project ────────────────────────────────────────────
  const handleDelete = async (id: number | string) => {
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (openedProjectId === id) {
        setOpenedProjectId(null);
        setOpenedProject(null);
      }
    } catch {
      console.error("Failed to delete project");
    }
  };

  // ── Open edit modal ───────────────────────────────────────────
  const openEditModal = (project: Projectt) => {
    setEditingId(project.id);
    setEditName(project.name ?? "");
    setEditDescription(project.description ?? "");
    setEditColor(project.color ?? "#c9a227");
    setEditError("");
    setShowEdit(true);
    setEditStatus(project.status ?? 'Active')
  };

  // ── Save edit ─────────────────────────────────────────────────
  const handleUpdateProject = async () => {
    if (!editingId) return;
    try {
      setEditError("");
      const updated = await updateProject(editingId, {
        name: editName,
        description: editDescription,
        color: editColor,
        status: editStatus
      });
      setProjects((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...updated } : p))
      );
      if (openedProjectId === editingId) {
        setOpenedProject((prev) => prev ? { ...prev, ...updated } : prev);
      }
      setShowEdit(false);
    } catch {
      setEditError("Failed to update project. Please try again.");
    }
  };

  // ── Create project ────────────────────────────────────────────
  const handleCreateProject = async () => {
    if (!createName.trim()) {
      setCreateError("Project name is required.");
      return;
    }
    try {
      setCreateError("");
      const newProject = await createProject({ name: createName, description: createDescription, color: createColor });
      setProjects((prev) => [newProject, ...prev]);
      setShowCreate(false);
      setCreateName("");
      setCreateDescription("");
      setCreateColor("#c9a227");
    } catch {
      setCreateError("Failed to create project. Please try again.");
    }
  };






  // ── Shared input style ────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    backgroundColor: "#101010",
    color: "#f5f5f5",
    border: "1px solid #2f2f2f",
    padding: "12px 14px",
    borderRadius: "10px",
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: "#151515",
    border: "1px solid #2a2a2a",
    borderRadius: "18px",
    color: "#f5f5f5",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b0b0b", padding: "32px" }}>
      <Container>

        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1 style={{ color: "#f5f5f5", fontWeight: 700, marginBottom: "6px" }}>
              All Projects
            </h1>
            <p style={{ color: "#a3a3a3", margin: 0, fontSize: "0.95rem" }}>
              Browse and manage all your projects
            </p>
          </div>

          <Button
            onClick={() => { setShowCreate(true); setCreateError(""); }}
            style={{
              backgroundColor: "#c9a227",
              border: "none",
              color: "#111111",
              fontWeight: 700,
              padding: "12px 16px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <PlusCircle size={18} />
            Create Project
          </Button>
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "60px" }}>
            <Spinner animation="border" style={{ color: "#c9a227" }} />
          </div>

        ) : projects.length === 0 ? (

          /* ── Empty state ── */
          <Card
            style={{
              backgroundColor: "#151515",
              border: "1px solid #2a2a2a",
              borderRadius: "18px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
              overflow: "hidden",
            }}
          >
            <div style={{ height: "5px", background: "linear-gradient(90deg, #b38f1f, #c9a227)" }} />
            <Card.Body style={{ padding: "40px", textAlign: "center" }}>
              <Folder2Open size={44} color="#c9a227" style={{ marginBottom: "16px" }} />
              <h3 style={{ color: "#f5f5f5", fontWeight: 700, marginBottom: "8px" }}>
                No projects yet
              </h3>
              <p style={{ color: "#8f8f8f", marginBottom: 0 }}>
                Create your first project to get started
              </p>
            </Card.Body>
          </Card>

        ) : (
          <>
            {/* ── Project list ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {projects.map((project) => {
                const color = project.color ?? "#c9a227";
                const isOpen = openedProjectId === project.id;

                return (
                  <Card
                    key={project.id}
                    style={{
                      backgroundColor: "#151515",
                      border: "1px solid #2a2a2a",
                      borderRadius: "18px",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ height: "4px", background: `linear-gradient(90deg, #b38f1f, ${color})` }} />

                    <Card.Body
                      style={{
                        padding: "20px 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        flexWrap: "wrap",
                      }}
                    >
                      {/* dot + name + description */}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: color,
                            boxShadow: `0 0 8px ${color}66`,
                            flexShrink: 0,
                            marginTop: "5px",
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              color: "#f5f5f5",
                              fontWeight: 700,
                              fontSize: "1.1rem",
                              marginBottom: "4px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {project.status === 'Archived' ? '☑️ ' : null}
                            {project.name}
                            
                          </p>
                          <p
                            style={{
                              color: "#8f8f8f",
                              fontWeight: 400,
                              fontSize: "0.9rem",
                              marginBottom: 0,
                              lineHeight: "1.5",
                            }}
                          >
                            {project.description || "No description provided."}
                          </p>
                        </div>
                      </div>

                      {/* action buttons */}
                      <div style={{ display: "flex", gap: "8px", flexShrink: 0, alignItems: "center" }}>
                        <Button
                          onClick={() => openEditModal(project)}
                          style={{
                            backgroundColor: "#1a1a1a",
                            border: "1px solid #333333",
                            color: "#f5f5f5",
                            borderRadius: "10px",
                            padding: "8px 10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PencilSquare size={16} />
                        </Button>

                        <Button
                          onClick={() => handleDelete(project.id)}
                          style={{
                            backgroundColor: "#1a1a1a",
                            border: "1px solid #333333",
                            color: "#f5f5f5",
                            borderRadius: "10px",
                            padding: "8px 10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Trash size={16} />
                        </Button>

                          <Link to={`/projects/${project.id}/tasks`}>
                            <Button
                            style={{
                              backgroundColor: "transparent",
                              border: `1px solid #b38f1f`,
                              color: '#b38f1f',
                              fontWeight: 600,
                              borderRadius: "10px",
                              padding: "8px 20px",
                              whiteSpace: "nowrap",
                            }}
                            >
                            Tasks
                            </Button>
                          </Link>
                        

                        <Button
                          onClick={() => handleOpenProject(project.id)}
                          style={{
                            backgroundColor: isOpen ? '#b38f1f' : "transparent",
                            border: `1px solid #b38f1f`,
                            color: isOpen ? "#111111" : "#b38f1f",
                            fontWeight: 600,
                            borderRadius: "10px",
                            padding: "8px 20px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isOpen ? "Close" : "Open Project"}
                        </Button>
                        
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>

            {/* ── Opened project details ── */}
            {(loadingOpen || openedProject) && (
              <Card
                style={{
                  backgroundColor: "#151515",
                  border: "1px solid #2a2a2a",
                  borderRadius: "18px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                  overflow: "hidden",
                  marginTop: "28px",
                }}
              >
                <div
                  style={{
                    height: "5px",
                    background: `linear-gradient(90deg, #b38f1f, ${openedProject?.color ?? "#c9a227"})`,
                  }}
                />

                <Card.Body style={{ padding: "28px" }}>
                  {loadingOpen ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#f5f5f5" }}>
                      <Spinner animation="border" size="sm" style={{ color: "#c9a227" }} />
                      <span>Loading project...</span>
                    </div>
                  ) : openedProject && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                        <div
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            backgroundColor: openedProject.color ?? "#c9a227",
                            boxShadow: `0 0 8px ${(openedProject.color ?? "#c9a227")}66`,
                            flexShrink: 0,
                          }}
                        />
                        <h2 style={{ color: "#f5f5f5", fontWeight: 700, margin: 0 }}>
                          {openedProject.name}
                        </h2>
                      </div>

                      <p
                        style={{
                          color: "#a3a3a3",
                          fontSize: "1rem",
                          lineHeight: "1.7",
                          marginBottom: "20px",
                        }}
                      >
                        {openedProject.description || "No description provided."}
                      </p>

                      <div
                        style={{
                          backgroundColor: "#101010",
                          border: "1px solid #2a2a2a",
                          borderRadius: "14px",
                          padding: "18px 20px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        {[
                          { label: "ID", value: openedProject.id },
                          { label: "Name", value: openedProject.name },
                          { label: "Color", value: openedProject.color },
                          { label: "Description", value: openedProject.description || "No description provided." },
                          { label: "Status", value: openedProject.status}
                        ].map(({ label, value }) => (
                          <div key={label} style={{ display: "flex", gap: "10px" }}>
                            <span style={{ color: "#f5f5f5", fontWeight: 600, minWidth: "100px" }}>
                              {label}
                            </span>
                            <span style={{ color: "#8f8f8f" }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            )}
          </>
        )}
      </Container>

      {/* ── Edit Modal ── */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <div style={modalContentStyle}>
          <Modal.Header closeButton style={{ borderBottom: "1px solid #2a2a2a", padding: "20px 24px" }}>
            <Modal.Title style={{ color: "#f5f5f5", fontWeight: 700 }}>Edit Project</Modal.Title>
          </Modal.Header>

          <Modal.Body style={{ padding: "24px" }}>
            {editError && (
              <p style={{ color: "#ffb4b4", marginBottom: "16px" }}>{editError}</p>
            )}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: "#f5f5f5", fontWeight: 600 }}>Project Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={inputStyle}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ color: "#f5f5f5", fontWeight: 600 }}>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label style={{ color: "#f5f5f5", fontWeight: 600 }}>Color</Form.Label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Form.Control
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    style={{
                      ...inputStyle,
                      width: "52px",
                      height: "44px",
                      padding: "4px",
                      cursor: "pointer",
                    }}
                  />
                  <Form.Control
                    type="text"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    placeholder="#c9a227"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
              </Form.Group>

              <FormGroup className="mt-3">
  <FormLabel style={{ color: "#f5f5f5", fontWeight: 600 }}>Status</FormLabel>

  <div style={{ display: "flex", gap: "10px" }}>
    <Button
      type="button"
      onClick={() => setEditStatus("Active")}
      active={editStatus === "Active"}
      style={{
        backgroundColor: editStatus === "Active" ? "#c9a227" : "transparent",
        border: "1px solid #c9a227",
        color: editStatus === "Active" ? "#1a1a1a" : "#c9a227",
        fontWeight: 600,
        borderRadius: "10px",
        padding: "8px 18px",
      }}
    >
      Active
    </Button>

    <Button
      type="button"
      onClick={() => setEditStatus("Archived")}
      active={editStatus === "Archived"}
      style={{
        backgroundColor: editStatus === "Archived" ? "#c9a227" : "transparent",
        border: "1px solid #c9a227",
        color: editStatus === "Archived" ? "#1a1a1a" : "#c9a227",
        fontWeight: 600,
        borderRadius: "10px",
        padding: "8px 18px",
      }}
    >
      Archived
    </Button>
  </div>
</FormGroup>
            </Form>
          </Modal.Body>

          <Modal.Footer style={{ borderTop: "1px solid #2a2a2a", padding: "16px 24px" }}>
            <Button
              onClick={() => setShowEdit(false)}
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333333",
                color: "#f5f5f5",
                borderRadius: "10px",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProject}
              style={{
                backgroundColor: "#c9a227",
                border: "none",
                color: "#111111",
                fontWeight: 700,
                borderRadius: "10px",
              }}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* ── Create Modal ── */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <div style={modalContentStyle}>
          <Modal.Header closeButton style={{ borderBottom: "1px solid #2a2a2a", padding: "20px 24px" }}>
            <Modal.Title style={{ color: "#f5f5f5", fontWeight: 700 }}>Create Project</Modal.Title>
          </Modal.Header>

          <Modal.Body style={{ padding: "24px" }}>
            {createError && (
              <p style={{ color: "#ffb4b4", marginBottom: "16px" }}>{createError}</p>
            )}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: "#f5f5f5", fontWeight: 600 }}>Project Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter project name"
                  value={createName}
                  onChange={(e) => { setCreateName(e.target.value); setCreateError(""); }}
                  style={inputStyle}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ color: "#f5f5f5", fontWeight: 600 }}>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Enter project description"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label style={{ color: "#f5f5f5", fontWeight: 600 }}>Color</Form.Label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Form.Control
                    type="color"
                    value={createColor}
                    onChange={(e) => setCreateColor(e.target.value)}
                    style={{
                      ...inputStyle,
                      width: "52px",
                      height: "44px",
                      padding: "4px",
                      cursor: "pointer",
                    }}
                  />
                  <Form.Control
                    type="text"
                    value={createColor}
                    onChange={(e) => setCreateColor(e.target.value)}
                    placeholder="#c9a227"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>

          <Modal.Footer style={{ borderTop: "1px solid #2a2a2a", padding: "16px 24px" }}>
            <Button
              onClick={() => setShowCreate(false)}
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333333",
                color: "#f5f5f5",
                borderRadius: "10px",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              style={{
                backgroundColor: "#c9a227",
                border: "none",
                color: "#111111",
                fontWeight: 700,
                borderRadius: "10px",
              }}
            >
              Create
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </div>
  );
}