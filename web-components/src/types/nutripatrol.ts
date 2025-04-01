export enum IssueType {
  PRODUCT = "product",
  IMAGE = "image",
  SEARCH = "search",
}

export enum SourceType {
  MOBILE = "mobile",
  WEB = "web",
  ROBOTOFF = "robotoff",
}

export enum Flavor {
  OFF = "off",
  OBF = "obf",
  OPFF = "opff",
  OPF = "opf",
  OFF_PRO = "off-pro",
}

export enum ReasonType {
  INAPPROPRIATE = "inappropriate",
  HUMAN = "human",
  BEAUTY = "beauty",
  OTHER = "other",
}

export enum TicketStatus {
  OPEN = "open",
  CLOSED = "closed",
}

export type Barcode = string | null
export type ImageId = string | null
export type Confidence = number | null
export type Comment = string | null

export type FlagCreate = {
  barcode: Barcode
  type: IssueType
  url: string
  user_id: string
  source: SourceType
  confidence?: Confidence
  image_id?: ImageId
  flavor: Flavor
  reason?: string
  comment?: Comment
  created_at?: string
}

export type TicketCreate = {
  barcode: Barcode
  type: IssueType
  url: string
  status?: TicketStatus
  image_id?: ImageId
  flavor: Flavor
  created_at?: string
}

export type Ticket = {
  id: number
  barcode: Barcode
  type: IssueType
  url: string
  status: TicketStatus
  image_id?: ImageId
  flavor: Flavor
  created_at: string
}

export type FlagsByTicketIdRequest = {
  ticket_ids: number[]
}

export type GetTicketsRequestParams = Partial<{
  status: TicketStatus | null
  type_: IssueType | null
  reason: ReasonType[] | null
  page: number
  page_size: number
}>

export type FlagsResponse = FlagCreate[]

export type TicketsResponse = Ticket[]

export type NutripatrolConfigurationOptions = {
  apiUrl: string
  dryRun?: boolean
}

export type ValidationError = {
  loc: (string | number)[]
  msg: string
  type: string
}

export type HTTPValidationError = {
  detail: ValidationError[]
}

export interface NutripatrolWebComponent {
  config: NutripatrolConfigurationOptions
  createFlag(flag: FlagCreate): Promise<void>
  getFlags(): Promise<FlagsResponse>
  createTicket(ticket: TicketCreate): Promise<Ticket>
  getTickets(params?: GetTicketsRequestParams): Promise<TicketsResponse>
  updateTicketStatus(ticketId: number, status: TicketStatus): Promise<void>
}
