/* the page that the user sees upon authentication */
/* When the page loads, useEffect will check if the user is authenticated. If so, it will show the private information. If the user is not authenticated, it will log them out */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onDeleteMeal } from '../api/inapp';
import { fetchMeals } from '../api/inapp';
import { unauthenticateUser, notSSO } from '../redux/slices/authSlice';
import { removeMeal } from '../redux/slices/mealsSlice';
import Layout from '../components/layout';
import { useNavigate, createSearchParams } from 'react-router-dom';
import { logout } from '../utils/index';
import { Button, CssBaseline, Box, Container, Typography, Grid, Paper } from '@mui/material';
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
  const [loading, setLoading] = useState(true);
  const [mealsList, setMealsList] = useState([]);


  const getMeals = async() => {
    try {
      const { data } = await fetchMeals();
      setMealsList(data.meals);
      setLoading(false);
    } catch(error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const initializeStuff = async () => {
      await getMeals();
    }
    initializeStuff();
  }, []);

  const handleClick = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const returnLocation = urlParams.get('return');
    if (returnLocation === 'meals') {
        navigate('/meals');
    }
  };

  const handleDelete = index => async (e) => {
    const mealName = mealsList[index].name;
    const mealId = mealsList[index].id;
    dispatch(removeMeal({ meal: mealName })); //remove meal from selected meals (if the user selected it)
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
      <h1>Loading...</h1>
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
              <Typography component="h2" variant="h6" sx={{ mt: 3 }}>
                Edit or Delete Meals
              </Typography>
              <Grid container spacing={1} alignItems="center">
                { mealsList.map((input, index) => {
                  return (
                    <>
                        <Grid item xs={6} key={index}>
                            <Item>{ mealsList[index].name }</Item>
                        </Grid>
                        <Grid item xs={3} key={index}>
                            <Button onClick={ handleEdit(index) } variant="contained" startIcon={ <EditIcon /> } color="grey">Edit</Button>
                        </Grid>
                        <Grid item xs={3} key={index}>
                            <Button onClick={ handleDelete(index) } variant="contained" startIcon={ <DeleteIcon /> } color="error">Delete</Button>
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