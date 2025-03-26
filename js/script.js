let props;

if (window.innerWidth < 600) {
    props = false;
}
else {
    props = true;
}

console.log("Compact is " + props)

// Sticker Map
const sMap = new maplibregl.Map({
    style: 'https://tiles.openfreemap.org/styles/positron',
    center: [151.1868, -33.8883],
    zoom: 12,
    minZoom: 9,
    maxZoom: 18,
    container: 'sticker-map',
    attributionControl: false,
    cooperativeGestures: !props
});

// add attribution
sMap.addControl(new maplibregl.AttributionControl({
    compact: props
}));

// Add zoom controls to the map.
sMap.addControl(new maplibregl.NavigationControl({
    showZoom: true,
    showCompass: true
}), 'top-left');

// add fullscreen control
sMap.addControl(new maplibregl.FullscreenControl());

// Add layers after map loads
sMap.on('load', () => {    
    sMap.addSource('points', {
        'type': 'geojson',
        'data': 'data/small-scale-points.geojson'
    });

    sMap.addLayer({
        'id': 'unsafe-points',
        'type': 'circle',
        'source': 'points',
        'paint': {
            'circle-color': '#D12F49',
            'circle-radius': [
                "interpolate",
                ["exponential", 2],
                ["zoom"],
                0, 0,
                // second arg is diameter in some way (don't know how it translates) -- defaulted to 200 from stackoverflow
                // hack-y but 1620 gives ~200 meter diameter circles
                20,1620 
            ],
            'circle-opacity': 0.95
        },
        'filter': ['==', 'Type', 'Unsafe']
    });

    sMap.addLayer({
        'id': 'safe-points',
        'type': 'circle',
        'source': 'points',
        'paint': {
            'circle-color': '#336FAB',
            'circle-radius': [
                "interpolate",
                ["exponential", 2],
                ["zoom"],
                0, 0,
                // 1620 gives ~200 meter diameter circles
                20, 1620 
            ],
            'circle-opacity': 0.95
        },
        'filter': ['==', 'Type', 'Safe']
    });
});


// Heatmap Map
const hMap = new maplibregl.Map({
    style: 'https://tiles.openfreemap.org/styles/positron',
    center: [151.1868, -33.8883],
    zoom: 12,
    minZoom: 9,
    maxZoom: 18,
    container: 'heat-map',
    attributionControl: false,
    cooperativeGestures: !props
});

// add attribution
hMap.addControl(new maplibregl.AttributionControl({
    compact: props
}));

// Add zoom controls to the map.
hMap.addControl(new maplibregl.NavigationControl({
    showZoom: true,
    showCompass: true
}), 'top-left');

// add fullscreen control
hMap.addControl(new maplibregl.FullscreenControl());

// add layers after map loads
hMap.on('load', () => {
    hMap.addSource('points', {
        'type': 'geojson',
        'data': 'data/small-scale-points.geojson'
    });

    hMap.addLayer({
        'id': 'unsafe-heatmap',
        'type': 'heatmap',
        'source': 'points',
        'layout': {
            // Make the layer visible by default.
            'visibility': 'visible'
        },
        'paint': {
            'heatmap-radius': [
                "interpolate", ["exponential", 2], ["zoom"],
                0, 0,
                20, 6075
            ],
            'heatmap-opacity': 0.7,
            'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0,
                'rgba(254,229,217,0)',
                0.2,
                'rgb(252,187,161)',
                0.4,
                'rgb(252,146,114)',
                0.6,
                'rgb(251,106,74)',
                0.8,
                'rgb(222,45,38)',
                1,
                'rgb(165,15,21)'
            ]
        },
        'filter': ['==', 'Type', 'Unsafe']
    });

    hMap.addLayer({
        'id': 'safe-heatmap',
        'type': 'heatmap',
        'source': 'points',
        'layout': {
            // Make the layer visible by default.
            'visibility': 'visible'
        },
        'paint': {
            'heatmap-radius': [
                "interpolate", ["exponential", 2], ["zoom"],
                0, 0,
                20, 6075
            ],
            'heatmap-opacity': 0.7,
            'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0,
                'rgba(239,243,255,0)',
                0.2,
                'rgb(198,219,239)',
                0.4,
                'rgb(158,202,225)',
                0.6,
                'rgb(107,174,214)',
                0.8,
                'rgb(49,130,189)',
                1,
                'rgb(8,81,156)'
            ]
        },
        'filter': ['==', 'Type', 'Safe']
    });
});

hMap.on('idle', () => {
    const safeHeatmapBtn = document.querySelector('#safe-heatmap-toggle');
    const unsafeHeatmapBtn = document.querySelector('#unsafe-heatmap-toggle');

    const toggleableIds = ['safe-heatmap', 'unsafe-heatmap'];

    for (const id of toggleableIds) {
        button = document.querySelector(`#${id}-toggle`)

        button.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            layerID = (this.id).substring(0, (this.id).length - 7);

            this.classList.toggle("active");

            const visibility = hMap.getLayoutProperty(
                layerID,
                'visibility'
            );

            // Toggle layer visibility by changing the layout object's visibility property.
            if (visibility === 'visible') {
                hMap.setLayoutProperty(layerID, 'visibility', 'none');
            } 
            else {
                hMap.setLayoutProperty(layerID, 'visibility', 'visible');
            }
        }
    }
});

