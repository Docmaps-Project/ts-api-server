import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  DocmapsFetchingController,
  FetchDocmapResult,
} from "./docmaps-fetching-controller";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import * as Prism from "prismjs";
// @ts-ignore
import "prismjs/components/prism-json.js";
import { cssStyles } from "./custom-css";
import * as dagreD3 from "dagre-d3";
import * as d3 from "d3";

@customElement("docmaps-widget")
export class DocmapsWidget extends LitElement {
  @property()
  // @ts-ignore
  docmapId: string;

  @property()
  // @ts-ignore
  serverUrl: string;

  #docmapController = new DocmapsFetchingController(this);

  static override styles = [cssStyles];

  handleButtonClick() {
    const input =
      this.shadowRoot?.querySelector<HTMLInputElement>("#doi-input");
    if (input && input.value) {
      this.#docmapController.docmapId = input.value;
    }
  }

  initialRender() {
    return html`
    `;
  }

  pendingRender() {
    return html`<p>Loading...</p>`;
  }

  renderAfterLoad({ rawDocmap, steps, graph, docmapId }: FetchDocmapResult) {
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
    // const inner = svg.select("g");

    // Run the renderer on the SVG group and graph
    const svgGroup = svg.append("g");
    // @ts-ignore
    render(svgGroup, graph);

    // set up zoom
    // var zoom = d3.zoom().on("zoom", function () {
    //   inner.attr("transform", d3.event.transform);
    // });
    // svg.call(zoom);

    // Set height and width
    const graphLabel = graph.graph();
    console.log(graph.nodes())
    if (graphLabel) {
      const height = graphLabel.height ?? 0;
      console.log("height", height);
      svg.attr("height", height + 40);

      const width = graphLabel.width ?? 0;
      svg.attr("widgth", width + 20);
    }

    return html`
      <h3>Displaying Docmap for id: ${docmapId}</h3>

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
      <svg id="svg-canvas" width="1500"></svg>

      ${this.#docmapController.render({
        initial: this.initialRender.bind(this),
        pending: this.pendingRender.bind(this),
        complete: this.renderAfterLoad.bind(this),
        error: this.errorRender.bind(this),
      })}
      <br /><br />
      <p>Example docmaps:</p>
      <ul>
        <li>https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/by-publisher/elife/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698</li>
        <li>https://sciety.org/docmaps/v1/articles/10.21203/rs.3.rs-3171736/v1/rapid-reviews-covid-19.docmap.json</li>
      </ul>
      <input
        id="doi-input"
        type="text"
        placeholder="Docmap ID"
        .value="${this.id}"
      />
      <button @click="${this.handleButtonClick}">Fetch Docmap</button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docmaps-widget": DocmapsWidget;
  }
}
