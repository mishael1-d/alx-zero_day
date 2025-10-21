// Uses built-in Deno.serve (no std server import)
// Uses npm specifier for supabase-js with explicit version
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

function sanitizeSearchInput(input: unknown): string {
  if (!input || typeof input !== "string") return "";
  return input.replace(/[%_\\]/g, "").trim().substring(0, 100);
}

// Function to generate fuzzy search variations for type filtering
function generateTypeVariations(type: string): string[] {
  const variations = new Set<string>();
  // Add the original type
  variations.add(type.toLowerCase());

  // Common variations for different product types
  const typeMappings: Record<string, string[]> = {
    "t-shirts": [
      "tshirt",
      "tshirts",
      "t-shirt",
      "t-shirts",
      "tee",
      "tees",
      "shirt",
      "shirts",
    ],
    "long sleeves": [
      "long sleeve",
      "longsleeve",
      "long-sleeve",
      "longsleeves",
      "long-sleeves",
    ],
    "tank tops": [
      "tank-top",
      "tanktop",
      "tank-tops",
      "tanktops",
      "tank",
      "tanks",
    ],
    "sweatshirts": [
      "sweatshirt",
      "sweat shirt",
      "sweat-shirt",
      "fleece",
      "hoodie",
      "hoodies",
    ],
    "polo shirts": [
      "polo shirt",
      "poloshirt",
      "polo-shirt",
      "polo",
      "polos",
      "knit",
      "knits",
    ],
    "quarter-zips": [
      "quarter zip",
      "quarterzip",
      "quarter-zip",
      "half-zip",
      "half zip",
      "halfzip",
    ],
    "outerwear": [
      "outer wear",
      "outerwear",
      "jacket",
      "jackets",
      "coat",
      "coats",
    ],
    "performance wear": [
      "performance",
      "athletic",
      "sport",
      "sports",
      "active",
      "workout",
    ],
    "women's": ["womens", "women", "ladies", "female"],
    bottoms: ["bottom", "pants", "pant", "shorts", "short", "trousers"],
    workwear: ["work wear", "work-wear", "work", "industrial", "safety"],
    woven: [
      "dress shirt",
      "dressshirt",
      "dress-shirt",
      "button up",
      "button-up",
    ],
    youth: ["kids", "kid", "children", "child", "junior", "juniors"],
    onesies: ["onesie", "romper", "rompers", "baby", "infant"],
    "tote bags": [
      "tote",
      "totebag",
      "tote-bag",
      "tote",
      "totes",
      "bag",
      "bags",
    ],
    duffel: ["duffel", "duffelbag", "duffel-bag", "duffle", "duffle", "duffels"],
    "golf bags": ["golf", "golfbag", "golf-bag", "golf", "clubs"],
    backpacks: ["backpack", "back pack", "back-pack", "pack", "packs"],
    "drawstring bags": [
      "drawstring bag",
      "drawstringbag",
      "drawstring-bag",
      "drawstring",
      "gym bag",
    ],
    coolers: ["cooler", "lunch bag", "lunchbag", "lunch-bag", "ice chest"],
    "travel bags": [
      "travel bag",
      "travelbag",
      "travel-bag",
      "cosmetic bag",
      "cosmeticbag",
    ],
    wallets: ["wallet", "pouch", "pouches", "money clip", "moneyclip"],
    blankets: ["blanket", "towel", "towels", "throw", "throws"],
    aprons: ["apron", "bib", "bibs", "chef", "kitchen"],
    headbands: ["headband", "head band", "head-band", "sweatband", "sweat band"],
    scarves: ["scarf", "gloves", "glove", "mittens", "mitten"],
    "structured caps": [
      "structured cap",
      "structuredcap",
      "structured-cap",
      "cap",
      "caps",
      "hat",
      "hats",
    ],
    "unstructured caps": [
      "unstructured cap",
      "unstructuredcap",
      "unstructured-cap",
      "dad hat",
      "dadhat",
    ],
    "trucker hats": [
      "trucker",
      "truckerhat",
      "trucker-hat",
      "mesh",
      "meshhat",
    ],
    "performance hats": [
      "performance hat",
      "performancehat",
      "performance-hat",
      "athletic hat",
    ],
    visors: ["visor", "sun visor", "sunvisor", "sun-visor"],
    beanies: [
      "beanie",
      "knit cap",
      "knitcap",
      "knit-cap",
      "winter hat",
      "winterhat",
    ],
    "bucket hats": [
      "bucket",
      "buckethat",
      "bucket-hat",
      "fishing hat",
      "fishinghat",
    ],
    snapbacks: ["snapback", "snap back", "snap-back", "flat brim", "flatbrim"],
    "custom headwear": [
      "custom hat",
      "customhat",
      "custom-hat",
      "specialty hat",
      "specialtyhat",
    ],
    "die-cut stickers": [
      "die cut sticker",
      "diecutsticker",
      "die-cut-sticker",
      "die cut",
      "diecut",
    ],
    "kiss-cut sheets": [
      "kiss cut sheet",
      "kisscutsheet",
      "kiss-cut-sheet",
      "kiss cut",
      "kisscut",
    ],
    "clear stickers": [
      "clear sticker",
      "clearsticker",
      "clear-sticker",
      "transparent sticker",
    ],
    "transfer stickers": [
      "transfer sticker",
      "transfersticker",
      "transfer-sticker",
      "vinyl sticker",
    ],
    "bumper stickers": [
      "bumper sticker",
      "bumpersticker",
      "bumper-sticker",
      "car sticker",
    ],
    "window decals": [
      "window decal",
      "windowdecal",
      "window-decal",
      "window sticker",
      "windowsticker",
    ],
    "floor decals": [
      "floor decal",
      "floordecal",
      "floor-decal",
      "ground sticker",
      "groundsticker",
    ],
    "static clings": [
      "static cling",
      "staticcling",
      "static-cling",
      "cling",
      "clings",
    ],
    "holographic stickers": [
      "holographic sticker",
      "holographicsticker",
      "holographic-sticker",
      "holo sticker",
    ],
    "roll labels": [
      "roll label",
      "rolllabel",
      "roll-label",
      "label roll",
      "labelroll",
    ],
    "vinyl banners": ["vinyl banner", "vinylbanner", "vinyl-banner", "banner", "banners"],
    "retractable banners": [
      "retractable banner",
      "retractablebanner",
      "retractable-banner",
      "pull up banner",
    ],
    "rigid signs": ["rigid sign", "rigidsign", "rigid-sign", "foamcore", "pvc sign"],
    "yard signs": [
      "yard sign",
      "yardsign",
      "yard-sign",
      "lawn sign",
      "lawnsign",
    ],
    posters: ["poster", "print", "prints", "art print", "artprint"],
    "window graphics": [
      "window graphic",
      "windowgraphic",
      "window-graphic",
      "window film",
    ],
    "a-frame signs": [
      "a frame sign",
      "aframesign",
      "a-frame-sign",
      "a frame",
      "aframe",
    ],
    backdrops: ["backdrop", "step and repeat", "stepandrepeat", "step-and-repeat"],
    "trade show displays": [
      "trade show display",
      "tradeshowdisplay",
      "trade-show-display",
      "exhibit",
    ],
    "event tents": ["event tent", "eventtent", "event-tent", "tent", "tents"],
    tablecloths: [
      "tablecloth",
      "table cloth",
      "table-cloth",
      "table runner",
      "tablerunner",
    ],
    drinkware: [
      "drink ware",
      "drink-ware",
      "cup",
      "cups",
      "mug",
      "mugs",
      "bottle",
      "bottles",
    ],
    "tech accessories": [
      "tech accessory",
      "techaccessory",
      "tech-accessory",
      "electronic",
      "electronics",
    ],
    "bags & totes": ["bag", "bags", "tote", "totes", "carry", "carrying"],
    "health & wellness": ["health", "wellness", "medical", "fitness", "wellness product"],
    "outdoor & leisure": ["outdoor", "leisure", "recreation", "camping", "hiking"],
    "golf accessories": ["golf accessory", "golfaccessory", "golf-accessory", "golf", "golfing"],
    "office & desk": ["office", "desk", "workplace", "work station", "workstation"],
    "writing instruments": [
      "writing instrument",
      "writinginstrument",
      "writing-instrument",
      "pen",
      "pens",
      "pencil",
    ],
    keychains: ["keychain", "key chain", "key-chain", "key ring", "keyring"],
    awards: ["award", "trophy", "trophies", "recognition", "certificate"],
    "eco-friendly": ["eco friendly", "ecofriendly", "eco-friendly", "green", "sustainable"],
    "event giveaways": [
      "event giveaway",
      "eventgiveaway",
      "event-giveaway",
      "promotional",
      "promo",
    ],
    "business cards": ["business card", "businesscard", "business-card", "card", "cards"],
    postcards: ["postcard", "post card", "post-card", "mailing card"],
    flyers: ["flyer", "brochure", "brochures", "handout", "handouts"],
    letterhead: ["letter head", "letterhead", "letter-head", "stationery"],
    notepads: ["notepad", "note pad", "note-pad", "pad", "pads"],
    "greeting cards": ["greeting card", "greetingcard", "greeting-card", "card", "cards"],
    booklets: ["booklet", "catalog", "catalogs", "brochure", "brochures"],
    "presentation folders": ["presentation folder", "presentationfolder", "presentation-folder", "folder"],
    labels: ["label", "tag", "tags", "sticker", "stickers"],
    "carbonless forms": ["carbonless form", "carbonlessform", "carbonless-form", "form", "forms"],
    calendars: ["calendar", "cal", "schedule", "planner", "planners"],
  };

  // Add specific variations for the given type
  const specificVariations = typeMappings[type.toLowerCase()];
  if (specificVariations) {
    specificVariations.forEach((variation) => variations.add(variation));
  }

  // Add common word variations
  const words = type.toLowerCase().split(/[\s-]+/);
  words.forEach((word) => {
    variations.add(word);
    // Add plural/singular variations
    if (word.endsWith("s")) {
      variations.add(word.slice(0, -1));
    } else {
      variations.add(word + "s");
    }
  });

  return Array.from(variations);
}

console.info("function started");

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); // Prefer ANON if RLS allows the query

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          error: "Missing Supabase configuration",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
      global: { headers: { "X-Client-Info": "edge-products/1.0.0" } },
    });

    const url = new URL(req.url);
    const sp = url.searchParams;

    const filters = {
      search: sp.get("search") || undefined,
      category: sp.getAll("category").filter((c) => c !== ""),
      type: sp.get("type") || undefined,
      brand: sp.get("brand") || undefined,
      supplier: sp.get("supplier") || undefined,
      color: sp.getAll("color").filter((c) => c !== ""),
      gender: sp.get("gender") || undefined,
      age: sp.get("age") || undefined,
      size: sp.get("size") || undefined,
      keyword: sp.getAll("keyword").filter((k) => k !== ""),
      related: sp.getAll("related").filter((r) => r !== ""),
      serviceMessage: sp.getAll("serviceMessage").filter((m) => m !== ""),
      minPrice: sp.get("minPrice") ? parseFloat(sp.get("minPrice")) : undefined,
      maxPrice: sp.get("maxPrice") ? parseFloat(sp.get("maxPrice")) : undefined,
      isCloseout: sp.get("isCloseout") ? sp.get("isCloseout") === "true" : undefined,
      page: Math.max(1, parseInt(sp.get("page") || "1", 10)),
      limit: Math.min(100, Math.max(1, parseInt(sp.get("limit") || "20", 10))),
      fabric: sp.getAll("fabric").filter((f) => f !== ""),
      style: sp.get("style") || undefined,
      features: sp.get("features") || undefined,
      decorationMethod: sp.get("decorationMethod") || undefined,
      neckline: sp.get("neckline") || undefined,
    } as const;

    // Base query with explicit joins; select only basic columns that exist
    let query = supabase
      .from("new_products")
      .select(
        `
        id,
        product_id,
        product_name,
        brand,
        supplier,
        description,
        product_image_url,
        pixel_url,
        product_categories(category,sub_category),
        product_parts(color_name,size_label,apparel_style)
      `,
        { count: "exact" },
      );

    // Search across columns
    if (filters.search) {
      const q = sanitizeSearchInput(filters.search);
      if (q) {
        query = query.or(
          [
            `product_name.ilike.%${q}%`,
            `description.ilike.%${q}%`,
            `product_id.ilike.%${q}%`,
          ].join(","),
        );
      }
    }

    if (filters.brand && filters.brand !== "all") {
      query = query.ilike("brand", `%${filters.brand}%`);
    }

    if (filters.supplier && filters.supplier !== "all") {
      query = query.eq("supplier", filters.supplier);
    }

    // Fabric filtering - look for keyword in description
    if (filters.fabric.length > 0) {
      const fabricConditions = filters.fabric
        .map((fabric) => `description.ilike.%${fabric}%`)
        .join(",");
      query = query.or(fabricConditions);
    }

    // NEW APPROACH: Get product IDs from relationship tables first, then filter main table
    let productIds: string[] = [];

    // Color filtering - get product IDs from product_parts table
    if (filters.color.length > 0) {
      const colors = filters.color.filter((c) => c && c !== "all");
      if (colors.length > 0) {
        let colorQuery = supabase
          .from("product_parts")
          .select("product_id")
          .in("color_name", colors);

        if (productIds.length > 0) {
          colorQuery = colorQuery.in("product_id", productIds);
        }

        const { data: colorData } = await colorQuery;

        if (colorData && colorData.length > 0) {
          const colorProductIds = colorData.map((item) => item.product_id);
          productIds = productIds.length > 0
            ? productIds.filter((id) => colorProductIds.includes(id))
            : colorProductIds;
        } else {
          return new Response(
            JSON.stringify({
              data: [],
              meta: {
                pagination: {
                  page: filters.page,
                  pageSize: filters.limit,
                  pageCount: 0,
                  total: 0,
                },
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }
      }
    }

    // Size filtering - get product IDs from product_parts table
    if (filters.size && filters.size !== "all") {
      let sizeQuery = supabase
        .from("product_parts")
        .select("product_id")
        .ilike("size_label", `%${filters.size}%`);

      if (productIds.length > 0) {
        sizeQuery = sizeQuery.in("product_id", productIds);
      }

      const { data: sizeData } = await sizeQuery;

      if (sizeData && sizeData.length > 0) {
        const sizeProductIds = sizeData.map((item) => item.product_id);
        productIds = productIds.length > 0
          ? productIds.filter((id) => sizeProductIds.includes(id))
          : sizeProductIds;
      } else {
        return new Response(
          JSON.stringify({
            data: [],
            meta: {
              pagination: {
                page: filters.page,
                pageSize: filters.limit,
                pageCount: 0,
                total: 0,
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    // Style filtering - get product IDs from product_keywords table
    if (filters.style && filters.style !== "all") {
      let styleQuery = supabase
        .from("product_keywords")
        .select("product_id")
        .ilike("keyword", `%${filters.style}%`);

      if (productIds.length > 0) {
        styleQuery = styleQuery.in("product_id", productIds);
      }

      const { data: styleData } = await styleQuery;

      if (styleData && styleData.length > 0) {
        const styleProductIds = styleData.map((item) => item.product_id);
        productIds = productIds.length > 0
          ? productIds.filter((id) => styleProductIds.includes(id))
          : styleProductIds;
      } else {
        return new Response(
          JSON.stringify({
            data: [],
            meta: {
              pagination: {
                page: filters.page,
                pageSize: filters.limit,
                pageCount: 0,
                total: 0,
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    // Features filtering - get product IDs from product_keywords table
    if (filters.features && filters.features !== "all") {
      const featuresList = filters.features.split(",").filter((f) => f.trim());
      if (featuresList.length > 0) {
        let featuresQuery = supabase
          .from("product_keywords")
          .select("product_id")
          .in("keyword", featuresList);

        if (productIds.length > 0) {
          featuresQuery = featuresQuery.in("product_id", productIds);
        }

        const { data: featuresData } = await featuresQuery;

        if (featuresData && featuresData.length > 0) {
          const featuresProductIds = featuresData.map((item) => item.product_id);
          productIds = productIds.length > 0
            ? productIds.filter((id) => featuresProductIds.includes(id))
            : featuresProductIds;
        } else {
          return new Response(
            JSON.stringify({
              data: [],
              meta: {
                pagination: {
                  page: filters.page,
                  pageSize: filters.limit,
                  pageCount: 0,
                  total: 0,
                },
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }
      }
    }

    // Neckline filtering - get product IDs from product_keywords table
    if (filters.neckline && filters.neckline !== "all") {
      let necklineQuery = supabase
        .from("product_keywords")
        .select("product_id")
        .ilike("keyword", `%${filters.neckline}%`);

      if (productIds.length > 0) {
        necklineQuery = necklineQuery.in("product_id", productIds);
      }

      const { data: necklineData } = await necklineQuery;

      if (necklineData && necklineData.length > 0) {
        const necklineProductIds = necklineData.map((item) => item.product_id);
        productIds = productIds.length > 0
          ? productIds.filter((id) => necklineProductIds.includes(id))
          : necklineProductIds;
      } else {
        return new Response(
          JSON.stringify({
            data: [],
            meta: {
              pagination: {
                page: filters.page,
                pageSize: filters.limit,
                pageCount: 0,
                total: 0,
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    // Decoration Method filtering - get product IDs from product_keywords table
    if (filters.decorationMethod && filters.decorationMethod !== "all") {
      let decorationQuery = supabase
        .from("product_keywords")
        .select("product_id")
        .ilike("keyword", `%${filters.decorationMethod}%`);

      if (productIds.length > 0) {
        decorationQuery = decorationQuery.in("product_id", productIds);
      }

      const { data: decorationData } = await decorationQuery;

      if (decorationData && decorationData.length > 0) {
        const decorationProductIds = decorationData.map((item) => item.product_id);
        productIds = productIds.length > 0
          ? productIds.filter((id) => decorationProductIds.includes(id))
          : decorationProductIds;
      } else {
        return new Response(
          JSON.stringify({
            data: [],
            meta: {
              pagination: {
                page: filters.page,
                pageSize: filters.limit,
                pageCount: 0,
                total: 0,
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    // Gender filtering - get product IDs from product_keywords table
    if (filters.gender && filters.gender !== "all") {
      const gender = filters.gender.toLowerCase();
      const genderKeywordMap: Record<string, string[]> = {
        male: ["man", "men", "boy", "male"],
        female: ["woman", "women", "girl", "lady"],
        unisex: ["unisex"],
      };
      const keywords = genderKeywordMap[gender];

      if (keywords && keywords.length > 0) {
        let genderQuery = supabase
          .from("product_keywords")
          .select("product_id")
          .or(keywords.map((k) => `keyword.ilike.%${k}%`).join(","));

        if (productIds.length > 0) {
          genderQuery = genderQuery.in("product_id", productIds);
        }

        const { data: genderData } = await genderQuery;

        if (genderData && genderData.length > 0) {
          const genderProductIds = genderData.map((item) => item.product_id);
          productIds = productIds.length > 0
            ? productIds.filter((id) => genderProductIds.includes(id))
            : genderProductIds;
        } else {
          return new Response(
            JSON.stringify({
              data: [],
              meta: {
                pagination: {
                  page: filters.page,
                  pageSize: filters.limit,
                  pageCount: 0,
                  total: 0,
                },
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }
      }
    }

    // Type filtering - sub_category-first, tightened synonyms, exclusions, apparel-scoped
    if (filters.type && filters.type !== "all") {
      const typeValue = filters.type.toLowerCase().trim();
      const config = getTypeMatchConfig(typeValue);

      // Prefer sub_category matches in product_categories (scoped to apparel when configured)
      let typeCategoryQuery = supabase.from("product_categories").select("product_id");

      if (productIds.length > 0) {
        typeCategoryQuery = typeCategoryQuery.in("product_id", productIds);
      }

      if (config.categoryScope) {
        typeCategoryQuery = typeCategoryQuery.ilike(
          "category",
          `%${config.categoryScope}%`,
        );
      }

      typeCategoryQuery = typeCategoryQuery.or(
        config.synonyms.map((s) => `sub_category.ilike.%${s}%`).join(","),
      );

      for (const ex of config.excludes) {
        typeCategoryQuery = typeCategoryQuery.not(
          "sub_category",
          "ilike",
          `%${ex}%`,
        );
      }

      const { data: typeCatData } = await typeCategoryQuery;

      // Name-based fallback/augment in new_products
      let typeNameQuery = supabase.from("new_products").select("id");

      if (productIds.length > 0) {
        typeNameQuery = typeNameQuery.in("id", productIds);
      }

      typeNameQuery = typeNameQuery.or(
        config.synonyms.map((s) => `product_name.ilike.%${s}%`).join(","),
      );

      for (const ex of config.excludes) {
        typeNameQuery = typeNameQuery.not("product_name", "ilike", `%${ex}%`);
      }

      const { data: typeNameData } = await typeNameQuery;

      const categoryProductIds = typeCatData?.map((r) => r.product_id) ?? [];
      const nameProductIds = typeNameData?.map((r) => r.id) ?? [];
      const typeProductIds = [
        ...new Set<string>([...categoryProductIds, ...nameProductIds]),
      ];

      if (typeProductIds.length > 0) {
        productIds = productIds.length > 0
          ? productIds.filter((id) => typeProductIds.includes(id))
          : typeProductIds;
      } else {
        return new Response(
          JSON.stringify({
            data: [],
            meta: {
              pagination: {
                page: filters.page,
                pageSize: filters.limit,
                pageCount: 0,
                total: 0,
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    // Category filtering LAST - intersect with current productIds if any
    if (filters.category.length > 0) {
      const cats = filters.category.filter(Boolean);
      if (cats.length > 0) {
        let catQuery = supabase
          .from("product_categories")
          .select("product_id")
          .in("category", cats);

        if (productIds.length > 0) {
          catQuery = catQuery.in("product_id", productIds);
        }

        const { data: categoryData } = await catQuery;

        if (categoryData && categoryData.length > 0) {
          const categoryProductIds = categoryData.map((item) => item.product_id);
          productIds = productIds.length > 0
            ? productIds.filter((id) => categoryProductIds.includes(id))
            : categoryProductIds;
        } else {
          return new Response(
            JSON.stringify({
              data: [],
              meta: {
                pagination: {
                  page: filters.page,
                  pageSize: filters.limit,
                  pageCount: 0,
                  total: 0,
                },
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }
      }
    }

    // Apply product ID filter if we have any
    if (productIds.length > 0) {
      query = query.in("id", productIds);
    }

    // Pagination
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    const { data: products, error, count } = await query.range(from, to);

    if (error) {
      console.error("Supabase query error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const totalCount = count || 0;
    const pageCount = Math.ceil(totalCount / filters.limit);

    return new Response(
      JSON.stringify({
        data: products ?? [],
        meta: {
          pagination: {
            page: filters.page,
            pageSize: filters.limit,
            pageCount,
            total: totalCount,
          },
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});

// Config: per-type synonyms, exclusions, and optional category scope
function getTypeMatchConfig(type: string) {
  const normalized = type.toLowerCase();

  // Tighten T-shirt matching and avoid over-broad "shirt"/"shirts"
  if (
    ["t-shirt", "tshirts", "t-shirts", "tshirt", "tee", "tees"].includes(
      normalized,
    )
  ) {
    return {
      synonyms: ["tshirt", "t-shirt", "t shirt", "tee", "tees"],
      excludes: [
        "polo",
        "dress",
        "button",
        "woven",
        "oxford",
        "collar",
        "henley",
        "tank",
      ],
      categoryScope: "apparel",
    } as const;
  }

  // Fallback: use existing variation generator without exclusions
  return {
    synonyms: generateTypeVariations(normalized),
    excludes: [] as string[],
    categoryScope: null as string | null,
  } as const;
}
