import { ReactiveControllerHost } from "lit";
import { StatusRenderer, Task } from "@lit-labs/task";
import { Docmap, DocmapT, StepT } from "docmaps-sdk";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

import * as Dagre from "dagre";

export interface FetchDocmapResult {
  rawDocmap: any;
  steps: StepT[];
  graph: any;
}

export class DocmapsFetchingController {
  #task: Task<any>;

  constructor(host: ReactiveControllerHost, doi: string) {
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
        const graph: any = makeGraph(doi, steps);

        return {
          rawDocmap,
          steps,
          graph,
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
  const stepsMaybe = pipe(docmap, Docmap.decode, E.map(getStepsInOrder));

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

type DisplayObject = {
  doi: string;
  type?: ThingType;
  published?: Date;
};

function makeGraph(_doi: string, steps: StepT[]): any {
  const graph = new Dagre.graphlib.Graph();
  graph.setGraph({});
  graph.setDefaultEdgeLabel(() => ({}));

  const width = 121;
  const height = 100;
  // graph.setNode(doi, { label: doi, width, height });

  const seenDois: Set<string> = new Set();
  for (const step of steps) {
    for (const action of step.actions) {
      for (const output of action.outputs) {
        // first: figure out if we've seen this output already
        if (!output.doi && !output.id) {
          continue;
        }
        const haveSeenDoi = output.doi && seenDois.has(output.doi);
        const haveSeenId = output.id && seenDois.has(output.id);

        // If it's new, Make a node
        if (!haveSeenDoi && !haveSeenId) {
          if (output.doi) {
            seenDois.add(output.doi);
          }
          if (output.id) {
            seenDois.add(output.id);
          }

          const thisId = output.doi || output.id || "";

          graph.setNode(thisId, { label: thisId, width, height });

          for (const input of step.inputs) {
            if (input.doi) {
              graph.setEdge(input.doi, thisId);
            }
          }
        }
      }
    }
  }

  Dagre.layout(graph);
  graph.nodes().forEach(function (v) {
    console.log("Node " + v + ": " + JSON.stringify(graph.node(v)));
  });
  graph.edges().forEach(function (e) {
    console.log(
      "Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(graph.edge(e)),
    );
  });
}
