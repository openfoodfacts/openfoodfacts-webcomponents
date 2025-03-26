import { Directive, directive } from "lit/directive.js"
import { StyleInfo, styleMap } from "lit-html/directives/style-map.js"
import { assetsImagesPath } from "../signals/app"

/**
 * A directive to set a background image.

 */
export class BackgroundImageDirective extends Directive {
  render(fileName: string, otherStyle: Readonly<StyleInfo> = {}) {
    return styleMap({
      ...otherStyle,
      "background-image": `url('${assetsImagesPath.get()}/${fileName}')`,
    })
  }
}

export const backgroundImage = directive(BackgroundImageDirective)
