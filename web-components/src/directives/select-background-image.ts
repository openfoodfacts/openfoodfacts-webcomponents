import { Directive } from "lit-html/directive"
import { styleMap } from "lit-html/directives/style-map"
import { getImageUrl } from "../signals/app"

export class SelectIconDirective extends Directive {
  render(otherStyle: Readonly<StyleInfo> = {}) {
    return styleMap({
      ...otherStyle,
      "background-image": `url('${getImageUrl()}')`,
    })
  }
}
