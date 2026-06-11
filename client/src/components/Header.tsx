import { Link } from "react-router-dom";
import { Navbar, Container, Nav } from "react-bootstrap";
import { getUserById } from "../api";
import { useEffect, useState } from "react";
import type { User } from "../types";



export default function Header() {

  const [user, setUser] = useState<User>();

  useEffect(()=> {
    getUserById()
    .then((data) => {
      setUser(data)
    })
  }, [])

  return (
    <Navbar bg="dark" variant="dark" sticky="top">
      <Container>
        <Navbar.Brand href="/dashboard">Welcome {user?.display_name}</Navbar.Brand>
        <Nav className="ms-auto">
          <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};