/* the page that the user sees upon authentication */
/* When the page loads, useEffect will check if the user is authenticated. If so, it will show the private information. If the user is not authenticated, it will log them out */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onDeleteMeal } from '../api/inapp';
import { fetchMeals } from '../api/inapp';
import { fetchProtectedInfo, fetchProtectedInfoSSO } from '../api/auth';
import { logout } from '../utils/index';
import { unauthenticateUser, notSSO } from '../redux/slices/authSlice';
import Layout from '../components/layout';
import { Spinner } from '../components/spinner';
import { useNavigate, createSearchParams } from 'react-router-dom';
import { Button, CssBaseline, Box, Container, Typography, Grid, Paper, useMediaQuery, IconButton } from '@mui/material';
import { createTheme, ThemeProvider, experimentalStyled as styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';


const defaultTheme = createTheme();

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: 'theme.palette.text.primary',
  }));

const ManageMeals = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ssoLogin } = useSelector(state => state.auth);
  const matches475 = useMediaQuery('(max-width: 475px)');
  const [loading, setLoading] = useState(true);
  const [mealsList, setMealsList] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emptyList, setEmptyList] = useState(false);

  const checkAuthenticated = async () => {
    try {
      ssoLogin ? await fetchProtectedInfoSSO() : await fetchProtectedInfo();
      setIsAuthenticated(true);
    } catch(error) {
      logout(); //if the user isn't property authenticated using the token on the cookie or there is some other issue, this will force logout thus not allowing a user to gain unauthenticated access
      dispatch(notSSO());
      dispatch(unauthenticateUser());
    }
  };

  const getMeals = async() => {
    try {
      const { data } = await fetchMeals();
      setMealsList([...data.selectedMeals, ...data.mealOptions]);
      if (!data.selectedMeals.length && !data.mealOptions.length) setEmptyList(true);
    } catch(error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuthenticated();
    }
    initializeAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const initializePage = async () => {
        await getMeals();
      }
      initializePage();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (mealsList.length || emptyList) setLoading(false);
  }, [mealsList, emptyList]);

  const handleClick = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const returnLocation = urlParams.get('return');
    if (returnLocation === 'ingredients') {
      navigate('/ingredients');
    } else {
      navigate('/meals')
    }
  };

  const handleDelete = index => async (e) => {
    const mealName = mealsList[index].name;
    const mealId = mealsList[index].id;
    //remove the meal from mealsList
    const data = [...mealsList];
    data.splice(index, 1);
    setMealsList(data);
    try {
        await onDeleteMeal(mealId); //delete from database
    } catch(error) {
        console.log(error);
    }
  };

  const handleEdit = index => async (e) => {
    const mealId = mealsList[index].id;
    const searchQuery = createSearchParams({ id: mealId });
    navigate({
        pathname: '/meals/edit-meal',
        search: `?${searchQuery}`
    });
  };

  return loading ? (
    <Layout>
      <Spinner />
    </Layout>
  ) : (
    <div>
      <Layout>
        <ThemeProvider theme={defaultTheme}>
          <Container component="main" maxWidth="sm">
            <CssBaseline />
            <Box
              sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography component="h2" variant="h6" sx={{ mt: 3, mb: 3 }}>
                Edit or Delete Meals
              </Typography>
              <Grid container spacing={1} alignItems="center">
                { mealsList.map((input, index) => {
                  return (
                    <>
                        <Grid item xs={7} key={mealsList[index].name}>
                            <Item>{ mealsList[index].name }</Item>
                        </Grid>
                        <Grid item xs={2.5} key={'edit ' + mealsList[index].name}>
                            { matches475 ? 
                            <IconButton>
                              <EditIcon 
                                onClick={ handleEdit(index) } 
                                variant="contained" 
                                color="grey" 
                              />
                            </IconButton> :
                            <Button 
                              onClick={ handleEdit(index) } 
                              fullWidth
                              variant="contained" 
                              startIcon={ <EditIcon /> } 
                              color="grey"
                            >
                              Edit
                            </Button>
                            }
                        </Grid>
                        <Grid item xs={2.5} key={'delete ' + mealsList[index].name}>
                            { matches475 ? 
                            <IconButton>
                              <DeleteIcon 
                                onClick={ handleDelete(index) } 
                                variant="contained" 
                                color="error" 
                              />
                            </IconButton> :
                            <Button 
                              onClick={ handleDelete(index) } 
                              fullWidth
                              variant="contained" 
                              startIcon={ <DeleteIcon /> } 
                              color="error"
                            >
                              Delete
                            </Button>
                            }
                        </Grid>
                    </>
                  )
                })
                }   
              </Grid>
              <Button onClick={ handleClick } variant="contained" sx={{ mt: 5 }}>
                Continue
              </Button>
            </Box>
          </Container>
        </ThemeProvider >
      </Layout>
    </div>
  )
  
};

export default ManageMeals;