import { connectDB } from "@/lib/db";
import Request from "@/models/Request";
import RequestsTable from "@/components/admin/RequestsTable";

async function getRequests() {
  await connectDB();
  return Request.find()
    .sort({ createdAt: -1 })
    .populate("userId", "name phone")
    .populate("productId", "name")
    .lean();
}

export default async function AdminRequestsPage() {
  const requests = await getRequests();

  return (
    <div>
      <h1 className="font-heading text-3xl text-foreground mb-6">
        Requests
      </h1>
      <RequestsTable requests={JSON.parse(JSON.stringify(requests))} />
    </div>
  );
}
