/* the page that the user sees upon authentication */
/* When the page loads, useEffect will check if the user is authenticated. If so, it will show the private information. If the user is not authenticated, it will log them out */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProtectedInfo, fetchProtectedInfoSSO, onLogout } from '../api/auth';
import Layout from '../components/layout';
import { unauthenticateUser, notSSO, assignUser } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const defaultTheme = createTheme();

const CreateMeal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ssoLogin } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [protectedData, setProtectedData] = useState(null);
  const [index, setIndex] = useState(0);
  const [mealName, setMealName] = useState('');
  const [values, setValues] = useState([
    { ingredient: '', ingredientQuantity: '', ingredientCategory: 'produce' }
  ]);

  const logout = async () => {
    try {
      await onLogout();
      dispatch(notSSO());
      dispatch(unauthenticateUser());
      dispatch(assignUser({ user_email: null }));
      localStorage.removeItem('isAuth');
    } catch(error) {
      console.log(error.response);
    }
  };

  const protectedInfo = async () => {
    try {
      const { data } = ssoLogin ? await fetchProtectedInfoSSO() : await fetchProtectedInfo();
      setProtectedData(data.info);
      setLoading(false);
    } catch(error) {
      logout(); //if the user isn't property authenticated using the token on the cookie or there is some other issue, this will force logout thus not allowing a user to gain unauthenticated access
    }
  };

  useEffect(() => {
    protectedInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  const handleChange = (e) => {
    setValues([ ...values, values[index][e.target.name] = e.target.value ]);
  };

  const handleMealNameChange = (e) => {
    setMealName(e.target.value);
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
                Create a Meal
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
                  autoFocus
                />
                <Box sx={{ display: 'flex', alignItems: 'center'}}>
                    <Box sx={{ mt: 2 }}>
                    { values.map((input, index) => {
                        return (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                            <TextField 
                              margin="normal"
                              id="ingredient"
                              label="Ingredient"
                              name="ingredient"
                              value={ values[0].ingredient }
                              onChange={ (e) => handleChange(e) }
                              autoComplete="Ingredient"
                              autoFocus 
                              sx={{ mr: 1 }}
                            />
                            <TextField 
                              margin="normal"
                              id="ingredientQuantity"
                              label="Quantity"
                              name="ingredientQuantity"
                              value={ values[index].ingredientQuantity }
                              onChange={ (e) => handleChange(e) }
                              autoComplete="Quantity"
                              autoFocus 
                              type="number"
                              sx={{ mr: 1 }}
                            />
                            <InputLabel id="category">Category</InputLabel>
                            <Select
                                labelId="category"
                                id="ingredientCategory"
                                name="ingredientCategory"
                                value={ values[index].ingredientCategory }
                                label="Category"
                                onChange={ (e) => handleChange(e) }
                            >
                                <MenuItem value="dairy">Dairy</MenuItem>
                                <MenuItem value="meat">Meat</MenuItem>
                                <MenuItem value="produce">Produce</MenuItem>
                            </Select>
                          </Box>
                        )
                      })}
                      <TextField 
                        margin="normal"
                        id="ingredient"
                        label="Ingredient"
                        name="ingredient"
                        value={ values[0].ingredient }
                        onChange={ (e) => handleChange(e) }
                        autoComplete="Ingredient"
                        autoFocus 
                        sx={{ mr: 1 }}
                      />
                      <TextField 
                        margin="normal"
                        id="ingredientQuantity"
                        label="Quantity"
                        name="ingredientQuantity"
                        value={ values[index].ingredientQuantity }
                        onChange={ (e) => handleChange(e) }
                        autoComplete="Quantity"
                        autoFocus 
                        type="number"
                        sx={{ mr: 1 }}
                      />
                    </Box>
                    <Box sx={{ mt: 0 }}>
                      <InputLabel id="category">Category</InputLabel>
                      <Select
                          labelId="category"
                          id="ingredientCategory"
                          name="ingredientCategory"
                          value={ values[index].ingredientCategory }
                          label="Category"
                          onChange={ (e) => handleChange(e) }
                      >
                          <MenuItem value="dairy">Dairy</MenuItem>
                          <MenuItem value="meat">Meat</MenuItem>
                          <MenuItem value="produce">Produce</MenuItem>
                      </Select>
                    </Box>
                </Box>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2, mb: 2 }}
                >
                  Create Meal
                </Button>
              </Box>
            </ Box>
          </ Container>
        </ ThemeProvider >
      </Layout>
    </div>
  )
  
};

export default CreateMeal;