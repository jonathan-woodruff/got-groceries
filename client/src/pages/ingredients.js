/* the page where the user selects ingredients they need to buy */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIngredients, onFinish } from '../api/inapp';
import { fetchProtectedInfo, fetchProtectedInfoSSO } from '../api/auth';
import { logout } from '../utils/index';
import { unauthenticateUser, notSSO } from '../redux/slices/authSlice';
import Layout from '../components/layout';
import { Spinner } from '../components/spinner';
import { useNavigate, createSearchParams } from 'react-router-dom';
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
import SettingsIcon from '@mui/icons-material/Settings';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const defaultTheme = createTheme();

const Ingredients = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ssoLogin } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


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

  const handleSelect = index => (e) => {
    const list = [...ingredientsList];
    list[index].isDropped = !list[index].isDropped;
    setIngredientsList(list);
  };

  /* Structure of ingredientsList...
  [
    { -> meal object at index 0
      ingredients: [
        {name: bla, ischecked bla...},
        {name: blad, ischecked: di...}
      ]
    }, 
    ...
  ]
  */
  const getIngredients = async () => {
    try {
        const { data } = await fetchIngredients();
        //organize the ingredients list by meal
        const organizedList = [];
        let mealName, mealIndex, ingredientIndex;
        data.ingredients.forEach(ingredient => {
          mealName = ingredient.mealname;
          mealIndex = organizedList.findIndex(meal => meal.meal === mealName);
          if (mealIndex === -1) {
            organizedList.push({ meal: mealName, isDropped: false, ingredients: [] }); //add the category if it is unique
            mealIndex = organizedList.length - 1;
          }
          //add the ingredient to its respective meal
          organizedList[mealIndex].ingredients.push(ingredient); //add the ingredient
        });
        setIngredientsList(organizedList);
    } catch(error) {
        console.log(error);
    }
  };

  const handleCheck = (index, index2) => (e) => {
    setIsValid(true);
    const list = [...ingredientsList];
    list[index].ingredients[index2].inlist = e.target.checked;
    setIngredientsList(list);
  };

  const handleFinish = async () => {
    const index = ingredientsList.findIndex(meal => meal.ingredients.findIndex(ingredient => ingredient.inlist) !== -1); //find a meal where when you look through the ingredients, there is at least one ingredient checked/inlist
    if (index === -1) { //user didn't check any boxes
      setIsValid(false);
    } else { //proceed as long as the user checked at least one box
      try {
        await onFinish({ ingredientsList: ingredientsList, createList: true });
        navigate('/list');
      } catch(error) {
        console.log(error);
      }
    }
  };

  const handleBack = async () => {
    try {
      await onFinish({ ingredientsList: ingredientsList, createList: false }); //save the user progress but don't actually mark the list as created
      navigate('/meals');
    } catch(error) {
      console.log(error);
    }
  };

  const handleManage = async () => {
    try {
      await onFinish({ ingredientsList: ingredientsList, createList: false }); //save the user progress but don't actually mark the list as created
      const searchQuery = createSearchParams({ return: 'ingredients' });
      navigate({
        pathname: '/meals/manage-meals',
        search: `?${searchQuery}`
      });
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
        await getIngredients();
      }
      initializePage();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (ingredientsList.length) setLoading(false);
  }, [ingredientsList]);


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
                Select Ingredients
              </Typography>
              { ingredientsList.map((input, index) => {
                return (
                  <>
                  <Button key={ingredientsList[index].meal} onClick={ handleSelect(index) } variant="outlined" fullWidth endIcon={ ingredientsList[index].isDropped ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon /> } sx={{ m: 1, textTransform: 'none', borderRadius: '70px' }} >
                    <Box sx={{ width: '90%' }}>
                        { ingredientsList[index].meal }
                    </Box>
                  </Button>
                  <Grid container spacing={1} alignItems="center">
                    { ingredientsList[index].isDropped ? 
                        ingredientsList[index].ingredients.map((input, index2) => {
                        return (
                          <Grid item xs={4} sx={{ mb: 2 }} key={ingredientsList[index].ingredients[index2].ingredientid}>
                            <FormControlLabel control={ <Checkbox onChange={ handleCheck(index, index2) } checked={ ingredientsList[index].ingredients[index2].inlist } /> } label={ ingredientsList[index].ingredients[index2].ingredientname } />
                          </Grid>
                        )
                        }) :
                        <></>
                    }
                  </Grid>
                  </>
                )
              })
              }
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 5 }}>
                <Button onClick={ handleManage } variant="contained" startIcon={ <SettingsIcon /> } color="grey">
                  Manage My Meals
                </Button>
                <Button onClick={ handleBack } variant="contained" color="grey" sx={{ pr: 3, pl: 3, mr: 2, ml: 2 }}>
                  Back
                </Button>
                <Button onClick={ handleFinish } variant="contained" sx={{ pr: 3, pl: 3 }}>
                  Finish
                </Button>
              </Box>
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