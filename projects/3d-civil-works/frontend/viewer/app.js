/**
 * 3D Civil Works Viewer - Main Application
 *
 * SCAFFOLD STATUS: Minimal MVP
 * - File upload and submission
 * - Basic Three.js viewer with placeholder mesh
 * - Simple controls for rotation/zoom
 * - Download functionality stub
 */

// Get API base URL from environment or window config, fallback to localhost
const API_BASE_URL = (() => {
    // Check if API_BASE_URL is set in window config (for HTML embedding)
    if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
        return window.__API_BASE_URL__;
    }
    // Check localStorage for configured URL
    const stored = localStorage.getItem('apiBaseUrl');
    if (stored) {
        return stored;
    }
    // Default fallback for local development
    return "http://localhost:8000";
})();

let viewer = null;
let currentJobId = null;

// Initialize on page load
window.addEventListener("load", () => {
    // Wait for Three.js to load (with timeout)
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds with 100ms checks

    const checkThreeJS = setInterval(() => {
        attempts++;

        if (typeof THREE !== 'undefined') {
            clearInterval(checkThreeJS);
            setupUploadArea();
            setupViewerControls();
            console.log("Three.js loaded successfully");
        } else if (attempts >= maxAttempts) {
            clearInterval(checkThreeJS);
            const statusDiv = document.getElementById("uploadStatus");
            if (statusDiv) {
                showStatus(
                    "Error: Three.js library failed to load. Please check your internet connection or try refreshing the page.",
                    "error"
                );
            }
            console.error("Three.js library failed to load after 5 seconds");
        }
    }, 100);
});

/**
 * Setup upload area drag-and-drop and file selection
 */
function setupUploadArea() {
    console.log("Setting up upload area...");
    const uploadArea = document.getElementById("uploadArea");
    const fileInput = document.getElementById("fileInput");
    const submitBtn = document.getElementById("submitBtn");
    const browseBtn = document.getElementById("browseBtn");
    const statusDiv = document.getElementById("uploadStatus");

    if (!uploadArea || !fileInput || !submitBtn) {
        console.error("Missing DOM elements for upload");
        return;
    }

    // Browse button handler
    if (browseBtn) {
        browseBtn.addEventListener("click", () => fileInput.click());
    }

    // Click to select file (upload area)
    uploadArea.addEventListener("click", () => fileInput.click());

    // Prevent browser default drag-and-drop on entire page
    document.addEventListener("dragover", (e) => e.preventDefault(), false);
    document.addEventListener("drop", (e) => e.preventDefault(), false);

    // Drag and drop on upload area
    uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add("active");
    });

    uploadArea.addEventListener("dragleave", (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove("active");
    });

    uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove("active");

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            // Set file input value (for file picker dialog reference)
            // Then directly upload since we have the files
            uploadFile(files[0]);
        }
    });

    // File input change
    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            submitBtn.disabled = false;
            showStatus(`Selected: ${fileInput.files[0].name}`, "success");
        }
    });

    // Submit button
    submitBtn.addEventListener("click", async () => {
        console.log("Submit clicked");
        if (fileInput.files.length === 0) {
            showStatus("Please select a file first", "error");
            return;
        }

        const file = fileInput.files[0];
        console.log("File selected:", file.name, file.type);

        // Validate file type
        if (!file.type.startsWith("image/")) {
            showStatus("Please upload an image file", "error");
            return;
        }

        // Upload file
        console.log("Uploading file...");
        await uploadFile(file);
    });
}

/**
 * Upload file to backend
 */
async function uploadFile(file) {
    const submitBtn = document.getElementById("submitBtn");
    const statusDiv = document.getElementById("uploadStatus");
    const MAX_FILE_SIZE_MB = 50;

    // Validate file size client-side
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
        showStatus(
            `File too large: ${fileSizeMB.toFixed(1)}MB exceeds ${MAX_FILE_SIZE_MB}MB limit`,
            "error"
        );
        submitBtn.disabled = false;
        return;
    }

    submitBtn.disabled = true;
    showStatus(`Uploading ${file.name}...`, "processing");

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            let errorMsg = "Upload failed";
            try {
                const error = await response.json();
                errorMsg = error.detail || errorMsg;
            } catch (e) {
                // Response was not JSON
                if (response.status === 413) {
                    errorMsg = "File size exceeds server limit";
                } else if (response.status === 400) {
                    errorMsg = "Invalid file format or content";
                }
            }
            throw new Error(errorMsg);
        }

        const result = await response.json();
        currentJobId = result.job_id;

        showStatus(
            `Upload successful! Job ID: ${result.job_id}. Loading mesh...`,
            "success"
        );

        // Load and display mesh
        await loadMesh(result.job_id);

        // Enable download button
        document.getElementById("downloadBtn").disabled = false;

    } catch (error) {
        // Check if it's a network error
        if (error instanceof TypeError) {
            showStatus(
                `Connection error: Cannot reach API at ${API_BASE_URL}. Make sure the backend is running.`,
                "error"
            );
        } else {
            showStatus(`Error: ${error.message}`, "error");
        }
        submitBtn.disabled = false;
    }
}

/**
 * Load and display 3D mesh in viewer
 */
async function loadMesh(jobId) {
    const viewerDiv = document.getElementById("viewer");
    const resetBtn = document.getElementById("resetView");

    try {
        const meshUrl = `${API_BASE_URL}/mesh/${jobId}`;

        // Initialize viewer if not already done
        if (!viewer) {
            viewer = new MeshViewer(viewerDiv);
        }

        // Load GLB mesh
        await viewer.loadMesh(meshUrl);

        viewerDiv.classList.add("loaded");
        resetBtn.disabled = false;

        showStatus("Mesh loaded and ready to inspect", "success");

    } catch (error) {
        showStatus(`Failed to load mesh: ${error.message}`, "error");
    }
}

/**
 * Setup viewer controls (rotate, reset, download)
 */
function setupViewerControls() {
    const resetBtn = document.getElementById("resetView");
    const downloadBtn = document.getElementById("downloadBtn");

    resetBtn.addEventListener("click", () => {
        if (viewer) {
            viewer.resetView();
        }
    });

    downloadBtn.addEventListener("click", () => {
        if (currentJobId) {
            downloadMesh(currentJobId);
        }
    });
}

/**
 * Download 3D mesh
 */
function downloadMesh(jobId) {
    const meshUrl = `${API_BASE_URL}/mesh/${jobId}`;
    const link = document.createElement("a");
    link.href = meshUrl;
    link.download = `model_${jobId}.glb`;
    link.click();
}

/**
 * Show status message
 */
function showStatus(message, type) {
    const statusDiv = document.getElementById("uploadStatus");
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
}

/**
 * Simple Three.js mesh viewer wrapper
 */
class MeshViewer {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mesh = null;
        this.controls = null;

        this.initThreeJS();
    }

    initThreeJS() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);

        // Camera setup
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.set(0, 0, 3);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.innerHTML = "";
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        this.scene.add(directionalLight);

        // Simple orbit controls (manual implementation)
        this.setupControls();

        // Handle window resize
        window.addEventListener("resize", () => this.onWindowResize());

        // Start animation loop
        this.animate();
    }

    setupControls() {
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        this.container.addEventListener("mousedown", (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.container.addEventListener("mousemove", (e) => {
            if (isDragging && this.mesh) {
                const deltaX = e.clientX - previousMousePosition.x;
                const deltaY = e.clientY - previousMousePosition.y;

                this.mesh.rotation.y += deltaX * 0.005;
                this.mesh.rotation.x += deltaY * 0.005;

                previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        });

        this.container.addEventListener("mouseup", () => {
            isDragging = false;
        });

        this.container.addEventListener("wheel", (e) => {
            e.preventDefault();
            this.camera.position.z += e.deltaY * 0.001;
            this.camera.position.z = Math.max(1, Math.min(20, this.camera.position.z));
        });
    }

    async loadMesh(meshUrl) {
        return new Promise((resolve, reject) => {
            // Use Three.js GLTFLoader
            const loader = new THREE.GLTFLoader();

            // Simple fallback: load as Blob and use ObjectURL
            fetch(meshUrl)
                .then((response) => response.blob())
                .then((blob) => {
                    const blobUrl = URL.createObjectURL(blob);
                    loader.load(
                        blobUrl,
                        (gltf) => {
                            // Remove old mesh
                            if (this.mesh) {
                                this.scene.remove(this.mesh);
                            }

                            // Add new mesh
                            this.mesh = gltf.scene;
                            this.scene.add(this.mesh);

                            // Center and scale mesh
                            const box = new THREE.Box3().setFromObject(this.mesh);
                            const center = box.getCenter(new THREE.Vector3());
                            this.mesh.position.sub(center);

                            const size = box.getSize(new THREE.Vector3());
                            const maxDim = Math.max(size.x, size.y, size.z);
                            const scale = 2 / maxDim;
                            this.mesh.scale.multiplyScalar(scale);

                            URL.revokeObjectURL(blobUrl);
                            resolve();
                        },
                        undefined,
                        (error) => {
                            URL.revokeObjectURL(blobUrl);
                            reject(error);
                        }
                    );
                })
                .catch((error) => {
                    reject(new Error(`Failed to fetch mesh: ${error.message}`));
                });
        });
    }

    resetView() {
        if (this.mesh) {
            this.mesh.rotation.set(0, 0, 0);
        }
        this.camera.position.set(0, 0, 3);
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Slow auto-rotation when idle (optional)
        // if (this.mesh) {
        //     this.mesh.rotation.y += 0.001;
        // }

        this.renderer.render(this.scene, this.camera);
    }
}
