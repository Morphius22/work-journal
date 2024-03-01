import { redirect, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";


export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};


export async function action({ request }: ActionFunctionArgs ) {
  const db = new PrismaClient();
  const formData = await request.formData();
  const { date, category, text } = Object.fromEntries(formData);
  console.log(date, category, text)

  if (
    typeof date !== "string" ||
    typeof category !== "string" ||
    typeof text !== "string"
  ) {
    throw new Error("Bad request");
  }

  await db.entry.create({
    data: {
      date: new Date(date),
      category: category,
      text: text,
    },
  });
  
  return redirect("/");
}

export default function Index() {
  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-4xl text-white">Work journal</h1>
      <p className="mt-3 text-xl text-gray-400">
        Doings and learnings. Updated weekly.
      </p>

      <div className="my-8 border p-3">
        <Form method="post">
          <p className="italic">Create an entry</p>

          <div className="mt-4">
            <div>
              <input type="date" name="date" className="text-gray-700" />
            </div>

            <div className="mt-2 space-x-6">
              <label>
                <input className="mr-1" type="radio" name="category" value="work" />
                Work
              </label>
              <label>
                <input
                  className="mr-1"
                  type="radio"
                  name="category"
                  value="learning"
                />
                Learning
              </label>
              <label>
                <input
                  className="mr-1"
                  type="radio"
                  name="category"
                  value="interesting-thing"
                />
                Interesting thing
              </label>
            </div>

            <div className="mt-2">
              <textarea
                name="text"
                className="w-full text-gray-700"
                placeholder="Write your entry..."
              />
            </div>

            <div className="mt-1 text-right">
              <button
                className="bg-blue-500 px-4 py-1 font-medium text-white"
                type="submit"
              >
                Save
              </button>
            </div>
          </div>
        </Form>
      </div>  

      <div className="mt-8">
        <ul>
          <li>
            <p>
              Week of Feb 2<sup>nd</sup>, 2023
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <p>Work:</p>
                <ul className="ml-6 list-disc">
                  <li>First thing</li>
                </ul>
              </div>
              <div>
                <p>Learnings:</p>
                <ul className="ml-6 list-disc">
                  <li>First learning</li>
                  <li>Second learning</li>
                </ul>
              </div>
              <div>
                <p>Interesting things:</p>
                <ul className="ml-6 list-disc">
                  <li>Something cool!</li>
                </ul>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
