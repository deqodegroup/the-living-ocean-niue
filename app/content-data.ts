export const RISK_CONTEXT = {
  annualAverageLossUsd: 900_000,
  label: "national annual average loss",
  year: 2011,
  assetContribution: [
    { label: "Buildings", value: 88.8 },
    { label: "Infrastructure", value: 8.9 },
    { label: "Cash crops", value: 2.2 },
  ],
  source: "PCRAFI / GFDRR country risk profile",
} as const;

export const EXPOSURE_CONTEXT = {
  censusNightPopulation: 1681,
  villages: 14,
  buildings: 1108,
  majorCropsHectares: 1618,
  replacementValueUsd: 249_000_000,
  exposureYear: 2010,
} as const;

export const FINANCE_CONTEXT = {
  amountUsd: 2_000_000,
  year: 2025,
  status: "Conditional on finance and capacity",
  action:
    "Climate-resilient health infrastructure and systems for vulnerable groups and communities.",
} as const;

export const SOURCES = [
  {
    title: "Annual Average Loss from Tropical Cyclones and Earthquakes at village level for Niue",
    publisher: "Pacific Community (SPC)",
    year: "Issued 2020 · modified 2025",
    indicator: "Annual average direct economic loss",
    processing: "No village loss values copied or inferred.",
    url: "https://pacificdata.org/data/dataset/nu-village-aal-tc-eq-493",
  },
  {
    title: "Country Risk Profile: Niue",
    publisher: "PCRAFI / GFDRR / World Bank",
    year: "2011",
    indicator: "AAL, exposure inventory and return-period loss",
    processing: "Published values transcribed; currency remains USD.",
    url: "https://www.gfdrr.org/en/publication/country-risk-profile-niue",
  },
  {
    title: "2022 Niue Census of Population and Housing",
    publisher: "Statistics Niue Office",
    year: "2022",
    indicator: "Census-night population",
    processing: "Village share calculated against the national census-night total of 1,681.",
    url: "https://niuestatistics.nu/census/population-housing/",
  },
  {
    title: "Niue location map",
    publisher: "Wikimedia Commons contributors",
    year: "Map revised 2020",
    indicator: "Village geometry",
    processing: "Boundary paths converted to WGS84 GeoJSON using published geographic limits; CC BY-SA 2.0.",
    url: "https://commons.wikimedia.org/wiki/File:Niue_location_map.svg",
  },
  {
    title: "Niue NDC 3.0",
    publisher: "Government of Niue / UNFCCC",
    year: "2025",
    indicator: "Costed conditional climate action",
    processing: "Shown as a conditional requirement, not expenditure.",
    url: "https://unfccc.int/sites/default/files/2025-07/NIUE%20NDC%203.0.pdf",
  },
] as const;

