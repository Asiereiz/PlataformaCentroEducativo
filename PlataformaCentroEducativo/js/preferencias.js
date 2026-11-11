document.addEventListener("DOMContentLoaded", () => {

    aplicarPreferencias();

    const selectModoPantalla = document.getElementById("modoPantalla");
    if(selectModoPantalla){
        selectModoPantalla.addEventListener("change", cambiarColorPantalla);
    }

    const selectTamLetra = document.getElementById("sizeLetra");
    if(selectTamLetra){
        selectTamLetra.addEventListener("change", cambiarTamañoLetra);
    }

});

const CLAVE_TEMA = "tema";
const CLAVE_TAMFUENTE = "tamfuente";

function cambiarColorPantalla(event){
  event.preventDefault();

  const pantalla = document.querySelector("body");
  const modo = document.getElementById("modoPantalla").value;

  localStorage.setItem(CLAVE_TEMA, modo);

  if(modo === "oscuro"){
    pantalla.classList.add("oscuro");
    pantalla.classList.remove("contraste");
  }else if (modo === "contraste"){
    pantalla.classList.remove("oscuro");
    pantalla.classList.add("contraste");
  }else{
    pantalla.classList.remove("oscuro");
    pantalla.classList.remove("contraste");
  }
}

function cambiarTamañoLetra(event){
  event.preventDefault();

  const letra = document.querySelector("body");
  const modo = document.getElementById("sizeLetra").value;

  localStorage.setItem(CLAVE_TAMFUENTE, modo);

  if(modo === "large"){
    letra.classList.add("large");
    letra.classList.remove("small");
  }else if (modo === "small"){
    letra.classList.remove("large");
    letra.classList.add("small");
  }else{
    letra.classList.remove("large");
    letra.classList.remove("small");
  }
}

function aplicarPreferencias() {
  const pantalla = document.querySelector("body");

  const tema = localStorage.getItem(CLAVE_TEMA);
  if (tema === "oscuro") {
    pantalla.classList.add("oscuro");
    pantalla.classList.remove("contraste");
  } else if (tema === "contraste") {
    pantalla.classList.remove("oscuro");
    pantalla.classList.add("contraste");
  }

  const tamfuente = localStorage.getItem(CLAVE_TAMFUENTE);
  if (tamfuente === "large") {
    pantalla.classList.add("large");
    pantalla.classList.remove("small");
  } else if (tamfuente === "small") {
    pantalla.classList.remove("large");
    pantalla.classList.add("small");
  }

  const selectModoPantalla = document.getElementById("modoPantalla");
  if (selectModoPantalla && tema) {
    selectModoPantalla.value = tema;
  }

  const selectTamLetra = document.getElementById("sizeLetra");
  if (selectTamLetra && tamfuente) {
    selectTamLetra.value = tamfuente;
  }
}