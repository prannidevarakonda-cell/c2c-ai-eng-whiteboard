//This will be where the drawing functions will be stored 
const toggle = document.getElementById("palette-toggle");
const picker = document.getElementById("color-picker");
const closeBtn = document.getElementById("close-picker");

toggle.addEventListener("click", () => {
  picker.classList.toggle("hidden");
});

closeBtn.addEventListener("click", () => {
  picker.classList.add("hidden");
});

document.querySelectorAll(".color").forEach((btn) => {
  btn.addEventListener("click", () => {
    const color = btn.dataset.color;
    console.log("Selected color:", color);
    picker.classList.add("hidden");
  });
});