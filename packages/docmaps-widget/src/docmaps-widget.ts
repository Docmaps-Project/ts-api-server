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
import * as Dagre from "dagre";
import * as d3 from "d3";

const knownDocmapIds: string[] = [
  // "https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/by-publisher/elife/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698",
  // "https://sciety.org/docmaps/v1/articles/10.21203/rs.3.rs-3171736/v1/rapid-reviews-covid-19.docmap.json",
  // "https://sciety.org/docmaps/v1/articles/10.21203/rs.3.rs-1020603/v1/prereview.docmap.json",
  // "https://sciety.org/docmaps/v1/articles/10.21203/rs.3.rs-1043992/v1/biophysics-colab.docmap.json",
  // "https://sciety.org/docmaps/v1/articles/10.21203/rs.3.rs-903562/v2/prereview.docmap.json",
  // "https://sciety.org/docmaps/v1/articles/10.21203/rs.3.rs-955726/v1/biophysics-colab.docmap.json",
  // "https://sciety.org/docmaps/v1/articles/10.21203/rs.3.rs-885194/v1/ncrc.docmap.json",
  // "https://sciety.org/docmaps/v1/articles/10.21203/rs.3.rs-871965/v1/ncrc.docmap.json",
  // "https://sciety.org/docmaps/v1/articles/10.21203/rs.3.rs-789831/v1/prereview.docmap.json",
  // "https://sciety.org/docmaps/v1/articles/10.21203/rs.3.rs-734203/v1/prereview.docmap.json",
  // "https://sciety.org/docmaps/v1/articles/10.21203/rs.3.rs-420780/v1/prereview.docmap.json",
]

@customElement("docmaps-widget")
export class DocmapsWidget extends LitElement {
  @property()
  // @ts-ignore
  docmapId: string;

  @property()
  // @ts-ignore
  serverUrl: string;

  #docmapController = new DocmapsFetchingController(this);

  static styles = [cssStyles];

  handleButtonClick() {
    const input =
      this.shadowRoot?.querySelector<HTMLInputElement>("#doi-input");
    if (input && input.value) {
      this.#docmapController.docmapId = input.value;
    }
  }

  initialRender() {
    return html``;
  }

  pendingRender() {
    return html`<p>Loading...</p>`;
  }

  renderAfterLoad({ rawDocmap, steps, graph, docmapId }: FetchDocmapResult) {
    this.drawGraph(graph);

    return html`
      <h3>Docmap ID: ${docmapId}</h3>

      <details>
        <summary>Raw Docmap</summary>
        ${this.formatJson(rawDocmap)}
      </details>
      <br />
      <br />
      <details>
        <summary>Parsed Docmap with ${steps.length} steps</summary>
        ${this.formatJson(steps)}
      </details>
    `;
  }

  formatJson(json: any) {
    const highlightedJson = Prism.highlight(
      JSON.stringify(json, null, 2),
      Prism.languages.json,
      "json",
    );

    return html`<pre><code class="language-json">${unsafeHTML(
      highlightedJson,
    )}</code></pre>`;
  }

  private drawGraph(graph: Dagre.graphlib.Graph) {
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
    // remove any existing graph. This keeps us from drawing a graph on top of another graph
    svg.select("g").remove();

    // Run the renderer on the SVG group and graph
    const svgGroup = svg.append("g");
    // @ts-ignore
    render(svgGroup, graph);

    // Set height and width
    const graphLabel = graph.graph();
    if (graphLabel) {
      const height = graphLabel.height ?? 0;
      svg.attr("height", height + 40);

      const width = graphLabel.width ?? 0;
      svg.attr("widgth", width + 20);
    }
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
        ${knownDocmapIds.map((id) => html`<li>${id}</li>`)}
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
