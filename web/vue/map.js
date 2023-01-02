Vue.component("Map", {
  template: `
    <div class="map-container col">
      <div id="map"></div>
    </div>`,
  props: ["hexagons"],
  data() {
    return {
      token:
        "pk.eyJ1IjoiYmVuYm9iIiwiYSI6ImNsYTdwaHYxZzAzOXczbnBiajd4dGY0dmoifQ.WG0YjdTUn9uqchxX9YFgaQ",
      map: {},
    };
  },
  watch: {
    hexagons: function (newVal, oldVal) {
      if (oldVal) {
        oldVal.forEach((hexId) => {
          this.map.removeFeatureState(
            { source: "hexes", id: hexId },
            "selected"
          );
        });
      }

      newVal.forEach((hexId) => {
        this.map.setFeatureState(
          { source: "hexes", id: hexId },
          { selected: true }
        );
      });
    },
  },
  mounted() {
    mapboxgl.accessToken = this.token;

    this.map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/benbob/clbs6pvt6000515pbjslxd3l3",
      center: [121.128, 23.633],
      zoom: 7,
    });

    this.map.on("load", async () => {
      const gj = {
        type: "FeatureCollection",
        features: [],
      };

      const hexes = await (await fetch("/hexes")).json();
      hexes.forEach((hex) => {
        gj.features.push(this.hexToFeature(hex));
      });

      this.map.addSource("hexes", {
        type: "geojson",
        data: gj,
      });

      this.map.addLayer({
        id: "hexes-layer",
        type: "fill",
        source: "hexes",
        paint: {
          "fill-color": [
            "case",
            ["boolean", ["feature-state", "selected"], true],
            "rgba(123, 240, 134, 0.5)", //green
            "rgba(255, 255, 255, 0.2)", // white
          ],
          "fill-outline-color": "rgb(0, 0, 0)",
        },
      });

      this.map.addLayer({
        id: "hexes-sales-layer",
        type: "symbol",
        source: "hexes",
        layout: {
          "text-field": "{count}",
          "text-size": 10,
        },
      });

      this.map.on("click", "hexes-layer", async (e) => {
        let hexProperties = e.features[0].properties;
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML("Clicked on hex ID: " + hexProperties.id)
          .addTo(this.map);

        this.clicked(hexProperties);
      });

      this.map.on("mouseenter", "hexes-layer", () => {
        this.map.getCanvas().style.cursor = "pointer";
      });

      this.map.on("mouseleave", "hexes-layer", () => {
        this.map.getCanvas().style.cursor = "";
      });
    });
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
        id: hex.id,
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
