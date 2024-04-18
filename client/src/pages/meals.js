/* the page that the user sees upon authentication */
/* When the page loads, useEffect will check if the user is authenticated. If so, it will show the private information. If the user is not authenticated, it will log them out */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMeals, putSelected } from '../api/inapp';
import { fetchProtectedInfo, fetchProtectedInfoSSO } from '../api/auth';
import { logout } from '../utils/index';
import { unauthenticateUser, notSSO } from '../redux/slices/authSlice';
import Layout from '../components/layout';
import { useNavigate, createSearchParams } from 'react-router-dom';
import { Button, CssBaseline, Box, Container, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';


const defaultTheme = createTheme();

const Meals = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ssoLogin } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [mealsOptions, setMealsOptions] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emptyLists, setEmptyLists] = useState(false);


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
      setMealsOptions(data.mealOptions);
      setSelectedMeals(data.selectedMeals);
      if(!data.mealOptions.length && !data.selectedMeals.length) setEmptyLists(true);
    } catch(error) {
      logout(); //if the user isn't property authenticated using the token on the cookie or there is some other issue, this will force logout thus not allowing a user to gain unauthenticated access
      dispatch(notSSO());
      dispatch(unauthenticateUser());
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuthenticated();
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const initializePage = async () => {
        await getMeals();
      };
      initializePage();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (mealsOptions.length || selectedMeals.length || emptyLists) setLoading(false);
  }, [mealsOptions, selectedMeals, emptyLists]);

  const handleClick = () => {
    navigate('/meals/create-meal')
  };

  const handleManage = () => {
    const searchQuery = createSearchParams({ return: 'meals' });
    navigate({
      pathname: '/meals/manage-meals',
      search: `?${searchQuery}`
    });
  };

  const handleSelect = index => (e) => {
    const meals = [...mealsOptions];
    const selectedMeal = meals.splice(index, 1);
    setMealsOptions(meals);
    setSelectedMeals([...selectedMeals, selectedMeal[0]]);
    setIsValid(true);
  };

  const handleDeselect = index => (e) => {
    const selected = [...selectedMeals];
    const mealOption = selected.splice(index, 1);
    setSelectedMeals(selected);
    setMealsOptions([...mealsOptions, mealOption[0]]);
  };

  const handleContinue = (e) => {
    if (!selectedMeals.length) {
      setIsValid(false);
    } else {
      const updateDatabase = async () => {
        await putSelected({ meals: selectedMeals });
      };
      updateDatabase();
      navigate('/ingredients');
    }
  };

  const handleBack = (e) => {
    navigate('/list');
  };

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
                Select Meals
              </Typography>
              <Box sx={{ border: '1px solid #676767', width: '100%', minHeight: '200px', mt: 1 }}>
                { mealsOptions.map((input, index) => {
                  return (
                    <Button key={index} variant="outlined" sx={{ m: 1, textTransform: 'none' }} onClick={ handleSelect(index) }>
                      { mealsOptions[index].name }
                    </Button>
                  )
                })
                }
                <Button onClick={ handleClick } variant="contained" sx={{ m: 1 }}>
                  + Create New Meal
                </Button>
                <Button onClick={ handleManage } disabled={ !mealsOptions.length && !selectedMeals.length ? true : false } variant="contained" startIcon={ <SettingsIcon /> } color="grey" sx={{ m: 1 }}>
                  Manage My Meals
                </Button>
              </Box>
              <Typography component="h2" variant="h6" sx={{ mt: 3 }}>
                Meals List
              </Typography>
              <Box sx={{ border: `1px dashed ${isValid ? '#676767' : 'red' }`, width: '100%', minHeight: '200px', mt: 1 }}>
                { selectedMeals.map((input, index) => {
                  return (
                    <Button key={index} variant="outlined" sx={{ m: 1, textTransform: 'none' }} onClick={ handleDeselect(index) }>
                      { selectedMeals[index].name }
                    </Button>
                  )
                })
                }
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 5 }}>
                <Button onClick={ handleBack } variant="contained" color="grey" sx={{ pr: 3, pl: 3, mr: 2 }}>
                  Back
                </Button>
                <Button onClick={ handleContinue } variant="contained" sx={{ pr: 3, pl: 3 }}>
                  Continue
                </Button>
              </Box>
              <Typography variant="body1" color='red' sx={{ mt: 1 }}>
                { isValid ? '' : 'Please select at least one meal' }
              </Typography>
            </Box>
          </Container>
        </ThemeProvider >
      </Layout>
    </div>
  )
  
};

export default Meals;