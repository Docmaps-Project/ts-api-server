import { ReactiveControllerHost } from "lit";
import { initialState, StatusRenderer, Task } from "@lit-labs/task";
import { Docmap, DocmapT, StepT } from "docmaps-sdk";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

import * as Dagre from "dagre";

export interface FetchDocmapResult {
  rawDocmap: any;
  doi: string;
  steps: StepT[];
  graph: Dagre.graphlib.Graph;
}

type TightlyCoupledWidget = ReactiveControllerHost & {
  serverUrl: string;
};

export class DocmapsFetchingController {
  #task: Task<any>;
  #doi: string = "";
  #widget: TightlyCoupledWidget;

  constructor(widget: TightlyCoupledWidget) {
    this.#widget = widget;
    this.#task = this.createTask(widget);
  }

  private createTask(host: TightlyCoupledWidget) {
    return new Task<[string], FetchDocmapResult>(
      host,
      async ([doi]: [string]) => {
        if (!doi.trim()) {
          return initialState;
        }

        let rawDocmap: any;

        try {
          console.log("about to fetch from server: " + this.#widget.serverUrl);

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
          doi,
        };
      },
      () => [this.doi],
    );
  }

  set doi(doi: string) {
    this.#doi = doi;
    this.#widget.requestUpdate();
  }

  get doi() {
    return this.#doi;
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
  type?: string;
  doi?: string;
  id?: string;
  published?: string;
  url?: URL;
};

function makeGraph(_doi: string, steps: StepT[]): Dagre.graphlib.Graph {
  const graph = new Dagre.graphlib.Graph();
  graph.setGraph({
    nodesep: 20,
  });
  graph.setDefaultEdgeLabel(() => ({}));

  const seenDois: Set<string> = new Set();

  const nodes: { [id: string]: DisplayObject } = {};

  for (const step of steps) {
    for (const action of step.actions) {
      for (const output of action.outputs) {
        const thisId = output.doi || output.id;

        if (!thisId || seenDois.has(thisId)) {
          continue;
        }

        if (output.doi) {
          seenDois.add(output.doi);
        }
        if (output.id) {
          seenDois.add(output.id);
        }

        const type = Array.isArray(output.type) ? output.type[0] : output.type;
        let published: string | undefined = undefined;
        if (output.published) {
          if (output.published instanceof Date) {
            published = formatDate(output.published);
          } else {
            published = output.published;
          }
        }

        nodes[thisId] = {
          type,
          published,
          doi: output.doi,
          id: output.id,
          url: output.url,
        };

        for (const input of step.inputs) {
          const inputId = input.doi || input.id;
          if (inputId) {
            graph.setEdge(inputId, thisId);
          }
        }
      }
    }
  }

  for (const [id, node] of Object.entries(nodes)) {
    const label = Object.entries(node).reduce((acc, [_k, v]) => {
      if (v) {
        return acc + `${_k}: ${v}\n`;
      } else {
        return acc;
      }
    }, "");

    graph.setNode(id, { label, height: 50, class: "type-TOP" });
  }

  graph.nodes().forEach((v) => {
    const node = graph.node(v);
    node.rx = node.ry = 5; // Round the corners of the nodes
  });

  Dagre.layout(graph);
  return graph;
}

function formatDate(date: Date) {
  const yyyy = date.getFullYear();

  // The getMonth() method returns the month (0-11) for the specified date,
  // so you need to add 1 to get the correct month.
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Convert month and day numbers to strings and prefix them with a zero if they're below 10
  let mm = month.toString();
  if (month < 10) {
    mm = "0" + month;
  }

  let dd = day.toString();
  if (day < 10) {
    dd = "0" + day.toString();
  }

  return yyyy + "-" + mm + "-" + dd;
}
