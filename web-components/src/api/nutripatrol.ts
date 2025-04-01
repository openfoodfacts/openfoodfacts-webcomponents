import {
  FlagCreate,
  FlagsByTicketIdRequest,
  FlagsResponse,
  GetTicketsRequestParams,
  Ticket,
  TicketCreate,
  TicketsResponse,
  TicketStatus,
} from "../types/nutripatrol"
import { addParamsToUrl } from "../utils"
import { nutripatrolConfiguration } from "../signals/nutripatrol"

const getApiUrl = (path: string) => `${nutripatrolConfiguration.getItem("apiUrl")}${path}`
const isDryRun = nutripatrolConfiguration.getItem("dryRun")

export const createFlag = async (flag: FlagCreate): Promise<void> => {
  const apiUrl = getApiUrl("/api/v1/flags")
  if (isDryRun) return console.log("Created flag:", apiUrl, flag)

  const response = await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify(flag),
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })

  if (!response.ok) throw new Error(`Failed to create flag: ${response.statusText}`)
}

export const getFlags = async (): Promise<FlagsResponse> => {
  const response = await fetch(getApiUrl("/api/v1/flags"), {
    method: "GET",
    credentials: "include",
  })
  return response.json()
}

export const createTicket = async (ticket: TicketCreate): Promise<Ticket> => {
  const apiUrl = getApiUrl("/api/v1/tickets")
  if (isDryRun)
    return { ...ticket, id: 0, status: TicketStatus.OPEN, created_at: new Date().toISOString() }

  const response = await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify(ticket),
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })

  if (!response.ok) throw new Error(`Failed to create ticket: ${response.statusText}`)
  return response.json()
}

export const getTickets = async (params?: GetTicketsRequestParams): Promise<TicketsResponse> => {
  const url = params
    ? addParamsToUrl(getApiUrl("/api/v1/tickets"), params)
    : getApiUrl("/api/v1/tickets")
  const response = await fetch(url, { method: "GET", credentials: "include" })
  return response.json()
}

export const updateTicketStatus = async (ticketId: number, status: TicketStatus): Promise<void> => {
  const apiUrl = getApiUrl(`/api/v1/tickets/${ticketId}/status`)
  if (isDryRun) return console.log("Updated ticket status:", apiUrl, { status })

  const response = await fetch(apiUrl, {
    method: "PUT",
    body: JSON.stringify({ status }),
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })

  if (!response.ok) throw new Error(`Failed to update ticket status: ${response.statusText}`)
}

export const getFlagsByTicketBatch = async (
  request: FlagsByTicketIdRequest
): Promise<FlagsResponse> => {
  const response = await fetch(getApiUrl("/api/v1/flags/batch"), {
    method: "POST",
    body: JSON.stringify(request),
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
  return response.json()
}

export const getFlag = async (flagId: number): Promise<FlagCreate> => {
  const response = await fetch(getApiUrl(`/api/v1/flags/${flagId}`), {
    method: "GET",
    credentials: "include",
  })
  return response.json()
}

export const getTicket = async (ticketId: number): Promise<Ticket> => {
  const response = await fetch(getApiUrl(`/api/v1/tickets/${ticketId}`), {
    method: "GET",
    credentials: "include",
  })
  return response.json()
}

export const getStatus = async (): Promise<any> => {
  const response = await fetch(getApiUrl("/api/v1/status"), {
    method: "GET",
    credentials: "include",
  })
  return response.json()
}
