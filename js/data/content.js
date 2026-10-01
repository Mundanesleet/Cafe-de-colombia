/* ==========================================================================
   Content & taxonomy — everything that is not a product
   • taxonomy: filter vocabularies (from the client's current storefront)
   • finder:   "Encuentra tu café" cards
   • regions:  "Colombia Cafetera" spotlight (copy from the Stitch design)
   • posts:    blog cards — DEMO articles, not client publications
   ========================================================================== */
(function (CCC) {
  "use strict";

  const taxonomy = {
    /* Same vocabularies as the current comprocafedecolombia.com filters. */
    flavors: ["Chocolate", "Cítrico", "Dulce", "Especias", "Floral", "Frutal", "Frutos secos"],
    roasts: [
      { value: "Ligero", label: "Ligera", note: "Acidez brillante" },
      { value: "Medio", label: "Media", note: "Equilibrio ideal" },
      { value: "Oscuro", label: "Oscura", note: "Cuerpo intenso" },
    ],
    types: [
      { value: "Grano", label: "Grano entero (Para moler fresco)" },
      { value: "Molido", label: "Café Molido" },
      { value: "Soluble", label: "Soluble / Liofilizado" },
    ],
    methods: ["Espresso", "Prensa Francesa", "Filtrado V60", "Chemex", "Moka Italiana"],
    /* Grind options offered on the product page, by product type. */
    grinds: {
      Grano: ["Grano entero"],
      Molido: ["Molienda media", "Fina / Espresso"],
      Soluble: ["Soluble"],
    },
  };

  const finder = [
    {
      id: "sabores",
      facet: "flavors",
      icon: "local-cafe",
      tone: "green",
      title: "Por Perfil de Sabor",
      text: "Elige notas dominantes según la rueda de sabores certificada por catadores.",
      layout: "chips",
      options: taxonomy.flavors,
    },
    {
      id: "tostiones",
      facet: "roasts",
      icon: "flare",
      tone: "gold",
      title: "Por Nivel de Tostión",
      text: "El desarrollo térmico del grano define el balance entre acidez, cuerpo y amargor.",
      layout: "rows",
      options: taxonomy.roasts,
    },
    {
      id: "preparacion",
      facet: "methods",
      icon: "coffee-maker",
      tone: "neutral",
      title: "Por Método de Extracción",
      text: "Optimiza el tamaño de la molienda según tu cafetera de todos los días.",
      layout: "chips",
      options: taxonomy.methods,
    },
    {
      id: "origen",
      facet: "departments",
      icon: "terrain",
      tone: "green",
      title: "Por Terruño & Origen",
      text: "Las cordilleras colombianas aportan identidades microclimáticas irrepetibles.",
      layout: "caps",
      options: ["Huila", "Nariño", "Tolima", "Quindío", "Antioquia", "Cauca"],
    },
  ];

  const regions = [
    {
      id: "central",
      name: "Región Central",
      shortName: "Región Central (Eje)",
      title: "Región Central (Eje Cafetero)",
      tag: "Patrimonio UNESCO",
      tagTone: "secondary",
      summary: "Caldas, Quindío, Risaralda · Notas afrutadas, miel y chocolate.",
      description:
        "Caldas, Quindío y Risaralda. Paisaje Cultural Cafetero declarado Patrimonio de la Humanidad por la UNESCO. Suelos volcánicos fértiles que aportan equilibrio armónico, notas afrutadas y chocolate suave.",
      altitude: "1.300 a 1.950 msnm",
      acidity: "Media-Alta",
      body: "Medio redondo",
      departments: ["Caldas", "Quindío", "Risaralda"],
      image: "assets/images/editorial/region-eje-cafetero.jpg",
      imageAlt: "Hacienda cafetera rodeada de cultivos en las montañas del Eje Cafetero",
    },
    {
      id: "sur",
      name: "Región Sur",
      shortName: "Región Sur (Huila/Nariño)",
      title: "Región Sur (Macizo Colombiano)",
      tag: "Tazas de Excelencia",
      tagTone: "gold",
      summary: "Huila, Nariño, Cauca · Acidez cítrica alta, notas florales y caramelo.",
      description:
        "Huila, Nariño y Cauca. Cafés cultivados en altitudes de hasta 2.300 metros gracias a la cercanía con la línea ecuatorial. Acidez cítrica deslumbrante, florales y dulzura de caramelo.",
      altitude: "1.600 a 2.300 msnm",
      acidity: "Alta brillante",
      body: "Sedoso y prolongado",
      departments: ["Huila", "Nariño", "Cauca"],
      image: "assets/images/editorial/region-montanas-sur.jpg",
      imageAlt: "Laderas cafeteras con recolectores en las montañas del sur de Colombia",
    },
    {
      id: "norte",
      name: "Región Norte",
      shortName: "Región Norte",
      title: "Región Norte (Sierra Nevada y Serranías)",
      tag: "Café Bajo Sombra",
      tagTone: "secondary",
      summary: "Santander, Magdalena, Cesar · Notas a nuez, chocolate amargo y cuerpo denso.",
      description:
        "Santander, Magdalena y Cesar. Café bajo sombra que madura lentamente protegiendo las cuencas hídricas. Cuerpo pronunciado, notas a nueces y chocolate amargo.",
      altitude: "1.000 a 1.700 msnm",
      acidity: "Media-Baja",
      body: "Denso y cremoso",
      departments: ["Santander", "Magdalena", "Cesar"],
      image: "assets/images/editorial/hero-cafetal.jpg",
      imageAlt: "Cafetal en ladera con recolectores y montañas al fondo",
    },
    {
      id: "oriental",
      name: "Región Oriental",
      shortName: "Región Oriental",
      title: "Región Oriental (Andes Centrales y Orientales)",
      tag: "Origen Tolima",
      tagTone: "secondary",
      summary: "Tolima, Cundinamarca, Boyacá · Balance y dulzura cremosa a panela.",
      description:
        "Tolima, Cundinamarca y Boyacá. Microclimas de cordillera profunda con aguas cristalinas. Tazas de balance supremo, caña panelera y aromáticos especiados.",
      altitude: "1.400 a 1.900 msnm",
      acidity: "Media cítrica",
      body: "Medio estructurado",
      departments: ["Tolima", "Cundinamarca", "Boyacá"],
      image: "assets/images/editorial/hero-cafetal-mobile.jpg",
      imageAlt: "Caficultores recolectando cerezas maduras entre los cafetos",
    },
  ];

  /* DEMO articles: titles follow the Stitch design; bodies are placeholder
     editorial copy to be replaced with the client's real blog content. */
  const posts = [
    {
      id: "guia-molienda",
      category: "Guía de Especialidad",
      topic: "Cultura de Barismo",
      title: "Guía de Molienda: Del grano al método ideal según tu cafetera",
      excerpt:
        "Descubre por qué una molienda inadecuada puede arruinar el mejor café especial. Ajusta la granulometría precisa para prensa francesa, Chemex, V60 o espresso doméstico.",
      date: "2026-09-18",
      readTime: "12 min de lectura",
      image: "assets/images/editorial/blog-guia-molienda.jpg",
      imageAlt: "Preparación de café filtrado en V60 con tetera de cuello de cisne",
      featured: true,
      body: [
        "La molienda es la variable que más influye en la extracción. Un mismo café puede saber amargo o ácido solo por el tamaño de la partícula.",
        "Como referencia general: molienda gruesa para prensa francesa, media para métodos de goteo como V60 o Chemex, y fina para espresso y moka.",
        "Si compras café en grano, muélelo justo antes de preparar. Así conservas los aceites aromáticos que se pierden rápidamente tras la molienda.",
      ],
      relatedFilter: { methods: ["Filtrado V60"] },
    },
    {
      id: "cafe-huila",
      category: "Terruño & Varietales",
      topic: "Origen",
      title: "¿Por qué el café del Huila sorprende a catadores internacionales?",
      excerpt:
        "Los cañones térmicos y suelos volcánicos del Macizo explican la concentración de azúcares y acidez frutal.",
      date: "2026-09-02",
      readTime: "8 min de lectura",
      image: "assets/images/editorial/blog-cerezas-huila.jpg",
      imageAlt: "Cerezas de café maduras en la rama con montañas al fondo",
      featured: false,
      body: [
        "La altitud, la luminosidad y las noches frescas ralentizan la maduración de la cereza, lo que favorece la concentración de azúcares.",
        "El resultado suelen ser tazas con acidez brillante, notas frutales y dulzor a caramelo, muy valoradas en catación.",
      ],
      relatedFilter: { departments: ["Huila"] },
    },
    {
      id: "mitos-tostion",
      category: "Mitos del Tueste",
      topic: "Tostión",
      title: "Mitos y verdades sobre el nivel de tostión: ¿El café oscuro tiene más cafeína?",
      excerpt:
        "Desarmamos las creencias populares y te contamos cómo el tueste medio resalta las cualidades de origen.",
      date: "2026-08-21",
      readTime: "6 min de lectura",
      image: "assets/images/editorial/blog-tostion.jpg",
      imageAlt: "Granos de café recién tostados en un tostador artesanal",
      featured: false,
      body: [
        "Una tostión más oscura no significa más cafeína: la diferencia entre niveles de tueste es mínima y depende más de cómo se mide la dosis.",
        "Lo que sí cambia es el sabor. Las tostiones ligeras y medias conservan mejor las notas de origen; las oscuras aportan cuerpo y amargor.",
      ],
      relatedFilter: { roasts: ["Medio"] },
    },
    {
      id: "caficultores-tolima",
      category: "Gente de Origen",
      topic: "Historias",
      title: "La historia de los caficultores de alta montaña en el Tolima",
      excerpt:
        "Familias campesinas que transformaron el paisaje andino en un referente mundial de café orgánico y sostenible.",
      date: "2026-08-05",
      readTime: "10 min de lectura",
      image: "assets/images/editorial/blog-caficultores-tolima.jpg",
      imageAlt: "Caficultor sonriente con una canasta de cerezas de café en la montaña",
      featured: false,
      body: [
        "Detrás de cada taza hay familias que cultivan café por generaciones en laderas de difícil acceso.",
        "Comprar de forma directa ayuda a que más valor llegue a quienes cultivan, y permite conocer la trazabilidad de cada lote.",
      ],
      relatedFilter: { departments: ["Tolima"] },
    },
  ];

  CCC.data = CCC.data || {};
  CCC.data.taxonomy = taxonomy;
  CCC.data.finder = finder;
  CCC.data.regions = regions;
  CCC.data.posts = posts;
})(window.CCC = window.CCC || {});
