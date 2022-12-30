Vue.component("Map", {
  template: `
    <div class="map-container col">
      <div id="map"></div>
    </div>`,
  data() {
    return {
      token:
        "pk.eyJ1IjoiYmVuYm9iIiwiYSI6ImNsYTdwaHYxZzAzOXczbnBiajd4dGY0dmoifQ.WG0YjdTUn9uqchxX9YFgaQ",
      map: {},
    };
  },
  mounted() {
    mapboxgl.accessToken = this.token;

    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/benbob/clbs6pvt6000515pbjslxd3l3",
      center: [121.128, 23.633],
      zoom: 7,
    });

    map.on("load", async () => {
      const gj = {
        type: "FeatureCollection",
        features: [],
      };

      const hexes = await (await fetch("/hexes")).json();
      hexes.forEach((hex) => {
        gj.features.push(this.hexToFeature(hex));
      });

      map.addSource("hexes", {
        type: "geojson",
        data: gj,
      });

      map.addLayer({
        id: "hexes-layer",
        type: "fill",
        source: "hexes",
        paint: {
          "fill-color": "rgba(255, 255, 255, 0.8)",
          "fill-outline-color": "rgb(0, 0, 0)",
        },
      });

      map.addLayer({
        id: "hexes-sales-layer",
        type: "symbol",
        source: "hexes",
        layout: {
          "text-field": "{count}",
          "text-size": 10,
        },
      });

      map.on("click", "hexes-layer", async (e) => {
        let hexProperties = e.features[0].properties;
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML("Clicked on hex ID: " + hexProperties.id)
          .addTo(map);

        this.clicked(hexProperties);
      });

      map.on("mouseenter", "hexes-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "hexes-layer", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    this.map = map;
  },
  methods: {
    clicked(hexProperties) {
      this.$emit("hexClick", hexProperties);
    },
    hexToFeature(hex) {
      const bounds = h3.cellToBoundary(hex.id);
      const coords = bounds.map((coord) => [coord[1], coord[0]]);
      return {
        type: "Feature",
        properties: {
          id: hex.id,
          count: hex.count,
        },
        geometry: {
          type: "Polygon",
          coordinates: [coords.concat([coords[0]])],
        },
      };
    },
  },
});
