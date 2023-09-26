import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { DocmapsFetchingController, FetchDocmapResult } from "./docmaps-fetching-controller";
import {unsafeHTML} from "lit/directives/unsafe-html.js"
import * as Prism from "prismjs";
import "prismjs/components/prism-json.js";
import {prismCssStyles} from "./prism-css";

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("docmaps-widget")
export class DocmapsWidget extends LitElement {
  #fetchingController: DocmapsFetchingController =
    new DocmapsFetchingController(this);

  static override styles = [prismCssStyles];

  @property()
  doi: string = "N/A";

  initialRender() {
    return html`<p>Haven't even tried to fetch yet tbh</p>`;
  }

  pendingRender() {
    return html`<p>Loading...</p>`;
  }

  renderAfterLoad({ rawDocmap, steps}: FetchDocmapResult) {
    const formattedRaw = JSON.stringify(rawDocmap, null, 2);
    const formattedParsed = Prism.highlight(JSON.stringify(steps, null, 2), Prism.languages.json, 'json')
    return html`
      <details>
        <summary>Raw Docmap</summary>
        <pre>${formattedRaw}</pre>
      </details>
      <br>
      <br>
      <details open>
        <summary>Parsed Docmap with ${steps.length} steps</summary>
        <pre><code class="language-json">${unsafeHTML(formattedParsed)}</code></pre>
      </details>
    `;
  }

  errorRender(err: unknown) {
    return html`<p>Couldn't fetch docmap: ${err}</p>`;
  }

  override render() {
    return html`
      <h2>DOI: ${this.doi}</h2>

      ${this.#fetchingController.render({
        initial: this.initialRender.bind(this),
        pending: this.pendingRender.bind(this),
        complete: this.renderAfterLoad.bind(this),
        error: this.errorRender.bind(this),
      })}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'docmaps-widget': DocmapsWidget;
  }
}