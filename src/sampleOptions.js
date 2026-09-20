let options = document.getElementById("sampleOptions");
let add = document.getElementById("sampleAddOptions");
if (add) {
    add.addEventListener("click", function () {
        let title = prompt("Sample name:") || "Untitled Map";
        var opt = document.createElement('option');
        opt.value = title;
        opt.innerHTML = title;
        options?.appendChild(opt);
    });
}
export {};
//# sourceMappingURL=sampleOptions.js.map