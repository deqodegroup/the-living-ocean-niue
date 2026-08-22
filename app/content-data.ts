export const RISK_CONTEXT = {
  annualAverageLossUsd: 900_000,
  label: "national annual average direct loss",
  year: 2011,
  hazards: "earthquakes and tropical cyclones",
  assetContribution: [
    { label: "Buildings", value: 88.8 },
    { label: "Infrastructure", value: 8.9 },
    { label: "Cash crops", value: 2.2 },
  ],
  source: "PCRAFI / GFDRR country risk profile",
} as const;

export const OCEAN_CONTEXT = {
  seaLevelRiseMinCm: 4,
  seaLevelRiseMaxCm: 17,
  projectionYear: 2030,
  scenario: "High-emissions scenario",
  acidificationScenarios: "Low · medium · high",
  source: "Niue NDC 3.0",
} as const;

export const SST_ANOMALY_CONTEXT = {
  indicator: "Mean sea surface temperature anomaly",
  unit: "°C",
  startYear: 1990,
  endYear: 2025,
  ninetiesMean: 0.05,
  recentDecadeMean: 0.63,
  officialDataset: "SPC:DF_CLIMATE_CHANGE(1.0)",
  series: [
    { year: 1990, value: 0 }, { year: 1991, value: 0.1 }, { year: 1992, value: 0.1 },
    { year: 1993, value: -0.2 }, { year: 1994, value: -0.1 }, { year: 1995, value: 0.2 },
    { year: 1996, value: 0.3 }, { year: 1997, value: -0.2 }, { year: 1998, value: -0.2 },
    { year: 1999, value: 0.5 }, { year: 2000, value: 0.6 }, { year: 2001, value: 0.2 },
    { year: 2002, value: 0.4 }, { year: 2003, value: 0.4 }, { year: 2004, value: 0.6 },
    { year: 2005, value: 0.5 }, { year: 2006, value: 0.5 }, { year: 2007, value: 0.5 },
    { year: 2008, value: 0.5 }, { year: 2009, value: 0.4 }, { year: 2010, value: 0.7 },
    { year: 2011, value: 0.8 }, { year: 2012, value: 0.4 }, { year: 2013, value: 0.6 },
    { year: 2014, value: 0.5 }, { year: 2015, value: 0 }, { year: 2016, value: 0.4 },
    { year: 2017, value: 0.7 }, { year: 2018, value: 0.6 }, { year: 2019, value: 0.6 },
    { year: 2020, value: 0.7 }, { year: 2021, value: 0.8 }, { year: 2022, value: 0.9 },
    { year: 2023, value: 0.5 }, { year: 2024, value: 0.6 }, { year: 2025, value: 0.5 },
  ],
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
    "Education, capacity building and awareness — including traditional knowledge — about climate change impacts on oceans and ocean-related livelihoods.",
} as const;

export const SOURCES = [
  {
    title: "Climate Change indicators — Mean sea surface temperature anomalies",
    publisher: "Pacific Community (SPC)",
    year: "1990–2025 slice · dataset modified 2026",
    indicator: "Annual mean sea surface temperature anomaly · Niue",
    processing: "Official 2026 Challenge dataset. Decadal means calculated from 36 annual observations; °C; no missing values.",
    url: "https://stats.pacificdata.org/vis?av=true&df%5Bag%5D=SPC&df%5Bds%5D=SPC2&df%5Bid%5D=DF_CLIMATE_CHANGE&df%5Bvs%5D=1.0&dq=A.SST_ANOM.NU&lc=en&pd=%2C&to%5BTIME_PERIOD%5D=false",
  },
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
    url: "https://niuestatistics.nu/population/niue-census-of-population-and-housing-2022/",
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
    indicator: "Ocean projections and costed conditional climate action",
    processing: "Projections and budget transcribed; finance is shown as a stated need, not expenditure.",
    url: "https://unfccc.int/sites/default/files/2025-07/NIUE%20NDC%203.0.pdf",
  },
] as const;
