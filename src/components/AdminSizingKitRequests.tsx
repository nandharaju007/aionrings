import { useEffect, useState } from "react";
import { RotateCcw, Eye, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const PAGE_SIZE = 10;

export function AdminSizingKitRequests() {
  const [rows, setRows] = useState<Tables<"sizing_kit_requests">[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Tables<"sizing_kit_requests"> | null>(null);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        "https://aionringcloudservice-csbbbub5bxc0c9cw.canadacentral-01.azurewebsites.net/api/sizing-kits",
      );
      if (!response.ok) throw new Error();
      setRows(await response.json());
    } catch {
      setError("Could not load sizing kit requests.");
    }
    setBusy(false);
  };
  useEffect(() => {
    void load();
  }, []);
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="text-[14px] text-ink-muted">
          <span className="text-ink font-medium">{rows.length}</span> sizing kit requests total
        </div>
        <button
          onClick={() => void load()}
          disabled={busy}
          aria-label="Refresh sizing kit requests"
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13px] text-ink-soft hover:bg-canvas transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>
      {error ? (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      ) : busy ? (
        <p className="text-[13px] text-ink-muted">Loading…</p>
      ) : !rows.length ? (
        <p className="text-[13px] text-ink-muted">No sizing kit requests yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-[13px]">
            <thead className="bg-canvas text-[11px] uppercase tracking-[2px] text-ink-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 text-center font-medium">Received</th>
                <th className="px-4 py-3 text-center font-medium">Name</th>
                <th className="px-4 py-3 text-center font-medium">Email</th>
                <th className="px-4 py-3 text-center font-medium">Phone</th>
                <th className="px-4 py-3 text-center font-medium">Location</th>
                <th className="px-4 py-3 text-center font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.id} className="h-14 border-t border-border hover:bg-white">
                  <td className="px-4 py-3 text-ink-soft text-center whitespace-nowrap">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">{row.name}</td>
                  <td className="px-4 py-3 text-ink-soft text-center whitespace-nowrap">{row.email}</td>
                  <td className="px-4 py-3 text-ink-soft text-center whitespace-nowrap">{row.phone}</td>
                  <td
                    className="px-4 py-3 text-ink-soft text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]"
                    title={`${row.address}, ${[row.city, row.region, row.postcode].filter(Boolean).join(", ")}, ${row.country}`}
                  >
                    {row.address}, {[row.city, row.region, row.postcode].filter(Boolean).join(", ")}, {row.country}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setExpanded(row)}
                      aria-label="View request details"
                      className="inline-flex items-center justify-center rounded-full border border-border w-8 h-8 hover:border-border"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!error && !busy && rows.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-[13px] text-ink-muted">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-full border border-border px-4 py-2 text-[13px] hover:border-border disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-full border border-border px-4 py-2 text-[13px] hover:border-border disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {expanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setExpanded(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[12px] uppercase tracking-[3px] text-primary">Sizing Kit Request</div>
              <button
                onClick={() => setExpanded(null)}
                aria-label="Close details"
                className="text-ink-muted hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-[14px]">
              <div>
                <div className="font-medium text-ink">{expanded.name}</div>
                <div className="text-ink-soft">
                  {expanded.email} · {expanded.phone}
                </div>
              </div>
              <div className="text-ink-soft">
                {expanded.address}
                <br />
                {[expanded.city, expanded.region, expanded.postcode].filter(Boolean).join(", ")}
                <br />
                {expanded.country}
              </div>
              <div className="text-[13px] text-ink-muted">
                Received {new Date(expanded.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
