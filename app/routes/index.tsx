import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to Tic-Remix-Toe</h1>
      <Link to="/start">Start game</Link>
    </div>
  );
}
