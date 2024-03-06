import { redirect, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { format, startOfWeek, parseISO } from "date-fns";
import { useEffect, useRef } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Work Journal" },
    { name: "description", content: "a page for logging anything i learn" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const db = new PrismaClient();
  const formData = await request.formData();
  const { date, category, text } = Object.fromEntries(formData);
  console.log(date, category, text);
  await new Promise((resolve) => setTimeout(resolve, 1000));

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

export async function loader() {
  const db = new PrismaClient();
  const entries = await db.entry.findMany();

  return entries.map((entry) => ({
    ...entry,
    date: entry.date.toISOString().substring(0, 10), // '2023-03-28'
  }));
}

export default function Index() {
  const fetcher = useFetcher();
  console.log(fetcher.state);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const entries = useLoaderData<typeof loader>();

  useEffect(() => {
    if (fetcher.state === "submitting" && textRef.current) {
      textRef.current.value = "";
      textRef.current.focus;
    }
  }, [fetcher.state]);

  const entriesByWeek = entries.reduce<Record<string, typeof entries>>(
    (memo, entry) => {
      const sunday = startOfWeek(parseISO(entry.date));
      const sundayString = format(sunday, "yyyy-MM-dd");

      memo[sundayString] ||= [];
      memo[sundayString].push(entry);

      return memo;
    },
    {}
  );

  const weeks = Object.keys(entriesByWeek)
    .sort((a, b) => a.localeCompare(b))
    .map((dateString) => ({
      dateString,
      work: entriesByWeek[dateString].filter(
        (entry) => entry.category === "work"
      ),
      learnings: entriesByWeek[dateString].filter(
        (entry) => entry.category === "learning"
      ),
      interestingThings: entriesByWeek[dateString].filter(
        (entry) => entry.category === "interesting-thing"
      ),
    }));

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="my-8 border p-3">
        <fieldset
          disabled={fetcher.state === "submitting"}
          className="disabled:opacity-80"
        >
          <fetcher.Form method="post">
            <p className="italic">Create an entry</p>

            <div className="mt-4">
              <div>
                <input
                  type="date"
                  name="date"
                  className="text-gray-700"
                  required
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                />
              </div>

              <div className="mt-2 space-x-6">
                <label>
                  <input
                    className="mr-1"
                    type="radio"
                    name="category"
                    value="work"
                    required
                    defaultChecked
                  />
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
                  required
                  ref={textRef}
                />
              </div>

              <div className="mt-1 text-right">
                <button
                  className="bg-blue-500 px-4 py-1 font-medium text-white"
                  type="submit"
                >
                  {fetcher.state === "submitting" ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </fetcher.Form>
        </fieldset>
      </div>

      <div className="mt-12 space-y-12">
        {weeks.map((week) => (
          <div key={week.dateString}>
            <p className="font-bold">
              Week of {format(parseISO(week.dateString), "MMMM do")}
            </p>
            <div className="mt-3 space-y-4">
              {week.work.length > 0 && (
                <div>
                  <p>Work</p>
                  <ul className="ml-8 list-disc">
                    {week.work.map((entry) => (
                      <EntryListItem key={entry.id} entry={entry} />
                    ))}
                  </ul>
                </div>
              )}
              {week.learnings.length > 0 && (
                <div>
                  <p>Learning</p>
                  <ul className="ml-8 list-disc">
                    {week.learnings.map((entry) => (
                      <EntryListItem key={entry.id} entry={entry} />
                    ))}
                  </ul>
                </div>
              )}
              {week.interestingThings.length > 0 && (
                <div>
                  <p>Interesting things</p>
                  <ul className="ml-8 list-disc">
                    {week.interestingThings.map((entry) => (
                      <EntryListItem key={entry.id} entry={entry} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* <div>
        {entries.map((entry) => (
          <p key={entry.id}>{entry.text}</p>
        ))}
      </div> */}

      {/* <div className="mt-8">
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
      </div> */}
    </div>
  );
}

function EntryListItem({
  entry,
}: {
  entry: Awaited<ReturnType<typeof loader>>[number];
}) {
  return (
    <li className="group">
      {entry.text}

      <Link
        to={`/entries/${entry.id}/edit`}
        className="ml-2 text-blue-500 opacity-0 group-hover:opacity-100"
      >
        Edit
      </Link>
    </li>
  );
}
