type Player = "X" | "O";
export type Squares = Array<Player | null>;

declare global {
  var __games__: Map<string, { squares: Squares; players: number }>;
}

export const games = (global.__games__ =
  global.__games__ ?? new Map<string, { squares: Squares; players: number }>());

export function calculateStatus(
  winner: null | string,
  squares: Squares,
  nextValue: Player
) {
  return winner
    ? `Winner: ${winner}`
    : squares.every(Boolean)
    ? `Scratch: Cat's game`
    : `Next player: ${nextValue}`;
}

export function calculateNextValue(squares: Squares): Player {
  const xSquaresCount = squares.filter((r) => r === "X").length;
  const oSquaresCount = squares.filter((r) => r === "O").length;
  return oSquaresCount === xSquaresCount ? "X" : "O";
}

export function calculateWinner(squares: Squares): Player | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const [a, b, c] = line;
    if (a === undefined || b === undefined || c === undefined) continue;

    const player = squares[a];
    if (player && player === squares[b] && player === squares[c]) {
      return player;
    }
  }
  return null;
}
