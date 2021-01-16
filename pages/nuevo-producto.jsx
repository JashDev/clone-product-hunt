import React, { useState, useContext } from 'react'
import Layout from '../components/layout/Layout'
import {
  Formulario,
  Campo,
  InputSubmit,
  Error,
} from '../components/ui/Formulario'
import { css } from '@emotion/core'
import firebase, { FirebaseContext } from '../firebase'
import useValidation from '../hooks/useValidation'
import { validarCrearProducto } from '../validacion/validarCrearProducto'
import Router, { useRouter } from 'next/router'
import { route } from 'next/dist/next-server/server/router'
import FileUploader from 'react-firebase-file-uploader'
import Error404 from '../components/layout/Error404'

const STATE_INICIAL = {
  nombre: '',
  empresa: '',
  // imagen: '',
  url: '',
  descripcion: '',
}

const NuevoProducto = () => {
  const [error, setError] = useState(null)
  const [nombreImagen, setNombreImagen] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [urlImage, setUrlImage] = useState('')

  const {
    valores,
    errores,
    handleSubmit,
    handleChange,
    handleBlur,
  } = useValidation(STATE_INICIAL, validarCrearProducto, enviarCrearProducto)

  const { nombre, empresa, imagen, url, descripcion } = valores

  const router = useRouter()

  const { usuario, firebase } = useContext(FirebaseContext)

  async function enviarCrearProducto() {
    if (!usuario) {
      router.push('/')
      return
    }

    const producto = {
      nombre,
      empresa,
      url,
      descripcion,
      urlImage,
      votos: 0,
      comentarios: [],
      creado: Date.now(),
      creador: {
        id: usuario.uid,
        nombre: usuario.displayName,
      },
      haVotado: [],
    }

    firebase.db.collection('productos').add(producto)
    router.push('/')
  }

  const handleUploadStart = () => {
    setProgreso(0)
    setSubiendo(true)
  }

  const handleProgress = (progreso) => setProgreso({ progreso })

  const handleUploadError = (error) => {
    setSubiendo(error)
    console.log(error)
  }

  const handleUploadSuccess = (nombre) => {
    setProgreso(100)
    setSubiendo(false)
    setNombreImagen(nombre)

    firebase.storage
      .ref('productos')
      .child(nombre)
      .getDownloadURL()
      .then((url) => {
        setUrlImage(url)
        console.log('adfuasdf')
        console.log(url)
      })
  }

  if (!usuario) {
    return (
      <Layout>
        <Error404 />
      </Layout>
    )
  }

  return (
    <div>
      <Layout>
        <>
          <h1
            css={css`
              text-align: center;
              margin-top: 5rem;
            `}
          >
            Nuevo Producto
          </h1>
          <Formulario onSubmit={handleSubmit} noValidate>
            <fieldset>
              <legend>Info General</legend>
              <Campo>
                <label htmlFor='nombre'>Nombre</label>
                <input
                  type='text'
                  id='nombre'
                  placeholder='Escribe tu nombre'
                  name='nombre'
                  value={nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Campo>

              {errores.nombre && <Error>{errores.nombre}</Error>}

              <Campo>
                <label htmlFor='empresa'>Empresa</label>
                <input
                  type='text'
                  id='empresa'
                  placeholder='Escribe tu empresa'
                  name='empresa'
                  value={empresa}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Campo>

              {errores.empresa && <Error>{errores.empresa}</Error>}

              <Campo>
                <label htmlFor='imagen'>Imagen</label>
                <FileUploader
                  accept='image/*'
                  id='imagen'
                  name='imagen'
                  randomizeFilename
                  storageRef={firebase.storage.ref('productos')}
                  onUploadStart={handleUploadStart}
                  onUploadError={handleUploadError}
                  onUploadSuccess={handleUploadSuccess}
                  onProgress={handleProgress}
                />
              </Campo>

              {errores.imagen && <Error>{errores.imagen}</Error>}

              <Campo>
                <label htmlFor='url'>URL</label>
                <input
                  type='url'
                  id='url'
                  placeholder='URL producto'
                  name='url'
                  value={url}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Campo>

              {errores.url && <Error>{errores.url}</Error>}
            </fieldset>

            <fieldset>
              <legend>Sobre tu producto</legend>

              <Campo>
                <label htmlFor='descripcion'>Descripcion</label>
                <textarea
                  id='descripcion'
                  name='descripcion'
                  value={descripcion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Campo>

              {errores.descripcion && <Error>{errores.descripcion}</Error>}
            </fieldset>

            <InputSubmit type='submit' value='Crear producto' />

            {error && <Error>{error}</Error>}
          </Formulario>
        </>
      </Layout>
    </div>
  )
}

export default NuevoProducto
