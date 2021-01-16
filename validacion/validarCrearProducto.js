export const validarCrearProducto = (valores) => {
  let errores = {}

  if (!valores.nombre) {
    errores.nombre = 'El nombre es obligatorio'
  }

  if (!valores.empresa) {
    errores.empresa = 'Nombre de empresa es obligatorio'
  }

  if (!valores.url) {
    errores.url = 'La URL del producto es obligatoria'
  } else if (!/^(ftp|http|https):\/\/[^ "]+$/.test(valores.url)) {
    errores.url = 'URL no válida'
  }

  if (!valores.descripcion) {
    errores.descripcion = 'Agrega la descipcion de tu producto'
  }

  return errores
}
