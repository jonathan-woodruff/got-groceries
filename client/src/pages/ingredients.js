/* the page where the user selects ingredients they need to buy */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIngredients } from '../api/inapp';
import { unauthenticateUser, notSSO } from '../redux/slices/authSlice';
import { addMeal, removeMeal } from '../redux/slices/mealsSlice';
import Layout from '../components/layout';
import { useNavigate, createSearchParams } from 'react-router-dom';
import { logout } from '../utils/index';
import { Button, CssBaseline, Box, Container, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';


const defaultTheme = createTheme();

const Ingredients = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedMealsList } = useSelector(state => state.meals);
  const [loading, setLoading] = useState(true);
  const [droppedMeals, setDroppedMeals] = useState([]);


  const handleManage = () => {
    const searchQuery = createSearchParams({ return: 'meals' });
    navigate({
      pathname: '/meals/manage-meals',
      search: `?${searchQuery}`
    });
  };

  const loadSelected = () => {
    selectedMealsList.forEach(meal => {
        setDroppedMeals(prevDroppedMeals => ([...prevDroppedMeals, { dropDown: false }]));
    });
  };

  const handleSelect = index => (e) => {
    const isDropped = droppedMeals[index]['dropDown'];
    setDroppedMeals([...droppedMeals, droppedMeals[index]['dropDown'] = !isDropped]);
  };

  const getIngredients = async () => {
    try {
        const { data } = await fetchIngredients();
        console.log(data);
    } catch(error) {
        console.log(error);
    }
  };

  useEffect(() => {
    loadSelected();
    getIngredients();
    setLoading(false);
  }, []);


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
                Select Ingredients
              </Typography>
              { selectedMealsList.map((input, index) => {
                return (
                  <Button key={index} onClick={ handleSelect(index) } variant="outlined" fullWidth endIcon={ droppedMeals[index].dropDown ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon /> } sx={{ m: 1, textTransform: 'none', borderRadius: '70px' }} >
                    <Box sx={{ width: '90%' }}>
                        { selectedMealsList[index].name }
                    </Box>
                  </Button>
                  
                )
              })
              }
              <Button variant="contained" sx={{ mt: 3 }}>
                Continue
              </Button>
            </Box>
          </Container>
        </ThemeProvider >
      </Layout>
    </div>
  )
  
};

export default Ingredients;