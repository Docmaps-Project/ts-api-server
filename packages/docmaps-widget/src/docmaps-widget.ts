import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  DocmapsFetchingController,
  FetchDocmapResult,
} from "./docmaps-fetching-controller";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import * as Prism from "prismjs";
import "prismjs/components/prism-json.js";
import { cssStyles } from "./custom-css";
import * as dagreD3 from "dagre-d3";
import * as d3 from "d3";

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

  renderAfterLoad({ rawDocmap, steps, graph }: FetchDocmapResult) {
    const formattedRaw = JSON.stringify(rawDocmap, null, 2);
    const formattedParsed = Prism.highlight(
      JSON.stringify(steps, null, 2),
      Prism.languages.json,
      "json",
    );

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
    const inner = svg.select("g");

    // Run the renderer on the SVG group and graph
    const svgGroup = svg.append("g");
    render(svgGroup, graph);

    // set up zoom
    var zoom = d3.zoom().on("zoom", function () {
      inner.attr("transform", d3.event.transform);
    });
    svg.call(zoom);

    // Center the graph
    // const svgWidth = parseInt(svg.attr("width"), 10);
    // const xCenterOffset = (svgWidth - graph.graph().width) / 2;
    // svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
    svg.attr("height", graph.graph().height + 40);
    svg.attr("widgth", graph.graph().width + 20);

    return html`
      <details>
        <summary>Raw Docmap</summary>
        <pre>${formattedRaw}</pre>
      </details>
      <br />
      <br />
      <details>
        <summary>Parsed Docmap with ${steps.length} steps</summary>
        <pre><code class="language-json">${unsafeHTML(
          formattedParsed,
        )}</code></pre>
      </details>
    `;
  }

  errorRender(err: unknown) {
    return html`<p>Couldn't fetch docmap: ${err}</p>`;
  }

  override render() {
    return html`
      <h2>DOI: ${this.doi}</h2>

      <svg id="svg-canvas" width="1500"></svg>

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
    "docmaps-widget": DocmapsWidget;
  }
}
