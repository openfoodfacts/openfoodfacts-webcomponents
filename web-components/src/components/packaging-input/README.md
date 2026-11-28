# Packaging Input (draft)

`packaging-input` receives packaging parts and lets the user add and remove parts and edit their unit counts, shapes and materials. Shape and material fields offer taxonomy suggestions. The component never saves a product.

```ts
import {
  PackagingInput,
  type PackagingChangeEvent,
} from "@openfoodfacts/openfoodfacts-webcomponents"

const editor = new PackagingInput()
editor.packagings = [{ number_of_units: 1, shape: { id: "en:bottle", lc_name: "Bottle" } }]
editor.addEventListener("packaging-change", (event: PackagingChangeEvent) => {
  // The host decides whether and how to persist this snapshot.
  const updatedParts = event.detail.packagings
})
document.body.append(editor)
```

## Draft contract

- `packagings`: a JavaScript property containing a readonly array of SDK
  `PackagingComponent` objects. Defaults to `[]`; `null` and `undefined` also
  render an empty list. Partial parts are allowed. No JSON attribute is exposed.
- Replace the array to apply external updates. In-place mutations are not observed.
  External updates do not emit a user change event.
- Adding a part appends `{}`. Removing a part removes only the selected item and
  can return the list to `[]`. Each action emits `packaging-change` with
  `{ packagings }`. It bubbles and is composed.
- After a valid user `change` to units, the component updates its own property and
  emits the same event. Unchanged or invalid edits do not emit. Empty units remove
  `number_of_units`.
- Input objects are never edited in place. Each edit clones the list and the event
  carries a separate snapshot, preserving additional fields. Supply plain,
  structured-cloneable product data, not functions or DOM nodes.
- Provisional unit validation: optional, minimum 1, decimals allowed (`step="any"`).
  The browser reports invalid entries and the last accepted data is retained.
  Existing data is displayed without silently normalizing it. Domain review is
  still needed before treating this rule as final.
- Shape and material display `lc_name`, falling back to `id`. Unchanged values
  retain their existing identifiers and labels.
- Selecting a suggestion or confirming different text updates `lc_name` and
  removes the previous `id`, while preserving other properties of that field.
  No taxonomy identifier is invented from the displayed text. Clearing the
  field removes `shape` or `material` from that part.
- Shape and material suggestions are requested using the configured language,
  country and API server. The editor displays loading, empty and error states;
  after an error, the user can retry. Free text can also be confirmed.
- After adding a part, focus moves to its units field. After removal, focus moves
  to the units field of the next available part, or to Add packaging part when the
  list becomes empty.

The Storybook examples show the last emitted payload, including fields that the basic editor does not edit. Taxonomy suggestions require access to the configured API server.
