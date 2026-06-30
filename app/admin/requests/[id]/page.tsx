import { connectDB } from "@/lib/db";
import Request from "@/models/Request";
import { notFound } from "next/navigation";
import RequestDetailManager from "@/components/admin/RequestDetailManager";

async function getRequest(id: string) {
  await connectDB();
  return Request.findById(id)
    .populate("userId", "name phone email")
    .populate("productId", "name images")
    .lean();
}

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const getParams = await params;
  const request = await getRequest(getParams.id);
  if (!request) notFound();

  return (
    <div>
      <h1 className="font-heading text-3xl text-foreground mb-6">
        Request Details
      </h1>
      <RequestDetailManager request={JSON.parse(JSON.stringify(request))} />
    </div>
  );
}
