let cursos = [];
const cursosAprobados = new Set(JSON.parse(localStorage.getItem("aprobados") || "[]"));

function cargarCursos() {
  fetch("cursos.json")
    .then(res => res.json())
    .then(data => {
      cursos = data;
      renderCursos();
    });
}

function estaDesbloqueado(curso) {
  if (curso.requisitos.length === 0) return true;
  if (curso.requisitos.includes("TODOS XI")) return verificarTodosCiclos(11);
  if (curso.requisitos.includes("TODOS XII")) return verificarTodosCiclos(12);
  return curso.requisitos.every(reqNombre => {
    const cursoReq = cursos.find(c => c.nombre === reqNombre);
    return cursoReq && cursosAprobados.has(cursoReq.id);
  });
}

function verificarTodosCiclos(cicloMax) {
  const cursosDelCiclo = cursos.filter(c => c.ciclo <= cicloMax);
  return cursosDelCiclo.every(c => cursosAprobados.has(c.id));
}

function renderCursos() {
  const contenedor = document.getElementById("contenedor-cursos");
  contenedor.innerHTML = "";
  cursos.forEach(curso => {
    const aprobado = cursosAprobados.has(curso.id);
    const desbloqueado = estaDesbloqueado(curso);

    const div = document.createElement("div");
    div.className = "curso";
    if (desbloqueado) div.classList.add("desbloqueado");
    else div.classList.add("bloqueado");

    div.innerHTML = `
      <h2>${curso.nombre}</h2>
      <p class="ciclo">Ciclo ${curso.ciclo}</p>
      <label>
        <input type="checkbox" ${aprobado ? "checked" : ""} ${!desbloqueado ? "disabled" : ""}>
        Marcar como aprobado
      </label>
    `;

    const checkbox = div.querySelector("input");
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) cursosAprobados.add(curso.id);
      else cursosAprobados.delete(curso.id);
      localStorage.setItem("aprobados", JSON.stringify([...cursosAprobados]));
      renderCursos(); // Volver a renderizar para actualizar desbloqueo
    });

    contenedor.appendChild(div);
  });
}

document.getElementById("reset").addEventListener("click", () => {
  localStorage.removeItem("aprobados");
  cursosAprobados.clear();
  renderCursos();
});

cargarCursos();
