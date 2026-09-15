export async function GET() {
  return Response.json({
    ok: true,
    service: "opus-creative-worker",
    version: "0.1.0",
    mode: "bootstrap",
  });
}
