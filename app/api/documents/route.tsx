import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title || !body.content) {
      return Response.json(
        { error: "title and content are required" },
        { status: 400 }
      );
    }

    const doc = await prisma.document.create({
      data: {
        title: body.title,
        content: body.content,
      },
    });

    console.log("DOC CREATED:", doc);

    return Response.json(doc);
  } catch (error) {
    console.error("CREATE DOC ERROR:", error);
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const docs = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  });

  return Response.json(docs);
}