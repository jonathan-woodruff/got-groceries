/* the page that the user sees upon authentication */
/* When the page loads, useEffect will check if the user is authenticated. If so, it will show the private information. If the user is not authenticated, it will log them out */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/layout';
import { unauthenticateUser, notSSO } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { createMealValidation } from '../validation/forms';
import { onCreateMeal, getMealIngredients, onEditMeal, onEditMealUnchangedName } from '../api/inapp';
import { logout } from '../utils/index';
import {
  Button,
  CssBaseline,
  TextField,
  Box,
  Select,
  MenuItem,
  Typography,
  Container,
  IconButton
} from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const defaultTheme = createTheme();

const CreateEditMeal = (props) => {
  const isEditing = props.isEditing;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ssoLogin} = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [protectedData, setProtectedData] = useState(null);
  const [mealName, setMealName] = useState('');
  const [mealNameError, setMealNameError] = useState(false);
  const [startingMealName, setStartingMealName] = useState('');
  const [ingredientError, setIngredientError] = useState(false);
  const [ingredientIndexError, setIngredientIndexError] = useState(null);
  const [ingredientIndexErrorMessage, setIngredientIndexErrorMessage] = useState('');
  const [mealNameErrorMessage, setMealNameErrorMessage] = useState('');
  const [ingredientErrorMessage, setIngredientErrorMessage] = useState('');
  const [quantityError, setQuantityError] = useState(null);
  const [quantityErrorMessage, setQuantityErrorMessage] = useState('');
  const [values, setValues] = useState([
    { name: '', quantity: '1', category: 'produce', used: false, showRemove: false }
  ]);

  useEffect(() => {
    async function loadData() {
        if (isEditing) {
            const urlParams = new URLSearchParams(window.location.search);
            const mealId = urlParams.get('id');
            try {
                const response = await getMealIngredients(mealId); //get ingredients from database
                const mealIngredients = response.data.ingredients;
                const mealName = response.data.mealName;
                //add key-value pairs
                mealIngredients.forEach((ingredientRow, index) => {
                    ingredientRow['used'] = true;
                    index === 0 ? ingredientRow['showRemove'] = false : ingredientRow['showRemove'] = true;
                });
                mealIngredients.push({ name: '', quantity: '1', category: 'produce', used: false, showRemove: false}); //add blank row
                setValues(mealIngredients);
                setMealName(mealName);
                setStartingMealName(mealName);
                setLoading(false);
            } catch(error) {
                console.log(error);
            }
        } else{
            setLoading(false);
        }
    }
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    //validate input client side
    const [message, indexData] = createMealValidation(mealName, values);
    if (message === 'meal name') {
      setMealNameError(true);
      setMealNameErrorMessage('Please enter a meal name');
    } else if (message === 'ingredient') {
      setIngredientError(true);
      setIngredientErrorMessage('Please enter at least one ingredient');
    } else if (message === 'quantity') {
        setQuantityError(indexData);
        setQuantityErrorMessage('Enter a quantity');
    } else if (message === 'ingredient index') {
        setIngredientIndexError(indexData);
        setIngredientIndexErrorMessage('Duplicate ingredient name');
    } else { //message === 'valid'
      //save the meal to the database
      try {
        if (isEditing) {
            const urlParams = new URLSearchParams(window.location.search);
            const mealId = urlParams.get('id');
            startingMealName.toLowerCase() === mealName.toLowerCase() ?
                await onEditMealUnchangedName({ //don't bother checking for name duplicate
                    mealId: mealId,
                    mealName: mealName,
                    values: values
                }) :
                await onEditMeal({ //check for name duplicate
                    mealId: mealId,
                    mealName: mealName,
                    values: values
                });
            navigate(-1);
        } else {
            await onCreateMeal({
                mealName: mealName, 
                values: values
            });
            navigate('/meals');
        }
      } catch(error) {
        setMealNameError(true);
        setMealNameErrorMessage(error.response.data.errors[0].msg); //error from axios
      }
    }
  };

  const handleChange = index => (e) => {
    //set the state value to whatever the user entered
    const data = [...values];
    data[index][e.target.name] = e.target.value;
    setValues(data);
    if (e.target.name === 'name') {
      setIngredientError(false);
      setIngredientErrorMessage('');
      setIngredientIndexError(null);
      setIngredientIndexErrorMessage('');
    } else if (e.target.name === 'quantity' && index === quantityError) {
        setQuantityError(null);
        setQuantityErrorMessage('');
    }
    //if the ingredients row is new/unchanged until now, flag it as changed and add a new row for the user
    if (!data[index]['used']) {
      data[index]['used'] = true;
      if (index !== 0) data[index]['showRemove'] = true;
      setValues([...values, { name: '', quantity: '1', category: 'produce', used: false, showRemove: false}]);
    }
  };

  const handleRemove = index => (e) => {
    setIngredientIndexError(null);
    setIngredientIndexErrorMessage('');
    const data = [...values];
    data.splice(index, 1);
    setValues(data);
  }

  const handleMealNameChange = (e) => {
    setMealName(e.target.value);
    setMealNameError(false);
    setMealNameErrorMessage('');
  };

  return loading ? (
    <Layout>
      <h1>Loading...</h1>
    </Layout>
  ) : (
    <div>
      <Layout>
        <ThemeProvider theme={defaultTheme}>
          <Container component="main">
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
                {isEditing ? 'Edit Meal' : 'Create a Meal'}
              </Typography>
              <Box component="form" onSubmit={ (e) => handleSubmit(e) } noValidate sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="mealName"
                  label="Meal Name"
                  name="mealName"
                  value={ mealName }
                  onChange={ (e) => handleMealNameChange(e) }
                  autoComplete="Meal Name"
                  error={ mealNameError }
                  helperText={ mealNameErrorMessage }
                  autoFocus
                />
                <Box sx={{ display: 'flex', alignItems: 'center'}}>
                    <Box sx={{ mt: 2 }}>
                    { values.map((input, index) => {
                        return (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ mt: 0 }}>
                              <TextField 
                                margin="normal"
                                id="name"
                                label="Ingredient"
                                name="name"
                                value={ values[index].name }
                                onChange={ handleChange(index) }
                                autoComplete="Ingredient"
                                error={ ingredientError || ingredientIndexError === index ? true : false }
                                helperText={ ingredientErrorMessage ? ingredientErrorMessage : (ingredientIndexError === index ? ingredientIndexErrorMessage : '') }
                                sx={{ mr: 1 }}
                              />
                              <TextField 
                                margin="normal"
                                id="quantity"
                                label="Quantity"
                                name="quantity"
                                value={ values[index].quantity }
                                onChange={ handleChange(index) }
                                autoComplete="Quantity" 
                                type="number"
                                InputProps={{ inputProps: { min: 1 } }}   
                                error={ quantityError === index ? true: false }
                                helperText={ quantityError === index ? quantityErrorMessage : '' }                            
                                sx={{ mr: 1, width: '80px' }}
                              />
                              <Select
                                  labelId="category"
                                  id="category"
                                  name="category"
                                  value={ values[index].category }
                                  label="Category"
                                  onChange={ handleChange(index) }
                                  sx={{ mt: 2, width: '150px' }}
                              >
                                  <MenuItem value="dairy">Dairy</MenuItem>
                                  <MenuItem value="meat">Meat</MenuItem>
                                  <MenuItem value="produce">Produce</MenuItem>
                                  <MenuItem value=""></MenuItem>
                              </Select>
                              { values[index].showRemove ?
                                <IconButton
                                  aria-label="remove" 
                                  color="primary" 
                                  onClick={ handleRemove(index) }
                                  sx={{ ml: 2 }}
                                >
                                  <RemoveCircleIcon />
                                </IconButton> :
                                <></>
                              }
                            </Box>
                          </Box>
                        )
                      })}
                    </Box>
                </Box>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2, mb: 2 }}
                >
                  { isEditing ? 'Finish Editing' : 'Save and Create' }
                </Button>
              </Box>
            </ Box>
          </ Container>
        </ ThemeProvider >
      </Layout>
    </div>
  )
  
};

export default CreateEditMeal;