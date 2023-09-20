import { ReactiveControllerHost } from "lit";
// @ts-ignore
import {initialState, StatusRenderer, Task} from '@lit-labs/task';

export class DocmapFetchingController {
  // #host: ReactiveControllerHost;
  #task: Task<any>;

  constructor(host: ReactiveControllerHost) {
    // this.#host = host;
    this.#task = new Task(
      host,
      async () => {
        try {
          const docmapUrl: string = `https://raw.githubusercontent.com/Docmaps-Project/docmaps/main/examples/docmaps-example-elife-02.jsonld`;
          const response = await fetch(docmapUrl);
          const data = await response.json();
          return data
        } catch {
          throw new Error("Failed to fetch docmap; time to panic");
        }
      },
      () => []
    );
  }

  render(renderFunctions: StatusRenderer<any>) {
    return this.#task.render(renderFunctions);
  }
}
