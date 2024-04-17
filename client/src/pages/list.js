/* the page that the user sees upon authentication */
/* When the page loads, useEffect will check if the user is authenticated. If so, it will show the private information. If the user is not authenticated, it will log them out */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProtectedInfo, fetchProtectedInfoSSO } from '../api/auth';
import { fetchGroceryList } from '../api/inapp';
import Layout from '../components/layout';
import { unauthenticateUser, notSSO } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/index';
import { Button, CssBaseline, Box, Container, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const defaultTheme = createTheme();

const List = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ssoLogin } = useSelector(state => state.auth);
  const { clientURL } = useSelector(state => state.glob);
  const [loading, setLoading] = useState(true);
  const [protectedData, setProtectedData] = useState(null);

  const protectedInfo = async () => {
    try {
      const { data } = ssoLogin ? await fetchProtectedInfoSSO() : await fetchProtectedInfo();
      setProtectedData(data.info);
    } catch(error) {
      logout(); //if the user isn't property authenticated using the token on the cookie or there is some other issue, this will force logout thus not allowing a user to gain unauthenticated access
      dispatch(notSSO());
      dispatch(unauthenticateUser());
    }
  };

  const getGroceryList = async () => {
    const groceryList = await fetchGroceryList();
  };

  useEffect(() => {
    protectedInfo();
    getGroceryList();
    setLoading(false);
  }, []);

  const handleClick = () => {
    navigate(`../meals`)
  }

  return loading ? (
    <Layout>
      <h1>Loading...</h1>
    </Layout>
  ) : (
    <div>
      <Layout>
        <ThemeProvider theme={defaultTheme}>
          <Container component="main" maxWidth="md">
            <CssBaseline />
            <Box
              sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography component="h2" variant="h6" sx={{ mt: 3 }}>
                My Grocery List
              </Typography>
              <Button 
                onClick={ handleClick }
                variant="contained"
                sx={{ mt: 5, mb: 2, pr: 3, pl: 3 }}
              >
                Start a New List
              </Button>

            </ Box>
          </ Container>
        </ ThemeProvider >
      </Layout>
    </div>
  )
  
};

export default List;