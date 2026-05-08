export type SitePlanInteractionMode =
  | 'adjust'
  | 'approach'
  | 'setback'
  | 'scale'
  | 'generate'
  | 'upload'
  | 'parking'
  | 'building'
  | 'bike'
  | 'entrances'
  | 'moving'
  | 'sidewalks';

/** Short in-canvas guidance for whatever interaction mode is active */
export const SITE_PLAN_CANVAS_HINTS: Record<SitePlanInteractionMode, string> = {
  upload:
    'Upload an aerial photo, or skip if you prefer to sketch on an empty canvas after closing the parcel.',
  adjust:
    'Trace the parcel: click corners in order; click the first vertex again to close and lock the boundary.',
  scale:
    'Pick the edge along a known real-world distance, toggle it as the scale line, then enter feet and confirm.',
  setback:
    'Move near a boundary: the cursor snaps to the nearest edge, which highlights on the map and in the Edge # list. Click to toggle setback on that edge, then enter distances below.',
  approach:
    'Place the driveway approach from the access street — adjust width using the sidebar controls.',
  parking:
    'Pick the parking lot footprint and stall counts; drag to orient within the parcel.',
  building:
    'Place the footprint inside the parcel: drag corners, edges, and center like a rectangle. Double-click to edit nodes (Shift+click an edge adds a vertex, Esc exits).',
  bike:
    'Place bike parking (experimental) within the parcel perimeter.',
  entrances:
    'Click a building wall to add an entrance; nearby clicks remove existing doors.',
  sidewalks:
    'Entrance mode is active — add entries, then use generated paths as you refine the site plan.',
  moving:
    'Drag elements as needed; building footprints keep rectangle handles until you double-click into node editing (Shift+edge adds vertices, Esc exits).',
  generate: 'Review and generate — adjust parameters in the sidebar.',
};
