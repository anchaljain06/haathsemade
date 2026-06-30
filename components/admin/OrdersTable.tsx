"use client";

import { useState } from "react";
import Link from "next/link";

interface Order {
  _id: string;
  items: { name: string; quantity: number }[];
  totalAmount: number;
  status: string;
  createdAt: string;
  userId?: { name: string; phone: string };
}

const statusOptions = [
  "PENDING_CONFIRMATION",
  "PAYMENT_COMPLETED",
  "CRAFTING",
  "QUALITY_CHECK",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
];

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.userId?.phone?.includes(search) ||
      o._id.includes(search);
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Search by customer name, phone, or order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-border rounded-md px-3 py-2 text-sm flex-1 min-w-[240px]"
        />
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
              <th className="text-left px-4 py-3">Order ID</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Items</th>
              <th className="text-left px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o._id} className="border-t border-border">
                <td className="px-4 py-3 text-foreground-muted text-xs">
                  {o._id.slice(-8)}
                </td>
                <td className="px-4 py-3 text-foreground font-medium">
                  {o.userId?.name ?? "—"}
                  <p className="text-xs text-foreground-muted">
                    {o.userId?.phone}
                  </p>
                </td>
                <td className="px-4 py-3 text-foreground-muted">
                  {new Date(o.createdAt).toLocaleDateString("en-IN")}
                </td>
                <td className="px-4 py-3 text-foreground-muted">
                  {o.items.length}
                </td>
                <td className="px-4 py-3 text-foreground-muted">
                  ₹{o.totalAmount.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-background-secondary px-2 py-1 rounded-full">
                    {o.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${o._id}`}
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
            No orders found
          </p>
        )}
      </div>
    </div>
  );
}
