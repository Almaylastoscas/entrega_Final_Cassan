const zapatilla = document.getElementById("zapatilla");
const verCarrito = document.getElementById("verCarrito");
const modalContainer = document.getElementById("modal-container");
const cantidadCarrito = document.getElementById("cantidadCarrito");

// Formatiar precio
function formatearPrecio(precio) {
  const moneda = "$";
  const precioAux = formatiar.format(precio);
  return moneda.concat(precioAux);
}

const formatiar = new Intl.NumberFormat({
  style: "currency",
  currency: "USD",
});

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
/*--------------------------------------------------------Get de productos desde archivo JSON----------------------------------------------------------------------------*/
const obtenerProductos = async () => {
  const response = await fetch("../data/productos.json");
  const data = await response.json();

  return data;
};

const renderProductos = () => {
  obtenerProductos().then((response) => {
    let productos = response;

    productos.forEach((e) => {
      let content = document.createElement("div");
      content.className = "card";
      content.innerHTML = `
      <img src="${e.img}"/> 
      <h3>${e.nombre}</h3>
      <p class="precio" >${formatearPrecio(e.precio)}</p>
      `;
      zapatilla.append(content);

      let comprar = document.createElement("button");
      comprar.innerText = "Comprar";
      comprar.className = "comprar";
      content.append(comprar);
      comprar.addEventListener("click", () => {
        Swal.fire({
          position: "center",
          icon: "question",
          title: "Esta seguro de añadir el producto?",
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: "Si",
          cancelButtonText: `Cancelar`,
        }).then((result) => {
          if (result.isConfirmed) {
            const repetido = carrito.some((el) => el.id === e.id);
            if (repetido) {
              carrito.map((element) => {
                if (element.id === e.id) {
                  element.cantidad++;
                }
              });
            } else {
              carrito.push({
                id: e.id,
                img: e.img,
                nombre: e.nombre,
                precio: e.precio,
                cantidad: e.cantidad,
              });
              mostrarCantidad();
              guardarLocal();
            }
          } else if (result.isDenied) {
            Swal.fire("no se guardo", "", "info");
          }
        });
      });
    });
  });
};
renderProductos();

/*-----------------------------------Codigo para ver el carrito---------------------------------*/
const mostrarCarrito = () => {
  modalContainer.innerHTML = "";
  modalContainer.style.display = "flex";
  const modalHeader = document.createElement("div");
  modalHeader.className = "modalHeader";
  modalHeader.innerHTML = `
   <h1 class="modalHeaderTitle" >Carrito</h1>
   `;
  modalContainer.append(modalHeader);
  const modalButton = document.createElement("h1");
  modalButton.innerText = "X";
  modalButton.className = "modalBoton";
  modalHeader.append(modalButton);
  modalButton.addEventListener("click", () => {
    modalContainer.style.display = "none";
  });
  /*--------------------------------------------------contruimos el carrito------------------------------------------------------------------*/
  carrito.forEach((e) => {
    let carritoContent = document.createElement("div");
    carritoContent.className = "modalContent";
    carritoContent.innerHTML = `
    <img src="${e.img}"/>
    <h3>${e.nombre}</h3>
    <p>${e.precio}</p>
    <button class="restar" >➖</button>
    <p> Cantidad : ${e.cantidad}</p>
    <button class="sumar" >➕</button>
    <p>Total $ ${e.cantidad * e.precio}</p>
    <button class="eliminarProducto" >🗑</button>
    
    `;
    modalContainer.append(carritoContent);
    /*------------------------------------------Botones para sumar u restar en el carrito------------------------------------------------*/
    let restar = carritoContent.querySelector(".restar");
    restar.addEventListener("click", () => {
      if (e.cantidad !== 1) {
        e.cantidad--;
      }
      guardarLocal();
      mostrarCarrito();
    });

    let sumar = carritoContent.querySelector(".sumar");
    sumar.addEventListener("click", () => {
      e.cantidad++;

      guardarLocal();
      mostrarCarrito();
    });

    /*------------------------------------------------------Eliminar productos del carritp---------------------------------------------------------*/
    let eliminar = carritoContent.querySelector(".eliminarProducto");
    eliminar.addEventListener("click", () => {
      eliminarProducto(e.id);
    });
  });
  const total = carrito.reduce((acc, el) => acc + el.precio * el.cantidad, 0);

  let totalCompra = document.createElement("div");
  totalCompra.className = "totalContent";
  totalCompra.innerHTML = `<h3>El total a Pagar es: $ ${total} </h3>`;
  modalContainer.append(totalCompra);
  /*-------------------------------Boton para vaciar el carrito----------------------------------------------*/
  let vaciarCarrito = document.createElement("div");
  vaciarCarrito.className = "vaciar";
  vaciarCarrito.innerHTML = `<button class="vaciar" >Vaciar Carrito </button>`;
  modalContainer.append(vaciarCarrito);
  let vaciarCompra = modalContainer.querySelector(".vaciar");
  vaciarCompra.addEventListener("click", () => {
    if (carrito.length === 0) {
      Swal.fire({
        icon: "warning",
        title: " No hay ningun producto en el carrito",
      });
    } else {
      Swal.fire({
        icon: "success",
        title: " El carrito se a vaciado con exito",
      });
      carrito = [];
      guardarLocal();
      mostrarCarrito();
      mostrarCantidad();
    }
  });

  /*---------------------------------------------------Boton para finalizar Compra----------------------------------------*/
  let finalizar = document.createElement("div");
  finalizar.className = "finalizar";
  finalizar.innerHTML = `<button class="fin" >Confirmar</button>`;
  modalContainer.append(finalizar);
  let finalCompra = modalContainer.querySelector(".finalizar");
  finalCompra.addEventListener("click", () => {
    if (carrito.length === 0) {
      Swal.fire({
        icon: "warning",
        title:
          "No hay ningun pruducto en el carrito, Seleccione el producto a Comprar",
      });
    } else {
      Swal.fire({
        icon: "success",
        title: "Su compra se ha procesado con exito",
      });
      carrito = [];
      guardarLocal();
      mostrarCarrito();
      mostrarCantidad();
      modalContainer.style.display = "none";
    }
  });
};

verCarrito.addEventListener("click", mostrarCarrito);
const eliminarProducto = (ida) => {
  const id = carrito.find((el) => el.id === ida);
  carrito = carrito.filter((el) => {
    return el !== id;
  });
  mostrarCantidad();
  guardarLocal();
  mostrarCarrito();
};
/*------------------------------------------------- mostrar la cantidad de productos en el carrito------------------------- */
const mostrarCantidad = () => {
  cantidadCarrito.style.display = "block";
  const carritoLength = carrito.length;
  localStorage.setItem("carritolength", JSON.stringify(carritoLength));
  cantidadCarrito.innerText = JSON.parse(localStorage.getItem("carritolength"));
};

/*-------------------------------agregar persistencia e datos con Local storage-------------------------------------------*/
const guardarLocal = () => {
  localStorage.setItem("carrito", JSON.stringify(carrito));
};
mostrarCantidad();
