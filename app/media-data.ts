export type EchoMediaScene = {
  id: string;
  title: string;
  file: string;
  role: string;
  dataLayer: string;
  locked: true;
};

/**
 * ECHO production media lock.
 * These filenames correspond to the Work-selected masters.
 * Do not replace, regenerate, recompress, retime, recolour, or substitute.
 */
export const ECHO_MEDIA: EchoMediaScene[] = [
  {
    id: "ocean-wall",
    title: "Ocean Wall",
    file: "/media/echo/kie-seedance-ocean-wall-720p.mp4",
    role: "Entry descent and first reveal of the living ocean",
    dataLayer: "Orientation / entry",
    locked: true,
  },
  {
    id: "dolphin-current",
    title: "Dolphin Current",
    file: "/media/echo/kie-seedance-dolphin-current-720p.mp4",
    role: "Movement, life and ECHO-led travel",
    dataLayer: "Ocean movement / discovery",
    locked: true,
  },
  {
    id: "reef-community",
    title: "Reef Community",
    file: "/media/echo/kie-seedance-reef-community-720p.mp4",
    role: "Dense fish-life ecosystem and interactive discovery",
    dataLayer: "Reef / community context",
    locked: true,
  },
  {
    id: "changing-ocean",
    title: "Changing Ocean",
    file: "/media/echo/kie-seedance-changing-ocean-v2-720p.mp4",
    role: "Climate signal transition",
    dataLayer: "SPC SST anomaly 1990–2025",
    locked: true,
  },
  {
    id: "memory-cavern",
    title: "Memory Cavern",
    file: "/media/echo/kie-seedance-memory-cavern-v2-720p.mp4",
    role: "Culture, people, place and memory",
    dataLayer: "Population / exposure / cultural memory",
    locked: true,
  },
  {
    id: "protected-future",
    title: "Protected Future",
    file: "/media/echo/kie-seedance-protected-future-720p.mp4",
    role: "Agency, resilience and hopeful resolution",
    dataLayer: "Climate finance / future action",
    locked: true,
  },
];
