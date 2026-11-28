import { Task } from "@lit/task"
import type { ReactiveController, ReactiveControllerHost } from "lit"
import { fetchPackagingSuggestions, type PackagingSuggestionsOptions } from "../../api/taxonomies"

export type SuggestionsState =
  | { status: "idle" }
  | { status: "waiting" }
  | { status: "loading" }
  | { status: "success"; suggestions: string[] }
  | { status: "error"; error: unknown }

export class PackagingSuggestionsController implements ReactiveController {
  state: SuggestionsState = { status: "idle" }

  private timer: ReturnType<typeof setTimeout> | undefined
  private version = 0

  private readonly task = new Task(this.host, {
    autoRun: false,
    task: async ([options, version, isCurrent]: readonly [
      PackagingSuggestionsOptions,
      number,
      () => boolean,
    ]) => {
      try {
        const suggestions = await fetchPackagingSuggestions(options)

        if (version === this.version && isCurrent()) {
          this.setState({ status: "success", suggestions })
        }
      } catch (error: unknown) {
        if (version === this.version && isCurrent()) {
          this.setState({ status: "error", error })
        }
      }
    },
  })

  constructor(private readonly host: ReactiveControllerHost) {
    host.addController(this)
  }

  search(options: PackagingSuggestionsOptions, delay = 250, isCurrent: () => boolean = () => true) {
    this.invalidate()

    const version = this.version
    this.setState({ status: "waiting" })

    this.timer = setTimeout(() => {
      this.timer = undefined
      this.setState({ status: "loading" })
      void this.task.run([options, version, isCurrent])
    }, delay)
  }

  cancel() {
    this.invalidate()
    this.setState({ status: "idle" })
  }

  hostDisconnected() {
    this.cancel()
  }

  private invalidate() {
    this.version += 1

    if (this.timer !== undefined) {
      clearTimeout(this.timer)
      this.timer = undefined
    }

    this.task.abort()
  }

  private setState(state: SuggestionsState) {
    this.state = state
    this.host.requestUpdate()
  }
}
