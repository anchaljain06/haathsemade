"use client";

import { useState } from "react";
import Link from "next/link";

interface Request {
  _id: string;
  type: string;
  status: string;
  description: string;
  createdAt: string;
  userId?: { name: string; phone: string };
  productId?: { name: string };
}

const statusOptions = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "NEED_DISCUSSION",
  "QUOTATION_READY",
  "REJECTED",
  "ACCEPTED",
];

export default function RequestsTable({ requests }: { requests: Request[] }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filtered = requests.filter((r) => {
    const matchesStatus = !statusFilter || r.status === statusFilter;
    const matchesType = !typeFilter || r.type === typeFilter;
    return matchesStatus && matchesType;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          <option value="MADE_TO_ORDER">Made to Order</option>
          <option value="CUSTOM_ONLY">Custom Only</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-background-secondary text-foreground-muted text-xs">
            <tr>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Product / Description</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r._id} className="border-t border-border">
                <td className="px-4 py-3 text-foreground font-medium">
                  {r.userId?.name ?? "—"}
                  <p className="text-xs text-foreground-muted">
                    {r.userId?.phone}
                  </p>
                </td>
                <td className="px-4 py-3 text-foreground-muted text-xs">
                  {r.type.replace(/_/g, " ")}
                </td>
                <td className="px-4 py-3 text-foreground-muted">
                  {new Date(r.createdAt).toLocaleDateString("en-IN")}
                </td>
                <td className="px-4 py-3 text-foreground-muted line-clamp-1 max-w-xs">
                  {r.productId?.name ?? r.description.slice(0, 40)}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-background-secondary px-2 py-1 rounded-full">
                    {r.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/requests/${r._id}`}
                    className="text-primary text-xs hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-foreground-muted text-sm py-8">
            No requests found
          </p>
        )}
      </div>
    </div>
  );
}
