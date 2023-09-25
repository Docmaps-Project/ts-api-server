import { ReactiveControllerHost } from "lit";
import { StatusRenderer, Task } from "@lit-labs/task";
import { Docmap } from "docmaps-sdk";

export class DocmapsFetchingController {
  // #host: ReactiveControllerHost;
  #task: Task<any>;

  constructor(host: ReactiveControllerHost) {
    // this.#host = host;
    this.#task = new Task(
      host,
      async () => {
        let rawDocmap: any;

        try {
          const docmapUrl: string = `https://raw.githubusercontent.com/Docmaps-Project/docmaps/main/examples/docmaps-example-elife-02.jsonld`;
          const response = await fetch(docmapUrl);
          rawDocmap = await response.json();
        } catch {
          throw new Error("Failed to fetch docmap; time to panic");
        }

        const parsedDocmap = (Docmap.decode(rawDocmap[0]) as any).right;

        return {
          rawDocmap,
          parsedDocmap,
        };
      },
      () => [],
    );
  }

  render(renderFunctions: StatusRenderer<any>) {
    return this.#task.render(renderFunctions);
  }
}
