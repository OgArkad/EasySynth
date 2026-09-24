let up = document.getElementById("tempoUp");
let down = document.getElementById("tempDown");
let value = document.getElementById("tempoValue");

let tempoValue = 100;

if (up && down && value) {
  up.addEventListener("click", function (e) {
    tempoValue++;
    value.textContent = tempoValue.toString();
  });

  down.addEventListener("click", function (e) {
    tempoValue--;
    value.textContent = tempoValue.toString();
  });
}