import { Directive, directive } from "lit/directive.js"
import { type StyleInfo, styleMap } from "lit-html/directives/style-map.js"
import { getImageUrl } from "../signals/app"

/**
 * A directive to set a background image.

 */
export class BackgroundImageDirective extends Directive {
  render(fileName: string, otherStyle: Readonly<StyleInfo> = {}) {
    return styleMap({
      ...otherStyle,
      "background-image": `url('${getImageUrl(fileName)}')`,
    })
  }
}

export const backgroundImage = directive(BackgroundImageDirective)
