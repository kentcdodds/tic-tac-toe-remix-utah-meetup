import { DataFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils";

export async function loader({ request }: DataFunctionArgs) {
  return eventStream(request.signal, function setup(send) {
    let timer = setInterval(() => {
      send({ event: "time", data: new Date().toISOString() });
    }, 1000);

    return function clear() {
      clearInterval(timer);
    };
  });
}
