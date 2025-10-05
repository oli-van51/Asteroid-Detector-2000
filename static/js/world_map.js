import { impactRadius, impactForce } from "./orbit.js";

const width = 400;
const height = 400;

const svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

const g = svg.append("g");

function zoomed(event) {
    g.attr("transform", event.transform);
}

const zoom = d3.zoom()
    .scaleExtent([0.5, 50])
    .on("zoom", zoomed);

svg.call(zoom)

const proj = d3.geoMercator()
    .scale(60)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(proj)

d3.json("static/map_cords.json").then(function(geojson) {
    g.selectAll("circle")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "steelblue")
        .attr("stroke", "black")
});

svg.on("click", function(e) {
    g.selectAll(".click-circle").remove();

    const transform = d3.zoomTransform(svg.node());
    const coords = d3.pointer(e, this);
    const mapCoords = transform.invert(coords);

    const lonLat = proj.invert(mapCoords);
    const impactRadKm = impactRadius;

    const radiusDeg = impactRadKm / 111.32;

    const circleGeo = d3.geoCircle()
        .center(lonLat)
        .radius(radiusDeg)();

    const x = mapCoords[0];
    const y = mapCoords[1];

    g.append("path")
        .datum(circleGeo)
        .attr("class", "click-circle")
        .attr("d", path) // Change with datasets
        .attr("fill", "red")
        .attr("stroke", "red")
        .attr("stroke-width", 1);

    console.log("Impact center:", lonLat);
});
