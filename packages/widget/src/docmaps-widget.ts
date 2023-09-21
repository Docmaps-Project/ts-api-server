import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { DocmapFetchingController } from "./docmap-fetching-controller";

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('docmaps-widget')
export class DocmapsWidget extends LitElement {
  #fetchingController: DocmapFetchingController = new DocmapFetchingController(this);

  static override styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
    }

    details {
      border: 1px solid #aaa;
      border-radius: 4px;
      padding: 0.5em 0.5em 0;
    }

    summary {
      font-weight: bold;
      margin: -0.5em -0.5em 0;
      padding: 0.5em;
    }

    details[open] {
      padding: 0.5em;
    }

    details[open] summary {
      border-bottom: 1px solid #aaa;
      margin-bottom: 0.5em;
    }

  `;

  @property()
  doi: string = 'N/A';

  initialRender(){
    return html`<p>Haven't even tried to fetch yet tbh</p>`
  }

  pendingRender(){
    return html`<p>Loading...</p>`
  }

  renderAfterLoad(docmapArray: any[]) {
    const docmap = docmapArray[0];
    const result = JSON.stringify(docmap, null, 2);
    return html`
      <details open>
        <summary>Raw Docmap</summary>
        <pre>${result}</pre>
      </details>
    `
  };

  errorRender(err: unknown){
    return html`<p>Couldn't fetch docmap: ${err}</p>`
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
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'docmaps-widget': DocmapsWidget;
  }
}
