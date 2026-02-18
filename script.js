// Data for vehicles, wraps, and decals (replace URLs with your hosted files)
const cars = [
    { name: 'Dodge Challenger', url: 'path/to/dodge-challenger.glb' }, // Download from https://sketchfab.com/3d-models/dodge-hellcat-srt-by-grid-studios-b412acf943ac4bff8465b19f20a655ff
    { name: 'C7 Corvette', url: 'path/to/c7-corvette.glb' }, // Download from https://sketchfab.com/3d-models/chevrolet-corvette-c7-free-cd0db5aa1dc842d49088f8278bae564d
    { name: 'BMW M2 Comp', url: 'path/to/bmw-m2-comp.glb' } // Download from https://sketchfab.com/3d-models/2018-bmw-m2-competition-30ed9c85be1f44878181d7683b65a068
];

const wraps = [
    { name: 'Carbon Fiber', url: 'https://freepbr.com/wp-content/uploads/2021/02/carbon-fiber-albedo.png' }, // Free public texture
    { name: 'Matte Black', url: 'https://freepbr.com/wp-content/uploads/2014/09/metalbare-albedo.png' }, // Example; replace with actual
    { name: 'Glossy Red', url: 'https://example.com/glossy-red.jpg' } // Placeholder; find free texture online
];

const decals = [
    { name: 'Flame', url: 'https://www.kindpng.com/picc/m/103-1036831_flame-decal-png-transparent-png.png' }, // Example public PNG (check license)
    { name: 'Racing Stripe', url: 'https://example.com/stripe.png' }, // Placeholder; use transparent PNG
    { name: 'Logo', url: 'https://example.com/logo.png' } // Placeholder
];

// Babylon.js setup
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);
let scene, camera, currentModel, bodyMesh, currentDecalUrl = null;

function createScene() {
    scene = new BABYLON.Scene(engine);
    camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

    // Load default model
    loadModel(cars[0].url);

    // Handle decal placement on click
    window.addEventListener('pointerdown', (evt) => {
        if (currentDecalUrl && evt.button === 0) {
            const pickResult = scene.pick(scene.pointerX, scene.pointerY);
            if (pickResult.hit) {
                const decalMaterial = new BABYLON.StandardMaterial('decalMat', scene);
                decalMaterial.diffuseTexture = new BABYLON.Texture(currentDecalUrl, scene);
                decalMaterial.diffuseTexture.hasAlpha = true;
                decalMaterial.zOffset = -2; // Avoid z-fighting

                BABYLON.MeshBuilder.CreateDecal('decal', {
                    sourceMesh: pickResult.pickedMesh,
                    position: pickResult.pickedPoint,
                    normal: pickResult.getNormal(true),
                    size: new BABYLON.Vector3(1, 1, 1), // Adjust size as needed
                    angle: 0
                }, scene).material = decalMaterial;
            }
        }
    });

    return scene;
}

scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener('resize', () => {
    engine.resize();
});

// Load GLB model and find body mesh
function loadModel(url) {
    if (currentModel) currentModel.dispose();
    BABYLON.SceneLoader.ImportMesh('', '', url, scene, (meshes) => {
        currentModel = meshes[0].parent || meshes[0];
        // Assume body mesh is named 'body' or find by name/material; adjust based on model
        bodyMesh = scene.getMeshByName('body') || meshes.find(m => m.material && m.name.includes('body'));
        if (!bodyMesh) alert('Body mesh not found; adjust script for your model.');
    });
}

// Apply wrap texture to body
function applyWrap(url) {
    if (bodyMesh && bodyMesh.material) {
        bodyMesh.material.diffuseTexture = new BABYLON.Texture(url, scene);
    }
}

// Tab switching
let currentTab = 'vehicles';
function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[onclick="switchTab('${tab}')"]`).classList.add('active');
    populateAssets();
}

// Populate left panel based on tab
function populateAssets() {
    const assetsDiv = document.getElementById('main-assets');
    assetsDiv.innerHTML = '';
    let items;
    if (currentTab === 'vehicles') items = cars;
    else if (currentTab === 'wraps') items = wraps;
    else if (currentTab === 'decals') items = decals;

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'asset-item';
        div.innerHTML = `<img src="${item.url}" alt="${item.name}"><br>${item.name}`;
        div.onclick = () => {
            if (currentTab === 'vehicles') loadModel(item.url);
            else if (currentTab === 'wraps') applyWrap(item.url);
            else if (currentTab === 'decals') currentDecalUrl = item.url; // Select for placement
        };
        assetsDiv.appendChild(div);
    });
}

// Initial populate
populateAssets();
