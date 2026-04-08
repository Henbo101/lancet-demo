declare module 'world-atlas/countries-110m.json' {
  import type { Topology, Objects } from 'topojson-specification';
  const topology: Topology<Objects<Record<string, unknown>>>;
  export default topology;
}
