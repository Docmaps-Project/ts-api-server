import { ReactiveControllerHost } from "lit";
import { StatusRenderer, Task } from "@lit-labs/task";
import { Docmap, DocmapT, StepT } from "docmaps-sdk";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

export interface FetchDocmapResult {
  rawDocmap: any;
  steps: StepT[];
}

export class DocmapsFetchingController {
  #task: Task<any>;

  constructor(host: ReactiveControllerHost) {
    this.#task = new Task(
      host,
      async (): Promise<FetchDocmapResult> => {
        let rawDocmap: any;

        try {
          const docmapUrl: string = `https://raw.githubusercontent.com/Docmaps-Project/docmaps/main/examples/docmaps-example-elife-02.jsonld`;
          const response = await fetch(docmapUrl);
          const rawDocmapArray = await response.json();
          rawDocmap = rawDocmapArray[0];
        } catch {
          throw new Error("Failed to fetch docmap; time to panic");
        }

        const steps: StepT[] = getSteps(rawDocmap);

        return {
          rawDocmap,
          steps,
        };
      },
      () => [],
    );
  }

  render(renderFunctions: StatusRenderer<any>) {
    return this.#task.render(renderFunctions);
  }
}

function getSteps(docmap: any) {
  const stepsMaybe = pipe(
    docmap,
    Docmap.decode,
    E.map(getStepsInOrder),
  );

  if (E.isLeft(stepsMaybe)) {
    throw new Error("Failed to parse docmap; time to panic");
  } else {
    return stepsMaybe.right;
  }
}

function getStepsInOrder(docmap: DocmapT): StepT[] {
  const visitedSteps: Set<string> = new Set(); // we keep track of visited steps for loop detection
  let idNextStep: string | null | undefined = docmap["first-step"];
  const stepsById = docmap.steps;
  const orderedSteps: StepT[] = [];
  if (!idNextStep || !stepsById) {
    return [];
  }

  while (idNextStep && idNextStep in stepsById) {
    if (visitedSteps.has(idNextStep)) {
      console.log("loop detected, aborting step iterator at %s", idNextStep);
      break;
    }
    visitedSteps.add(idNextStep);
    const nextStep: StepT = stepsById[idNextStep];
    orderedSteps.push(nextStep);
    idNextStep = nextStep["next-step"];
  }
  return orderedSteps;
}
