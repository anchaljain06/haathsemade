import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Request from "@/models/Request";
import { redirect } from "next/navigation";
import Link from "next/link";
import RequestCard from "@/components/requests/RequestCard";

async function getRequests() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await connectDB();
  return Request.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .populate("productId", "name images")
    .lean();
}

export default async function RequestsPage() {
  const requests = await getRequests();

  if (requests.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-heading text-3xl text-foreground mb-3">
          No Requests Yet
        </h1>
        <p className="text-foreground-muted mb-8">
          Submitted custom or made-to-order requests will appear here.
        </p>
        <Link
          href="/custom-orders"
          className="bg-primary text-white px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Start a Custom Order
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-heading text-3xl text-foreground mb-8">
        My Requests
      </h1>

      <div className="space-y-4">
        {requests.map((req: any) => (
          <RequestCard key={req._id.toString()} request={req} />
        ))}
      </div>
    </div>
  );
}
