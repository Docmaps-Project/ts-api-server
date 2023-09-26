import { ReactiveControllerHost } from "lit";
import { StatusRenderer, Task } from "@lit-labs/task";
import { Docmap } from "docmaps-sdk";
import * as E from 'fp-ts/lib/Either'
import {pipe} from 'fp-ts/lib/function'

export class DocmapsFetchingController {
  #task: Task<any>;

  constructor(host: ReactiveControllerHost) {
    this.#task = new Task(
      host,
      async () => {
        let rawDocmap: any;

        try {
          const docmapUrl: string = `https://raw.githubusercontent.com/Docmaps-Project/docmaps/main/examples/docmaps-example-elife-02.jsonld`;
          const response = await fetch(docmapUrl);
          const rawDocmapArray = await response.json();
          rawDocmap = rawDocmapArray[0];
        } catch {
          throw new Error("Failed to fetch docmap; time to panic");
        }

        const parsedDocmap = parseDocmap(rawDocmap);

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

function parseDocmap(docmap: any) {
  const stepsMaybe = pipe(
    docmap,
    Docmap.decode,
    E.map(d => d.steps ? Object.values(d.steps): []),
  )

  if (E.isLeft(stepsMaybe)) {
    throw new Error("Failed to parse docmap; time to panic");
  } else {
    return stepsMaybe.right;
  }
}

