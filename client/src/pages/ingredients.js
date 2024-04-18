/* the page where the user selects ingredients they need to buy */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIngredients, onFinish } from '../api/inapp';
import Layout from '../components/layout';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  CssBaseline, 
  Box, 
  Container, 
  Typography, 
  FormControlLabel, 
  Checkbox, 
  Grid 
} from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const defaultTheme = createTheme();

const Ingredients = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedMealsList } = useSelector(state => state.meals);
  const [loading, setLoading] = useState(true);
  const [droppedMeals, setDroppedMeals] = useState([]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [mealIngredients, setMealIngredients] = useState([]);
  const [droppedIndex, setDroppedIndex] = useState(null);
  const [isValid, setIsValid] = useState(true);


  const handleSelect = index => (e) => {
    if (droppedIndex === index) {
      setDroppedIndex(null);
    } else {
      setDroppedIndex(index);
    }
    const mealId = selectedMealsList[index].id;
    setMealIngredients(ingredientsList.filter(ingredient => ingredient.mealid === mealId));
  };

  const getIngredients = async () => {
    try {
        const { data } = await fetchIngredients();
        const responseArray = data.meals;
        responseArray.forEach(ingredient => {
          ingredient['checked'] = false;
        })
        setIngredientsList(responseArray);
    } catch(error) {
        console.log(error);
    }
  };

  const handleCheck = index => (e) => {
    setIsValid(true);
    setIngredientsList(prevIngredientsList => ([...prevIngredientsList, prevIngredientsList[index].checked = e.target.checked]));
  };

  const handleFinish = async () => {
    const index = ingredientsList.findIndex(ingredient => ingredient.checked);
    if (index === -1) { //user didn't check any boxes
      setIsValid(false);
    } else { //proceed as long as the user checked at least one box
      try {
        await onFinish({ ingredientsList: ingredientsList });
        navigate('/list');
      } catch(error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    const initializeStuff = async () => {
      await getIngredients();
    }
    initializeStuff();
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
                  <>
                  <Button key={index} onClick={ handleSelect(index) } variant="outlined" fullWidth endIcon={ index === droppedIndex ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon /> } sx={{ m: 1, textTransform: 'none', borderRadius: '70px' }} >
                    <Box sx={{ width: '90%' }}>
                        { selectedMealsList[index].name }
                    </Box>
                  </Button>
                  <Grid container spacing={1} alignItems="center">
                    { index === droppedIndex ? 
                        ingredientsList.map((input, index2) => {
                        return (
                          <>
                          { ingredientsList[index2].mealid === selectedMealsList[index].id
                            ? <Grid item xs={4} sx={{ mb: 4 }}>
                                <FormControlLabel control={ <Checkbox onChange={ handleCheck(index2) } checked={ ingredientsList[index2].checked } /> } label={ ingredientsList[index2].ingredientname } />
                              </Grid>
                            : <></>
                          }
                          </>
                        )
                        }) :
                        <></>
                    }
                  </Grid>
                  </>
                )
              })
              }
              <Button onClick={ handleFinish } variant="contained" sx={{ mt: 3, pr: 3, pl: 3 }}>
                Finish
              </Button>
              <Typography variant="body1" color="red" sx={{ mt: 1 }}>
                {isValid ? '' : 'Select at least one ingredient'}
              </Typography>
            </Box>
          </Container>
        </ThemeProvider >
      </Layout>
    </div>
  )
  
};

export default Ingredients;