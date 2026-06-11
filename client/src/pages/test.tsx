import type { Projectt } from "../types";
import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import {
  PlusCircle,
  Folder2Open,
  Trash,
  PencilSquare,
} from "react-bootstrap-icons";
import {
  getProjects,
  deleteProject,
  updateProject,
  getProjectById,
} from "../api";

export default function AllProjects() {
  const [projects, setProjects] = useState<Projectt[]>([]);
  const [loading, setLoading] = useState(true);

  const [openedProjectId, setOpenedProjectId] = useState<number | string | null>(null);
  const [openedProject, setOpenedProject] = useState<Projectt | null>(null);
  const [loadingOpen, setLoadingOpen] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editError, setEditError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createColor, setCreateColor] = useState("#c9a227");
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch((err) => {
        console.error("Failed to fetch projects:", err.message);
      })
      .finally(() => setLoading(false));
  }, []);

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
      setOpenedProject(project); // openedProject = project
    } catch {
      setOpenedProject(null);
      setOpenedProjectId(null);
    } finally {
      setLoadingOpen(false);
    }
  };

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

  const openEditModal = (project: Projectt) => {
    setEditingId(project.id);
    setEditName(project.name ?? "");
    setEditDescription(project.description ?? "");
    setEditColor(project.color ?? "#c9a227");
    setEditError("");
    setShowEdit(true);
  };

  const handleUpdateProject = async () => {
    if (!editingId) return;

    try {
      setEditError("");

      const updated = await updateProject(editingId, {
        name: editName,
        description: editDescription,
        color: editColor,
      });

      setProjects((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...updated } : p))
      );

      if (openedProjectId === editingId) {
        setOpenedProject((prev) => (prev ? { ...prev, ...updated } : prev));
      }

      setShowEdit(false);
    } catch {
      setEditError("Failed to update project. Please try again.");
    }
  };

  const handleCreateProject = async () => {
    if (!createName.trim()) {
      setCreateError("Project name is required.");
      return;
    }

    try {
      setCreateError("");

      // const newProject = await createProject({
      //   name: createName,
      //   description: createDescription,
      //   color: createColor,
      // });

      // setProjects((prev) => [newProject, ...prev]);

      setShowCreate(false);
      setCreateName("");
      setCreateDescription("");
      setCreateColor("#c9a227");
    } catch {
      setCreateError("Failed to create project. Please try again.");
    }
  };

  return (
    <Container>
      <div>
        <h1>All Projects</h1>
        <p>Browse and manage all your projects</p>
        <Button onClick={() => { setShowCreate(true); setCreateError(""); }}>
          <PlusCircle /> Create Project
        </Button>
      </div>

      {loading ? (
        <Spinner animation="border" />
      ) : projects.length === 0 ? (
        <Card>
          <Card.Body>
            <Folder2Open />
            <h3>No projects yet</h3>
            <p>Create your first project to get started</p>
          </Card.Body>
        </Card>
      ) : (
        <>
          <div>
            {projects.map((project) => {
              const isOpen = openedProjectId === project.id;

              return (
                <Card key={project.id}>
                  <Card.Body>
                    <div>
                      <p>{project.name}</p>
                      <p>{project.description || "No description provided."}</p>
                    </div>

                    <div>
                      <Button onClick={() => openEditModal(project)}>
                        <PencilSquare />
                      </Button>

                      <Button onClick={() => handleDelete(project.id)}>
                        <Trash />
                      </Button>

                      <Button onClick={() => handleOpenProject(Number(project.id))}>
                        {isOpen ? "Close" : "Open Project"}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </div>


          {/* Open project card */}
          {(loadingOpen || openedProject) && (
            <Card>
              <Card.Body>
                {loadingOpen ? (
                  <div>
                    <Spinner animation="border" size="sm" />
                    <span>Loading project...</span>
                  </div>
                ) : openedProject && (
                  <>
                    <h2>{openedProject.name}</h2>
                    <p>{openedProject.description || "No description provided."}</p>

                    <div>
                      <div>
                        <strong>ID:</strong> {openedProject.id}
                      </div>
                      <div>
                        <strong>Name:</strong> {openedProject.name}
                      </div>
                      <div>
                        <strong>Color:</strong> {openedProject.color}
                      </div>
                      <div>
                        <strong>Description:</strong>{" "}
                        {openedProject.description || "No description provided."}
                      </div>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          )}
        </>
      )}


      {/* Edit Project modal --------------------------------------------- */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Project</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {editError && <p>{editError}</p>}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Color</Form.Label>
              <Form.Control
                type="color"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => setShowEdit(false)}>Cancel</Button>
          <Button onClick={handleUpdateProject}>Save Changes</Button>
        </Modal.Footer>
      </Modal>


      {/* Create Project modal ------------------------------------------*/}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Project</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {createError && <p>{createError}</p>}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter project name"
                value={createName}
                onChange={(e) => {
                  setCreateName(e.target.value);
                  setCreateError("");
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Enter project description"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Color</Form.Label>
              <Form.Control
                type="color"
                value={createColor}
                onChange={(e) => setCreateColor(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button onClick={handleCreateProject}>Create</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}