import { onBoardUser } from "@/actions/user";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardEntryPage() {
  const user = await onBoardUser();

  if (user.status === 200 || user.status === 201) {
    const first = user.data?.firstname;
    const last = user.data?.lastname;
    if (first && last) {
      redirect(`/dashboard/${first}-${last}`);
    }
  }

  if (user.status === 500) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-xl font-semibold">Can&apos;t reach the database</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          The server could not open a TLS connection to Postgres (Neon). That
          often comes from a firewall or VPN blocking outbound connections, a
          paused Neon project, or an unstable network—not from your Clerk login.
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          In the Neon dashboard, confirm the project is active and try the
          pooled connection string with{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            ?sslmode=require&amp;pgbouncer=true
          </code>{" "}
          for Prisma. Ensure you open the app at the same port Next prints (e.g.{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            http://localhost:3002
          </code>
          ) so the browser does not call a dead{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            :3000
          </code>{" "}
          URL.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  redirect("/sign-in");
}
