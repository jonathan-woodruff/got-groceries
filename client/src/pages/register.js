/* sign-up page */

import React, { useState } from 'react';
import Layout from '../components/layout';
import { onRegistration } from '../api/auth';
import { useDispatch, useSelector } from 'react-redux';
import { authenticateUser, notSSO } from '../redux/slices/authSlice';
import GoogleButton from 'react-google-button'
import {
  Button,
  CssBaseline,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';


function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://jonathan-woodruff.github.io">
        Jonathan Woodruff
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const defaultTheme = createTheme();

const Register = () => {
    const [values, setValues] = useState({
      email: '',
      password: ''
    });
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    const dispatch = useDispatch();

    const handleChange = (e) => {
      setValues({ ...values, [e.target.name]: e.target.value});
      return console.log(values)
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const { data } = await onRegistration(values);
        setError('');
        setSuccess(data.message);
        setValues({ email: '', password: '' });
        dispatch(notSSO());
        dispatch(authenticateUser());
        localStorage.setItem('isAuth', 'true');
      } catch(error) {
        console.log(error.response.data.errors[0].msg); //error from axios
        setError(error.response.data.errors[0].msg);
        setSuccess('');
      }
    };

    const { serverURL } = useSelector(state => state.glob);

    const google = () => {
      window.open(`${serverURL}/auth/google`, '_self'); //server call
    };

    return (
      <Layout>
        <ThemeProvider theme={defaultTheme}>
          <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
              sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography component="h1" variant="h5">
                Sign up
              </Typography>
              <Box component="form" noValidate onSubmit={ (e) => handleSubmit(e) } sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      value={ values.email }
                      autoComplete="email"
                      onChange={ (e) => handleChange(e) }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      value={ values.password }
                      autoComplete="new-password"
                      onChange={ (e) => handleChange(e) }
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign Up
                </Button>
                <Grid container justifyContent="center">
                  <Grid item>
                    <Link href="/login" variant="body2">
                      Already have an account? Log in
                    </Link>
                  </Grid>
                </Grid>
                <div style={{ color: 'red', margin: '10px 0', textAlign: 'center' }}>{ error }</div>
                <div style={{ color: 'green', margin: '10px 0', textAlign: 'center' }}>{ success }</div>
              </Box>
              <Typography component="h2" variant="h6" sx={{ margin: '20px 0 10px 0', fontWeight: 'normal' }}>
                Or...
              </Typography>
              <GoogleButton onClick={ () => google() } />
            </Box>
            <Copyright sx={{ mt: 5 }} />
          </Container>
        </ThemeProvider>
      </Layout>
    )
  };
  
  export default Register;