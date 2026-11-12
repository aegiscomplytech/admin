"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { getAuditLogs } from "@/services/audit-logs.service"
import { getDashboardOverview } from "@/services/dashboard.service"

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: getDashboardOverview,
    staleTime: 30_000,
  })
}

/** Keeps showing the previous page while the next one loads, so the table doesn't jump. */
export function useAuditLogs(params, { enabled = true } = {}) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => getAuditLogs(params),
    placeholderData: keepPreviousData,
    enabled,
  })
}
