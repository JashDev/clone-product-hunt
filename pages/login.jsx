import React, { useState } from 'react'
import Layout from '../components/layout/Layout'
import {
  Formulario,
  Campo,
  InputSubmit,
  Error,
} from '../components/ui/Formulario'
import { css } from '@emotion/core'
import firebase from '../firebase'
import useValidation from '../hooks/useValidation'
import { validarInciarSesion } from '../validacion/validarIniciarSesion'
import Router from 'next/router'

const STATE_INICIAL = {
  email: '',
  password: '',
}

const Login = () => {
  const [error, setError] = useState(null)

  const {
    valores,
    errores,
    handleSubmit,
    handleChange,
    handleBlur,
  } = useValidation(STATE_INICIAL, validarInciarSesion, iniciarSesion)

  const { nombre, email, password } = valores

  async function iniciarSesion() {
    try {
      await firebase.login(email, password)
      Router.push('/')
    } catch (error) {
      setError(error.message)
    }
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
            Iniciar Sesión
          </h1>
          <Formulario onSubmit={handleSubmit} noValidate>
            <Campo>
              <label htmlFor='email'>Email</label>
              <input
                type='email'
                id='email'
                placeholder='Escribe tu email'
                name='email'
                value={email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Campo>

            {errores.email && <Error>{errores.email}</Error>}

            <Campo>
              <label htmlFor='password'>Password</label>
              <input
                type='password'
                id='password'
                placeholder='Escribe tu password'
                name='password'
                value={password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Campo>

            {errores.password && <Error>{errores.password}</Error>}

            <InputSubmit type='submit' value='Iniciar sesión' />

            {error && <Error>{error}</Error>}
          </Formulario>
        </>
      </Layout>
    </div>
  )
}

export default Login
