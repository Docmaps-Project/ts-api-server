import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { DocmapsFetchingController, FetchDocmapResult } from "./docmaps-fetching-controller";
import {unsafeHTML} from "lit/directives/unsafe-html.js"
import * as Prism from "prismjs";
import "prismjs/components/prism-json.js";
import {cssStyles} from "./custom-css";
import * as dagreD3 from "dagre-d3";
import * as d3 from "d3";

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("docmaps-widget")
export class DocmapsWidget extends LitElement {
  @property()
  doi: string = "N/A";

  #fetchingController: DocmapsFetchingController =
    new DocmapsFetchingController(this, this.doi);

  static override styles = [cssStyles];


  initialRender() {
    return html`<p>Haven't even tried to fetch yet tbh</p>`;
  }

  pendingRender() {
    return html`<p>Loading...</p>`;
  }

  renderAfterLoad({ rawDocmap, steps, graph}: FetchDocmapResult) {
    const formattedRaw = JSON.stringify(rawDocmap, null, 2);
    const formattedParsed = Prism.highlight(JSON.stringify(steps, null, 2), Prism.languages.json, 'json')

    const render = new dagreD3.render();

    // Get the element we're going to draw the graph inside of
    if (!this.shadowRoot) {
      throw new Error("Shadow root is undefined");
    }
    const svgElement = this.shadowRoot.querySelector("#svg-canvas");
    if (!svgElement) {
      throw new Error("SVG element not found");
    }
    const svg = d3.select(svgElement);

    // Run the renderer on the SVG group and graph
    const svgGroup = svg.append("g");
    render(svgGroup, graph);

    return html`
      <details>
        <summary>Raw Docmap</summary>
        <pre>${formattedRaw}</pre>
      </details>
      <br>
      <br>
      <details>
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
      <svg id="svg-canvas" width="1500">
      </svg>

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