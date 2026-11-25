export interface FooterBrand {
  name: string
  logo: string
  description: string
}

export interface FooterLink {
  label: string
  href: string
  external?: boolean
  message?: "code-of-conduct" | "slack"
  type?: "donation"
}

export interface FooterLinkGroup {
  label: string
  links: FooterLink[]
  layout?: "community" | "buttons"
}

export interface FooterSocialLink extends FooterLink {
  icon: string
}
