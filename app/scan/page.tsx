import { ScanClient } from "./ScanClient";

export const metadata = {
  title: "Your Scan — Get Punched",
};

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const sessionId =
    typeof params.session_id === "string" ? params.session_id : undefined;
  const devToken =
    typeof params.dev_token === "string" ? params.dev_token : undefined;
  const name = typeof params.name === "string" ? params.name : undefined;
  const context =
    typeof params.context === "string" ? params.context : undefined;

  return (
    <main className="flex flex-1 flex-col">
      <ScanClient
        sessionId={sessionId}
        devToken={devToken}
        name={name}
        context={context}
      />
    </main>
  );
}
