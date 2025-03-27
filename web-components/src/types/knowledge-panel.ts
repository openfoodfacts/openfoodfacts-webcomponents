/**
 * Types for knowledge panels
 */

// Image sizes in different resolutions
export interface ImageSize {
  height: number
  width: number
  url: string
}

// Image with different size options
export interface PanelImage {
  alt: string
  id: string
  lc: string
  type: string
  sizes: {
    [key: string]: ImageSize
  }
}

// Text element
export interface TextElement {
  html?: string
  text?: string
  type?: string
}

// Table column
export interface TableColumn {
  id: string
  text?: string
}

// Table cell
export interface TableCell {
  text?: string
  value?: string
}

// Table row
export interface TableRow {
  cells: TableCell[]
}

// Table element
export interface TableElement {
  id?: string
  title?: string
  columns?: TableColumn[]
  rows?: TableRow[]
}

// Action element
export interface ActionElement {
  actions?: string[]
  html?: string
}

// Panel element reference
export interface PanelElementRef {
  panel_id: string
}

// Panel group element
export interface PanelGroupElement {
  panel_group_id?: string
  panel_ids?: string[]
  title?: string
  type?: string
  image?: PanelImage
}

// Title element
export interface TitleElement {
  title: string
  subtitle?: string
  grade?: string
  icon_url?: string
  type?: string
}

// Element types
export type ElementType = "text" | "table" | "titled_text" | "panel" | "panel_group" | "action"

// Knowledge panel element
export interface KnowledgePanelElement {
  element_type: ElementType
  text?: string
  title?: string
  text_element?: TextElement
  table_element?: TableElement
  panel_element?: PanelElementRef
  panel_group_element?: PanelGroupElement
  action_element?: ActionElement
  elements?: KnowledgePanelElement[]
}

// Knowledge panel
export interface KnowledgePanel {
  elements: KnowledgePanelElement[]
  title?: string
  title_element?: TitleElement
  level?: "info" | "warning" | "success" | "danger"
  size?: "small" | "medium" | "large"
  expanded?: boolean
  topics?: string[]
  type?: string
}

// Collection of knowledge panels
export interface KnowledgePanelsData {
  [key: string]: KnowledgePanel
}
