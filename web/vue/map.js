Vue.component("Map", {
  template: `
    <div class="map-container col">
      <div id="map"></div>
    </div>`,
  props: ["hexagons", "info"],
  data() {
    return {
      token:
        "pk.eyJ1IjoiYmVuYm9iIiwiYSI6ImNsYTdwaHYxZzAzOXczbnBiajd4dGY0dmoifQ.WG0YjdTUn9uqchxX9YFgaQ",
      map: {},
      prevHex: [],
      colors: {
        outline: "rgb(0, 0, 0)",
        active: "rgba(123, 240, 134, 0.5)", //green
        inactive: "rgba(255, 255, 255, 0.4)", // white
      },
      allHex: [],
    };
  },
  watch: {
    hexagons(newVal, oldVal) {
      if (newVal.is_heatmap === true) {
          this.allHex.forEach((hexId) => {
            this.map.setFeatureState(
              { source: "hexes", id: hexId },
              { heatvalue: 0 }
            );
          });
          newVal.array.forEach((obj) => {
            const hexId = isNaN(obj.hex) ? Number("0x" + obj.hex.substr(2)) : obj.hex;
            this.map.setFeatureState(
              { source: "hexes", id: hexId },
              { heatvalue: obj.value }
            );
          });
          this.map.setLayoutProperty("heatmap-layer", "visibility", "visible");
      } else {
          if (oldVal.is_heatmap === true)
            this.map.setLayoutProperty("heatmap-layer", "visibility", "none");
          this.colorHex(newVal);
      }
    },
    info(newVal, oldVal) {
    },
  },
  mounted() {
    mapboxgl.accessToken = this.token;

    this.map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/benbob/clbs6pvt6000515pbjslxd3l3",
      center: [121.128, 23.633],
      zoom: 6.8,
    });

    this.map.on("load", async () => {
      const gj = {
        type: "FeatureCollection",
        features: [],
      };

      const hexes = await (await fetch("/hexes")).json();
      hexes.forEach((hex) => {
        const o = this.hexToFeature(hex);
        this.allHex.push(o.id);
        gj.features.push(o);
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
            ["==", ["feature-state", "selected"], 1],
            this.colors.active, // satisfies condition
            this.colors.inactive, // default
          ],
          "fill-outline-color": this.colors.outline,
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

      this.map.addLayer({
        id: "heatmap-layer",
        type: "fill",
        source: "hexes",
        paint: {
          "fill-color": [
            "interpolate-hcl",
            ["linear"],
            ["feature-state", "heatvalue"],
            0,
            "rgba(0, 0, 255, 0.5)",
            1,
            "rgba(255, 0, 0, 0.5)",
          ],
          "fill-outline-color": "rgba(0, 0, 0, 0)",
        },
      });
      this.map.setLayoutProperty("heatmap-layer", "visibility", "none");

      this.map.on("click", "hexes-layer", async (e) => {
        let hexData = e.features[0].properties;
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(
            `<div class="popup-info">
              <span><b>count:</b> ${hexData.count}</span>
            </div>`
          )
          .addTo(this.map);

        this.clicked(hexData);
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
    colorHex(current) {
      if (this.prevHex) {
        this.prevHex.forEach((hexId) => {
          this.map.removeFeatureState(
            { source: "hexes", id: hexId },
            "selected"
          );
        });
        this.prevHex = [];
      }

      current.forEach((hexId) => {
        hexId = isNaN(hexId) ? Number("0x" + hexId.substr(2)) : hexId;
        this.map.setFeatureState(
          { source: "hexes", id: hexId },
          { selected: 1 }
        );
        this.prevHex.push(hexId);
      });
    },
    hexToFeature(hex) {
      const bounds = h3.cellToBoundary(hex.id);
      const coords = bounds.map((coord) => [coord[1], coord[0]]);
      const intid = Number("0x" + hex.id.substr(2));
      return {
        type: "Feature",
        id: intid,
        properties: {
          id: intid,
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
