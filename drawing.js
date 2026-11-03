const canvas = document.getElementById("whiteboard");
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const picker = document.getElementById("color-picker");
let color = "#000000";
let drawing = false;

function getPosition(event) {
  const box = canvas.getBoundingClientRect();

  return {
    x: (event.clientX - box.left) * (canvas.width / box.width),
    y: (event.clientY - box.top) * (canvas.height / box.height)
  };
}

canvas.addEventListener("pointerdown", (event) => {
  drawing = true;
  canvas.setPointerCapture(event.pointerId);

  const point = getPosition(event);
  context.beginPath();
  context.moveTo(point.x, point.y);
});

canvas.addEventListener("pointermove", (event) => {
  if (!drawing) return;

  const point = getPosition(event);
  context.lineWidth = 4;
  context.lineCap = "round";
  context.strokeStyle = color;
  context.lineTo(point.x, point.y);
  context.stroke();
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
});

canvas.addEventListener("pointercancel", () => {
  drawing = false;
});

document.getElementById("clear-button").addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
});

document.getElementById("palette-toggle").addEventListener("click", () => {
  picker.classList.toggle("hidden");
});

document.getElementById("close-picker").addEventListener("click", () => {
  picker.classList.add("hidden");
});

document.querySelectorAll(".color").forEach((button) => {
  button.addEventListener("click", () => {
    color = button.dataset.color;
    picker.classList.add("hidden");
  });
});