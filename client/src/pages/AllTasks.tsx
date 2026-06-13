import { Container, Form, FormGroup, FormLabel, Col, Row, Spinner, Modal, Card, Button, CardBody, FormControl, ModalBody  } from "react-bootstrap"
import type { Taskk } from "../types";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { createTask, getTasks, deleteTask } from "../api";



export default function AllTasks () {

    const [tasks, setTasks] = useState<Taskk[]>([]);
    const [load, setLoad] = useState(true);

    // new task 
    const [showNew, setShowNew] = useState<boolean>(false);
    const [newTitle, setNewTitle] = useState<string>('');
    const [des, setDes] = useState<string>('');
    const [priority, setPriority] = useState<string>('');
    const [due, setDue] = useState<string>('');
    const [newErr, setNewErr] = useState<string>(''); //in case create err
    const [newTaskNoti, setNewTaskNoti] = useState<string>(''); // notify created
    const [task, setTask] = useState<Taskk>(); // the task itslef created

    // delete Task
    const [showDelete, setShowDelete] = useState(false);
    const [deleteNoti, setDeleteNoti] = useState('');
    const [deleteErr, setDeleteErr] = useState('');
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);



    const {pId} = useParams();

    useEffect(() => {
    if (!pId) {
        setLoad(false);
        return;
    }
    getTasks(Number(pId))
        .then(setTasks)
        .catch(console.error)
        .finally(() => setLoad(false)); 
}, [pId]);





// handle new task button
const handleNewTask = async () => { 

    if (!pId) return;
    setNewErr('');
    setNewTaskNoti('');

    try{
    const createdTask = await createTask(Number(pId), {
        title: newTitle, description: des,
        priority: priority, due_date: due
    });
    setTasks((prev) => [createdTask, ...prev]); // task is added to the array of all tasks for pId
    setTask(createdTask); // task state is filled
    setNewTaskNoti('Task successfully added. ');
    setShowNew(false);
    setNewTitle("");
    setDes("");
    setPriority("");
    setDue("");
} catch (err) {
    if (err instanceof Error) {
      setNewErr(err.message); // error of my backend
    } else {
      setNewErr("Failed to create task"); // other reasons, I managed err in backend properly
    }
}};


// delete task by id:
    const handleDeleteTask = async (taskId: number) => {
  if (!pId) return;

  setDeleteErr('');
  setDeleteNoti('');

  try {
    await deleteTask(Number(pId), taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setDeleteNoti('Task deleted successfully');
    setShowDelete(false);
  } catch (err) {
    if (err instanceof Error) {
      setDeleteErr(err.message);
    } else {
      setDeleteErr('Failed to delete task.');
    }
  }
};



    return ( 
        <>
        <Container>
            <div>
                <Row>
                    <Col>
                    <>
                    <h1>All Tasks</h1>
                    <h2>Manage all the project tasks here</h2>
                    </>

                    <Button
                            onClick={() => setShowNew(true)}

                             >
                            New Task
                        </Button>
                    </Col>
                    
                </Row>
            </div>



            {load ? (
                <div>
                    <Spinner animation="border" />
                </div>
            ) : tasks.length === 0 ? (
                <Card>
                    <div>
                        <Row>
                            <h3>No tasks available for this project</h3>
                        </Row>
                    </div>
                </Card>
            ) : (
                
                
                <div>
                {tasks.map((task) => (
                    <Card key={task.id}>
                        <CardBody>
                            <Col>
                            <h5>{task.title}</h5>
                            <p>{task.description}</p>
                            </Col>
                            <Col>
                                <Button>Open</Button>
                                <Button onClick={() => {
                                    setShowDelete(true); setSelectedTaskId(task.id);}} >Delete</Button>
                            </Col>
                        </CardBody>
                    </Card>
                ))}
                </div>
                
            )}



            {/* Conditional RENDER for NEW TASK modal */}
            {showNew && (
            <>
                <Modal show={showNew} onHide={() => setShowNew(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Create Task</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {newErr && (
                            <p>{newErr}</p>
                        )}
                        <Form>
                            <FormGroup>
                                <FormLabel>Task Ttitle</FormLabel>
                                <FormControl
                                type='text'
                                placeholder="Enter task title here"
                                value={newTitle}
                                onChange={(e) => {setNewTitle(e.target.value); setNewErr('');}}
                                />
                            </FormGroup>
                            <FormGroup>
                                <FormLabel>Task Description</FormLabel>
                                <FormControl
                                type='text'
                                placeholder="Enter description for the task"
                                value={des}
                                onChange={(e) => {setDes(e.target.value); setNewErr('');}}
                                />
                            </FormGroup>
                            <FormGroup>
                                <FormLabel>Priority</FormLabel>
                                <FormControl
                                type='text'
                                placeholder="Task priority: low, medium or high"
                                value={priority}
                                onChange={(e) => {setPriority(e.target.value); setNewErr('');}}
                                />
                            </FormGroup>
                            <FormGroup>
                                <FormLabel>Deadline</FormLabel>
                                <FormControl
                                type='date'
                                placeholder="TDetermine the task due date"
                                value={due}
                                onChange={(e) => {setDue(e.target.value); setNewErr('');}}
                                />
                            </FormGroup>
                        </Form>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowNew(false)}>
                        Cancel
                        </Button>
                        <Button 
                            onClick={() => {
                                console.log("clicked");
                                handleNewTask(); //wrote it in a way does not get parameters
                            }}
                        >
                        Create Task
                        </Button>
                    </Modal.Footer>
                    </Modal>
            </>) }


            {/* Delete task modal */}
            {showDelete && (
                <>
                <Modal show={showDelete} onHide={ () => setShowDelete(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Are you sure want to delete the task?</Modal.Title>
                    </Modal.Header>
                    <ModalBody>
                        <Button onClick={() => {setShowDelete(false); setSelectedTaskId(null)}}>Cancel</Button>
                        <Button onClick={()=> {
                            if (selectedTaskId !== null) {handleDeleteTask(selectedTaskId)}}}>Yes</Button>
                    </ModalBody>

                </Modal>
                </>
            )}
        </Container>
        </>
    )
}