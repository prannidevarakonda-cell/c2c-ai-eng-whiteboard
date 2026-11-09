const canvas = document.getElementById("whiteboard");
const context = canvas.getContext("2d");
const previewCanvas = document.getElementById("ruler-preview");
const previewContext = previewCanvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
previewCanvas.width = window.innerWidth;
previewCanvas.height = window.innerHeight;

const picker = document.getElementById("color-picker");
const eraserButton = document.getElementById("eraser-button");
const paletteToggle = document.getElementById("palette-toggle");
const rulerButton = document.getElementById("Ruler-button");
const saveButton = document.getElementById("save-button");
const loadButton = document.getElementById("load-button");
const drawingFileInput = document.getElementById("drawing-file");
const drawingStatus = document.getElementById("drawing-status");
let color = "#000000";
let drawing = false;
let drawingWithRuler = false;
let erasing = false;
let rulerActive = false;
let drawStart = null;

const markerSizeSlider = document.getElementById("marker-size");

function showDrawingStatus(message) {
  drawingStatus.textContent = message;
}

saveButton.addEventListener("click", async () => {
  saveButton.disabled = true;
  showDrawingStatus("Preparing PNG download...");

  const downloadLink = document.createElement("a");
  downloadLink.href = canvas.toDataURL("image/png");
  downloadLink.download = "whiteboard.png";
  downloadLink.click();

  try {
    const drawing = await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not create a PNG image."));
        }
      }, "image/png");
    });

    if (window.location.protocol === "file:") {
      showDrawingStatus("Drawing downloaded as whiteboard.png.");
      return;
    }

    const response = await fetch("/api/drawing", {
      method: "POST",
      headers: { "Content-Type": "image/png" },
      body: drawing
    });

    if (response.status !== 204) {
      throw new Error(`Save failed (HTTP ${response.status}).`);
    }

    showDrawingStatus("Drawing downloaded and saved to saved_drawing.png.");
  } catch (error) {
    console.warn("Could not save a server copy of the drawing:", error);
    showDrawingStatus("Drawing downloaded as whiteboard.png. Server copy unavailable.");
  } finally {
    saveButton.disabled = false;
  }
});

loadButton.addEventListener("click", () => {
  drawingFileInput.click();
});

drawingFileInput.addEventListener("change", async () => {
  const file = drawingFileInput.files[0];
  if (!file) return;

  showDrawingStatus("Loading drawing...");
  try {
    const image = await createImageBitmap(file);
    try {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    } finally {
      image.close();
    }
    showDrawingStatus("Drawing loaded.");
    setTimeout(() => {
      if (drawingStatus.textContent === "Drawing loaded.") {
        showDrawingStatus("");
      }
    }, 2000);
    
  } catch (error) {
    console.error("Could not load drawing:", error);
    showDrawingStatus(`Could not load drawing: ${error.message}`);
  } finally {
    drawingFileInput.value = "";
  }
});

function getPosition(event) {
  const box = canvas.getBoundingClientRect();

  return {
    x: (event.clientX - box.left) * (canvas.width / box.width),
    y: (event.clientY - box.top) * (canvas.height / box.height)
  };
}

function drawRulerPreview(point) {
  previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  previewContext.lineWidth = Number(markerSizeSlider.value);
  previewContext.lineCap = "round";
  previewContext.strokeStyle = erasing ? "#ffffff" : color;
  previewContext.beginPath();
  previewContext.moveTo(drawStart.x, drawStart.y);
  previewContext.lineTo(point.x, point.y);
  previewContext.stroke();
}

canvas.addEventListener("pointerdown", (event) => {
  drawing = true;
  drawingWithRuler = rulerActive;
  canvas.setPointerCapture(event.pointerId);

  const point = getPosition(event);
  drawStart = point;
  context.lineWidth = Number(markerSizeSlider.value);
  context.beginPath();
  context.moveTo(point.x, point.y);
});

canvas.addEventListener("pointermove", (event) => {
  if (!drawing) return;

  const point = getPosition(event);
  if (drawingWithRuler) {
    drawRulerPreview(point);
    return;
  }

  context.lineCap = "round";
  context.globalCompositeOperation = erasing ? "destination-out" : "source-over";
  context.strokeStyle = color;
  context.lineTo(point.x, point.y);
  context.stroke();
});

canvas.addEventListener("pointerup", (event) => {
  if (drawing && drawingWithRuler && drawStart) {
    const point = getPosition(event);
    previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    context.lineCap = "round";
    context.globalCompositeOperation = erasing ? "destination-out" : "source-over";
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(drawStart.x, drawStart.y);
    context.lineTo(point.x, point.y);
    context.stroke();
  }
  drawing = false;
  drawingWithRuler = false;
  drawStart = null;
});

canvas.addEventListener("pointercancel", () => {
  previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  drawing = false;
  drawingWithRuler = false;
  drawStart = null;
});

document.getElementById("clear-button").addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
});

eraserButton.addEventListener("click", () => {
  erasing = !erasing;
  eraserButton.setAttribute("aria-pressed", String(erasing));
});

rulerButton.addEventListener("click", () => {
  rulerActive = !rulerActive;
  rulerButton.setAttribute("aria-pressed", String(rulerActive));
});

paletteToggle.addEventListener("click", () => {
  picker.classList.toggle("hidden");
  const isOpen = !picker.classList.contains("hidden");
  paletteToggle.setAttribute("aria-expanded", String(isOpen));
  paletteToggle.setAttribute("aria-label", isOpen ? "Close color palette" : "Open color palette");
});

document.getElementById("close-picker").addEventListener("click", () => {
  picker.classList.add("hidden");
  paletteToggle.setAttribute("aria-expanded", "false");
  paletteToggle.setAttribute("aria-label", "Open color palette");
});

document.querySelectorAll(".color").forEach((button) => {
  button.addEventListener("click", () => {
    color = button.dataset.color;
    document.querySelectorAll(".color").forEach((colorButton) => {
      colorButton.setAttribute("aria-pressed", String(colorButton === button));
    });
    picker.classList.add("hidden");
    paletteToggle.setAttribute("aria-expanded", "false");
    paletteToggle.setAttribute("aria-label", "Open color palette");
  });
});