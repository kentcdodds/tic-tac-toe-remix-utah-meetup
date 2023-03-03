import { Outlet } from "@remix-run/react";

export default function Game() {
  return (
    <div>
      <h1>Game</h1>
      {/* <meta httpEquiv="refresh" content="2" /> */}
      <Outlet />
    </div>
  );
}
