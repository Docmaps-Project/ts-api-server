import { ReactiveControllerHost } from "lit";
import { initialState, StatusRenderer, Task } from "@lit-labs/task";
import * as D from "docmaps-sdk";
import { ActionT, Docmap, DocmapT, StepT, ThingT } from "docmaps-sdk";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { MakeHttpClient } from "@docmaps/http-client";

import * as Dagre from "dagre";

export interface FetchDocmapResult {
  rawDocmap: any;
  docmapId: string;
  steps: StepT[];
  graph: Dagre.graphlib.Graph;
}

type TightlyCoupledWidget = ReactiveControllerHost & {
  serverUrl: string;
};

export class DocmapsFetchingController {
  #task: Task<any>;
  #docmapId: string = "";
  #widget: TightlyCoupledWidget;

  constructor(widget: TightlyCoupledWidget) {
    this.#widget = widget;
    this.#task = this.createTask(widget);
  }

  private createTask(host: TightlyCoupledWidget) {
    return new Task<[string], FetchDocmapResult>(
      host,
      async ([docmapId]: [string]) => {
        if (!docmapId.trim()) {
          return initialState;
        }

        let rawDocmap: any;

        try {
          console.log("about to fetch from server: " + this.#widget.serverUrl);

          const client = MakeHttpClient({
            baseUrl: this.#widget.serverUrl,
            baseHeaders: {},
          });

          const resp = await client.getDocmapById({
            params: { id: encodeURI(encodeURIComponent(docmapId)) },
          });

          if (resp.status !== 200) {
            throw new Error("Failed to FETCH docmap");
          }

          rawDocmap = resp.body as D.DocmapT;

        } catch {
          throw new Error("Failed to FETCH docmap");
        }

        const steps: StepT[] = getSteps(rawDocmap);
        const graph: any = makeGraph(docmapId, steps);

        return {
          rawDocmap,
          steps,
          graph,
          docmapId: docmapId,
        };
      },
      () => [this.docmapId],
    );
  }

  set docmapId(doi: string) {
    this.#docmapId = doi;
    this.#widget.requestUpdate();
  }

  get docmapId() {
    return this.#docmapId;
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

function thingToDisplayObject(output: ThingT): DisplayObject {
  const type = Array.isArray(output.type) ? output.type[0] : output.type;
  let published: string | undefined = undefined;
  if (output.published) {
    if (output.published instanceof Date) {
      published = formatDate(output.published);
    } else {
      published = output.published;
    }
  }

  return {
    type,
    published,
    doi: output.doi,
    id: output.id,
    url: output.url,
  };
}

function makeGraph(_doi: string, steps: StepT[]): Dagre.graphlib.Graph {
  const graph = new Dagre.graphlib.Graph();
  graph.setGraph({ nodesep: 20 });
  graph.setDefaultEdgeLabel(() => ({}));

  const seenDois: Set<string> = new Set();

  const nodes: { [id: string]: DisplayObject } = {};

  steps.forEach((step) => {
    const inputIds: string[] = step.inputs.map(
      (input: ThingT) => {
        let thisId = input.doi || input.id || generateRandomId();
        const node = thingToDisplayObject(input);

        if (!seenDois.has(thisId)) {
          nodes[thisId] = node;
        }

        if (input.doi) {
          seenDois.add(input.doi);
        }
        if (input.id) {
          seenDois.add(input.id);
        }

        return thisId;
      },
    );

    step.actions.forEach((action: ActionT) => {
      action.outputs.forEach((output: ThingT) => {
        const outputId = output.doi || output.id || generateRandomId();

        if (!seenDois.has(outputId)) {
          nodes[outputId] = thingToDisplayObject(output);
        }

        if (output.doi) {
          seenDois.add(output.doi);
        }
        if (output.id) {
          seenDois.add(output.id);
        }

        inputIds.forEach((inputId) => {
          graph.setEdge(inputId, outputId);
        });
      });
    });
  });

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

function dec2hex(dec: any) {
  return dec.toString(16).padStart(2, "0");
}

function generateRandomId(): string {
  const numCharacters = 40;
  var arr = new Uint8Array(numCharacters / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join("");
}
