var variant_desc = "Chose a particular variant of a border, or set of borders. E.g. `somalia=1` or `somalia=2`. Multiple variants can be semicolon separated."

var config = {
  apiVersion: "v1",
  modules: {
    data: {
      file: "data.js",
      description: "Returns data (such as names and dates) on political entities.",
      parameters: {
        get: {
          data_props: {
            description: "Data to retrieve. Will depend on the dataset, but `shapeid` (corresponding shape in the geo module), `name`, `sdate` (first date the entity should be present on a map), `edate` (last date), will always be available (use the `info` modul to find out more). Properties will be grouped by shape, and each shape will have an array of one or more political entities connected to it.",
            default: "id"
          },
          data_lang: {
            description: "Laguage to use for translatable properties, such as name. Available and default languages will depend on dataset chosen (use the `info` modul to find out more)."
          },
          language: {
            description: "Deprecated. Use data_lang."
          },
          data_variant: {
            description: variant_desc
          }
        }
      }
    },
    "info": {
      file: "info.js",
      description: "Returns metadata on a dataset."
    },
    "geo": {
      file: "geo.js",
      description: "Returns geodata, as geojson or topojson.",
      parameters: {
        get: {
          geo_type: {
            description: "Format. Topojson is significantly smaller, but will take slightly longer for the API to produce.",
            default: "geojson",
            allowed: ["geojson", "topojson"]
          },
          geo_crs: {
            description: "Coordinate reference system. Anything other that wgs84 will be reprojected, and therefore slower.",
            default: "wgs84",
            allowed: ["sweref99", "wgs84", "rt90", "tm35fin"]
          },
          geo_variant: {
            description: variant_desc
          },
          geo_scale: {
            description: "Scale. Use a larger scale for very large or zoomable maps.",
            default: "s",
            allowed: ["s", "m", "l"]
          },
          geo_props: {
            description: "Data from the data module, to include in shape properties",
            default: ""
          },
          geo_lang: {
            description: "Laguage to use for translatable properties, such as name. Available and default languages will depend on dataset chosen (use the `info` modul to find out more).",
          },
          geo_flatten_props: {
            description: "Create a flat entity/property structure, rather than a two or three dimensional? There will not always be a one-to-one relation between geoshapes and data entities, but if you are fetching geo data from only one specific date, it might be useful to flatten the properties. Set this to `true` if you want to use the geodata in e.g. CartoDB. This will flatten not only entities, but also their properties.",
            allowed: ["true", "false"],
            default: "false"
          }
        }
      }
    },
    "svg": {
      file: "svg.js",
      description: "Returns an SVG representation of the borders from a dataset at a certain time.",
      parameters: {
        get: {
          svg_proj: {
            description: "Defaults to the first recommended projection for this dataset. Use the info module to see all recommended projections.",
          },
          projection: {
            description: "Deprecated. Use svg_proj.",
          },
/*          mode: {
            description: "Should we return a fully functional SVG images, or an array of paths for further processing?",
            allowed: ["paths", "full"],
            default: "full"
          },*/
          width: {
            description: "Deprecated. Use svg_width.",
          },
          height: {
            description: "Deprecated. Use svg_height.",
          },
          svg_width: {
            description: "Used for viewport size, and, if mode=full, svg width attribute. (px)",
            default: 600
          },
          svg_height: {
            description: "Used for viewport size, and, if mode=full, svg heigh tattribute. (px)",
            default: 600
          },
          svg_variant: {
            description: variant_desc
          },
          svg_props: {
            description: "Data from the data module, to include as data attributes",
            default: ""
          },
          svg_lang: {
            description: "Laguage to use for translatable properties, such as name. Available and default languages will depend on dataset chosen (use the `info` modul to find out more).",
          },
        }
      }
    }
  },
  datasets: {
    /*
      bbox: always use WGS 84
      recommendedProjections: The first of these this be used as default for SVG maps
    */
    "fi-8": {
      description: "Finnish municipalities, from 2011",
      bbox: [19.1, 59.5, 31.6, 70.1],
      languages: ["sv", "fi", "en", "ru", "se", "et"],
      defaultLanguage: "fi",
      recommendedProjections: ["tm35fin"]
    },
    "se-7": {
      description: "Swedish municipalities, from 1974 (a few borders in southern Sweden still missing from 1973)",
      bbox: [10, 54, 25, 70],
      languages: ["sv", "en", "fi", "se"],
      defaultLanguage: "sv",
      recommendedProjections: ["sweref99tm"]
    },
    "se-4": {
      description: "Swedish counties, from 1968",
      bbox: [10, 54, 25, 70],
      languages: ["sv", "en", "fi", "se"],
      defaultLanguage: "sv",
      recommendedProjections: ["sweref99tm"]
    },
    "us-4": {
      description: "US states",
      bbox: [-125,24,-67,49],
      languages: ["sv", "en", "es", "zh", "fr", "de", "it", "nl", "tl", "vi", "ik", "ko", "ru", "fa", "nv", "th", "chr", "ar"],
      defaultLanguage: "en",
      recommendedProjections: ["albersUsa"]
    },
    "gl-7": {
      description: "Municipalities of Greenland since the home rule",
      bbox: [-74,59.5,-14,84],
      languages: ["kl", "da", "sv", "no", "en"],
      defaultLanguage: "kl",
      recommendedProjections: ["gr96"]
    },
    "world-2": {
      description: "Countries of the world. Generally speaking, de-facto independent nation are included, even if when they enjoy limited international recognition.",
      bbox: [-180, -90, 180, 90],
      languages: ["sv","en","fi","fr","de","es","ru","it","nl","pl","zh","pt","ar","ja","fa","nn","no","he","tr","da","uk","ca","id","hu","vi","ko","et","cs","hi","sr","bg", "nn"],
      defaultLanguage: "en",
      recommendedProjections: ["robinson", "eckert4", "winkel3", "kavrayskiy7", "wagner6", "winkel3-pacific"]
    }
  },
  datasetAliases: {
    "sweden-7": "se-7",
    "sweden7": "se-7",
    "se7": "se-7",

    "finland-8": "fi-8",
    "finland8": "fi-8",
    "fi8": "fi-8",

    "finland": "fi-8",
    "fi": "fi-8",

    "sweden-4": "se-4",
    "sweden4": "se-4",
    "se4": "se-4",

    "sweden": "se-7",
    "se": "se-7",

    "world": "world-2",

    "us4": "us-4",

    "us": "us-4",
  },
  languageFallbacks: { //https://github.com/wikimedia/jquery.i18n/blob/master/src/jquery.i18n.fallbacks.js
    fit: "fi",
    fkv: "fi",
    nn: "no",
    no: "nb",
    sr: "sr-ec",
    uk: "ru",
    zh: "zh-hans",
    kl: "da",
    li: "nl",
    wa: "fr"
  }
}

module.exports = config;