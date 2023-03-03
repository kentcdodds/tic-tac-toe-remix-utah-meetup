import { DataFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils";
import { EVENTS, gameEmitter } from "~/games.server";

export async function loader({ request }: DataFunctionArgs) {
  return eventStream(request.signal, function setup(send) {
    function handleNewMove() {
      send({ event: "new-move", data: "" });
    }
    gameEmitter.on(EVENTS.NEW_MOVE, handleNewMove);

    return function clear() {
      gameEmitter.off(EVENTS.NEW_MOVE, handleNewMove);
    };
  });
}
