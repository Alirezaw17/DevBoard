import { Container } from "react-bootstrap";

export default function Footer() {
  return (
    <footer style={{
      background: "#1e1e2e",
      color: "#94a3b8",
      padding: "16px 0",
      textAlign: "center",
      marginTop: "auto",
      fontSize: "0.85rem"
    }}>
      <Container>
        <p className="mb-0">DevBoard © 2026</p>
      </Container>
    </footer>
  );
}