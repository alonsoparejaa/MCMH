let cursos = [];
const cursosAprobados = new Set(JSON.parse(localStorage.getItem("aprobados") || "[]"));

function cargarCursos() {
  fetch("cursos.json")
    .then(res => res.json())
    .then(data => {
      cursos = data;
      renderCursos();
    })
    .catch(err => {
      console.error("Error al cargar cursos.json:", err);
      document.getElementById("cursos-container").innerHTML = "<p style='color:red;'>No se pudo cargar cursos.json.</p>";
    });
}

function renderCursos() {
  const container = document.getElementById("cursos-container");
  container.innerHTML = "";

  const ciclos = [...new Set(cursos.map(c => c.ciclo))].sort((a, b) => a - b);

  ciclos.forEach(ciclo => {
    const divCiclo = document.createElement("div");
    divCiclo.classList.add("ciclo");
    divCiclo.innerHTML = `<h2>Ciclo ${ciclo}</h2>`;

    cursos
      .filter(c => c.ciclo === ciclo)
      .forEach(curso => {
        const cumplidos = curso.requisitos.every(req => cursosAprobados.has(req));
        const divCurso = document.createElement("div");
        divCurso.classList.add("curso");
        if (!cumplidos) divCurso.classList.add("disabled");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = cursosAprobados.has(curso.nombre);
        checkbox.disabled = !cumplidos;

        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            cursosAprobados.add(curso.nombre);
          } else {
            cursosAprobados.delete(curso.nombre);
          }
          localStorage.setItem("aprobados", JSON.stringify([...cursosAprobados]));
          renderCursos();
        });

        const label = document.createElement("label");
        label.textContent = curso.nombre;

        divCurso.appendChild(checkbox);
        divCurso.appendChild(label);
        divCiclo.appendChild(divCurso);
      });

    container.appendChild(divCiclo);
  });
}

document.getElementById("reset").addEventListener("click", () => {
  localStorage.removeItem("aprobados");
  cursosAprobados.clear();
  cargarCursos();
});

cargarCursos();
