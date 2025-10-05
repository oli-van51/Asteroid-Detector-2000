import './world_map.js'
import { stopAnimation, startAnimation, updateOrbitData } from './orbit.js'

fetch("/data")
    .then(resp => resp.json())
    .then(data => {
        console.log(data);

        updateOrbitData(data);

        const map_div = document.getElementById("impact-map");

        function OnHover() {
            stopAnimation();
        }

        function OnLeave() {
            startAnimation();
        }

        map_div.addEventListener('mouseenter', OnHover);
        map_div.addEventListener('mouseleave', OnLeave);
    });