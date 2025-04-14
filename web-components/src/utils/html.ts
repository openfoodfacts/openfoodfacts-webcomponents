// Function to sanitize HTML and return it as unsafeHTML for Lit rendering

import { unsafeHTML } from "lit-html/directives/unsafe-html.js"
import DOMPurify from "dompurify"

// It allow to dynamically create HTML elements with a specific tag name and be sure it's safe
export const sanitizeHtml = (html: string) => unsafeHTML(DOMPurify.sanitize(html))
