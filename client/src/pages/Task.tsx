import { Container, Form, Col, Row, Spinner, Modal, Card, Button, CardBody  } from "react-bootstrap"
import type { Taskk } from "../types";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getTasks } from "../api";



export default function Task () {

    const [tasks, setTasks] = useState<Taskk[]>([]);
    const [load, setLoad] = useState(true);

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



    return ( 
        <>
        <Container>
            <div>
                
                <Col>
                    
                    <h2>Manage all the project tasks here</h2>
                </Col>    
                
            </div>
            {load ? (
                <div>
                    <Spinner animation="border" />
                </div>
            ) : tasks.length === 0 ? (
                <Card>
                    <div>
                        <Row>
                            <h1>No tasks</h1>
                            <Button>New Task</Button>
                        </Row>
                    </div>
                </Card>
            ) : (
                
                <>
                {tasks.map((task) => (
    <Card key={task.id}>
        <CardBody>
            <h5>{task.title}</h5>
            <p>{task.description}</p>
        </CardBody>
    </Card>
))}
                
                </>
            ) }
            


        </Container>
        </>
    )
};