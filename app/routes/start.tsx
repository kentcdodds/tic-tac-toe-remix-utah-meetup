import type { DataFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";

export async function action({ request }: DataFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name");
  return redirect(`/game/${name}`);
}

export default function Start() {
  return (
    <Form method="post">
      <div>
        <label htmlFor="name">Game Name:</label>
        <input id="name" name="name" placeholder="Make something up" />
      </div>
    </Form>
  );
}
