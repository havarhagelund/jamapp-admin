import { Button } from "@/components/ui/button";
import Link from "next/link";


export default async function Index() {
  return (
    <>
      <main className="flex-1 flex flex-col gap-6 px-4">
        <h1 className="font-medium text-3xl mb-4">Jam app - Admin</h1>
        <div className="flex justify-around">
          <Button asChild size={"lg"} variant={"outline"}>
            <Link href="/protected/add">Edit</Link>
          </Button>
          <Button asChild size={"lg"} variant={"outline"}>
            <Link href="/protected/view">Se alle</Link>
          </Button>
        </div>
      </main>
    </>
  );
}