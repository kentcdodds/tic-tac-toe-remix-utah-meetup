import { DataFunctionArgs, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useParams,
  useRevalidator,
} from "@remix-run/react";
import { useEffect } from "react";
import invariant from "tiny-invariant";
import useInterval from "use-interval";
import {
  calculateNextValue,
  calculateStatus,
  calculateWinner,
  EVENTS,
  gameEmitter,
  games,
} from "~/games.server";
import { sessionStorage } from "~/session.server";

export async function loader({ params }: DataFunctionArgs) {
  invariant(typeof params.name === "string", "name should be a string");
  let game = games.get(params.name);
  const session = await sessionStorage.getSession();
  let player = session.get(`player-${params.name}`);
  if (!game) {
    game = { squares: Array(9).fill(null), players: 1 };
    player = "X";
    session.set(`player-${params.name}`, player);
    games.set(params.name, game);
  } else if (game.players === 1 && !player) {
    game = { ...game, players: 2 };
    player = "O";
    session.set(`player-${params.name}`, player);
    games.set(params.name, game);
  }

  const winner = calculateWinner(game.squares);
  const nextValue = calculateNextValue(game.squares);
  const status = calculateStatus(winner, game.squares, nextValue);
  return json(
    {
      squares: game.squares,
      canPlay: game.players === 2,
      isSpectator: !player,
      winner,
      nextValue,
      status,
      player,
    },
    {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    }
  );
}

export async function action({ request, params }: DataFunctionArgs) {
  const formData = await request.formData();
  const squareIndex = formData.get("squareIndex");
  const squareIndexNumber = Number(squareIndex);
  if (isNaN(squareIndexNumber)) {
    throw new Error("Invalid squareIndex");
  }
  invariant(typeof params.name === "string", "name should be a string");
  const game = games.get(params.name);
  const session = await sessionStorage.getSession();
  let player = session.get(`player-${params.name}`);
  if (!player) {
    throw new Response("You are not a player in this game", { status: 403 });
  }
  if (!game) {
    throw new Response("Game not found", { status: 404 });
  }
  const winner = calculateWinner(game.squares);
  if (winner || game.squares[squareIndexNumber]) {
    throw new Response("Invalid move", { status: 400 });
  }

  const newSquares = [...game.squares];
  const nextValue = calculateNextValue(game.squares);
  if (nextValue !== player) {
    throw new Response("Invalid move", { status: 400 });
  }
  newSquares[squareIndexNumber] = nextValue;
  games.set(params.name, { ...game, squares: newSquares });
  gameEmitter.emit(EVENTS.NEW_MOVE);
  return redirect(`/game/${params.name}`);
}

export default function Game() {
  const { squares, player, canPlay, isSpectator, status } =
    useLoaderData<typeof loader>();
  const params = useParams();

  const { revalidate } = useRevalidator();

  useEffect(() => {
    const eventSource = new EventSource(`/games/${params.name}/sub`);
    eventSource.addEventListener("NEW_MOVE", handler);

    function handler(event: MessageEvent) {
      revalidate();
    }

    return () => {
      eventSource.removeEventListener("NEW_MOVE", handler);
      eventSource.close();
    };
  }, []);

  function renderSquare(i: number) {
    return (
      <Form method="post">
        <button className="square" name="squareIndex" value={i}>
          {squares[i]}
        </button>
      </Form>
    );
  }

  return (
    <div>
      <p>{canPlay ? "Let's play!" : "Waiting for someone to join"}</p>
      {isSpectator ? <p>You are a spectator</p> : <p>You are {player}</p>}
      <div className="status">{status}</div>
      <div className="board-row">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="board-row">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="board-row">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </div>
  );
}
