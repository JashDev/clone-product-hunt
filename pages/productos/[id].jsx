import React, { useEffect, useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { FirebaseContext } from '../../firebase'
import Layout from '../../components/layout/Layout'
import Error404 from '../../components/layout/Error404'
import { css } from '@emotion/core'
import styled from '@emotion/styled'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { es } from 'date-fns/locale'
import { Campo, InputSubmit } from '../../components/ui/Formulario'
import Boton from '../../components/ui/Boton'

const ContenedorProducto = styled.div`
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 2fr 1fr;
    column-gap: 2rem;
  }
`

const CreadorProducto = styled.div`
  padding: 0.5rem 2rem;
  background-color: #da552f;
  color: #fff;
  text-transform: uppercase;
  font-weight: bold;
  display: inline-block;
  text-align: center;
`

const Producto = () => {
  const [producto, setProducto] = useState({})
  const [error, setError] = useState(false)
  const [comentario, setComentario] = useState({})
  const [consultar, setConsultar] = useState(true)

  const router = useRouter()
  const {
    query: { id },
  } = router

  const { firebase, usuario } = useContext(FirebaseContext)

  useEffect(() => {
    if (id) {
      const obtenerProducto = async () => {
        const productoQuery = await firebase.db.collection('productos').doc(id)
        const producto = await productoQuery.get()
        if (producto.exists) {
          setProducto(producto.data())
          setConsultar(false)
        } else {
          setError(true)
        }
      }

      obtenerProducto()
    }
  }, [id, producto])

  const {
    comentarios,
    creado,
    descripcion,
    empresa,
    nombre,
    url,
    urlImage,
    votos,
    creador,
    haVotado,
  } = producto

  const votarProducto = () => {
    if (!usuario) {
      return router.push('/')
    }

    const totalVotos = votos + 1

    if (haVotado.includes(usuario.uid)) {
      console.log('include')
      return
    }

    const hanVotado = [...haVotado, usuario.uid]

    firebase.db.collection('productos').doc(id).update({
      votos: totalVotos,
      haVotado: hanVotado,
    })

    setProducto({
      ...producto,
      votos: totalVotos,
    })

    setConsultar(true)
  }

  const comentarioChange = (e) => {
    setComentario({ ...comentario, [e.target.name]: e.target.value })
  }

  const esCreador = (id) => {
    return creador.id === id
  }

  const agregarComentario = (e) => {
    e.preventDefault()

    if (!usuario) {
      return router.push('/')
    }

    comentario.usuarioId = usuario.uid
    comentario.usuarioNombre = usuario.displayName

    const nuevosComentarios = [...comentarios, comentario]

    firebase.db.collection('productos').doc(id).update({
      comentarios: nuevosComentarios,
    })

    setProducto({
      ...producto,
      comentarios: nuevosComentarios,
    })

    setConsultar(true)
  }

  const puedeBorrar = () => {
    if (!usuario) return false

    return creador.id === usuario.uid
  }

  const eliminarProducto = async () => {
    if (!usuario) {
      return router.push('/')
    }

    if (creador.id !== usuario.uid) {
      return router.push('/')
    }

    try {
      await firebase.db.collection('productos').doc(id).delete()
      router.push('/')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Layout>
      <>
        {error && <Error404 />}

        {Object.keys(producto).length === 0 && !error ? (
          <p>Cargando...</p>
        ) : (
          <div className='contenedor'>
            <h1
              css={css`
                text-align: center;
                margin-top: 5rem;
              `}
            >
              {nombre}
            </h1>

            <ContenedorProducto>
              <div>
                <p>
                  Publicado hace:{' '}
                  {formatDistanceToNow(new Date(creado), {
                    locale: es,
                  })}
                </p>

                <p>
                  Por {creador.nombre} de {empresa}
                </p>

                <img src={urlImage} alt={nombre} />
                <p>{descripcion}</p>

                {usuario && (
                  <>
                    <h2>Agrega tu comentario</h2>
                    <form onSubmit={agregarComentario}>
                      <Campo>
                        <input
                          type='text'
                          name='mensaje'
                          onChange={comentarioChange}
                        />
                      </Campo>
                      <InputSubmit type='submit' value='Agregar comentario' />
                    </form>
                  </>
                )}

                <h2
                  css={css`
                    margin-top: 2rem;
                  `}
                >
                  Comentarios
                </h2>

                {comentarios.map((comentario, i) => (
                  <li
                    key={i}
                    css={css`
                      border: 1px solid #e1e1e1;
                      padding: 2rem;
                    `}
                  >
                    <p>{comentario.mensaje}</p>
                    <p>
                      Escrito por:
                      <span
                        css={css`
                          font-weight: bold;
                        `}
                      >
                        {' '}
                        {comentario.usuarioNombre}
                      </span>
                    </p>

                    {esCreador(comentario.usuarioId) && (
                      <CreadorProducto>Es Creador</CreadorProducto>
                    )}
                  </li>
                ))}
              </div>

              <aside>
                <Boton target='_blank' bgColor href={url}>
                  Visita URL
                </Boton>

                <div
                  css={css`
                    margin-top: 5rem;
                  `}
                >
                  <p
                    css={css`
                      text-align: center;
                    `}
                  >
                    Votos {votos}
                  </p>

                  {usuario && <Boton onClick={votarProducto}>Votar</Boton>}
                </div>
              </aside>
            </ContenedorProducto>

            {puedeBorrar() && (
              <Boton onClick={eliminarProducto}>Eliminar Producto</Boton>
            )}
          </div>
        )}
      </>
    </Layout>
  )
}

export default Producto
