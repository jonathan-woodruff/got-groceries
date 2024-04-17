/* the page that the user sees upon authentication */
/* When the page loads, useEffect will check if the user is authenticated. If so, it will show the private information. If the user is not authenticated, it will log them out */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProtectedInfo, fetchProtectedInfoSSO } from '../api/auth';
import { fetchGroceryList, putGroceryCart } from '../api/inapp';
import Layout from '../components/layout';
import { unauthenticateUser, notSSO } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/index';
import { Button, CssBaseline, Box, Container, Typography, Grid, FormControlLabel, Checkbox } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const defaultTheme = createTheme();

const List = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ssoLogin } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [protectedData, setProtectedData] = useState(null);
  const [groceryList, setGroceryList] = useState([]);
  const [autosave, setAutosave] = useState(false);
  const [boxesChanged, setBoxesChanged] = useState(false);

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

  const assembleGroceryList = async () => {
    try {
      const { data } = await fetchGroceryList();
      //organize the grocery list by category
      const organizedList = [];
      let categoryName, categoryIndex, itemIndex;
      data.list.forEach(item => {
        item['otherIds'] = []; //initialize this key to initially indicate there are no other ingredients with the same name
        categoryName = item.category;
        categoryIndex = organizedList.findIndex(cat => cat.category === categoryName);
        if (categoryIndex === -1) {
          organizedList.push({ category: categoryName, isDropped: false, isFinished: false, items: [] }); //add the category if it is unique
          categoryIndex = organizedList.length - 1;
        }
        //add the item to its respective category, taking care to add quantities for ingredients with the same name
        itemIndex = organizedList[categoryIndex].items.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase());
        if (itemIndex === -1) {
          organizedList[categoryIndex].items.push(item); //add the item
        } else {
          organizedList[categoryIndex].items[itemIndex].otherIds.push(item.id);
          organizedList[categoryIndex].items[itemIndex].quantity += item.quantity; //add the quantity of the iterated item to the item already added to organizedList
        }
      });
      //check if any of the categories already have all boxes checked
      organizedList.forEach(category => {
        const foundIndex = category.items.findIndex(item => !item.incart);
        if (foundIndex === -1) category.isFinished = true; //flag the category as finished
      })
      setGroceryList(organizedList);
    } catch(error) {
      console.log(error);
    }
  };

  const checkFinishedCategories = () => {
    console.log(groceryList)
  };

  useEffect(() => {
    protectedInfo();
    assembleGroceryList();
    checkFinishedCategories();
    setLoading(false);
    const autosave = setInterval(function() {
      setAutosave(true);
    }, 1000 * 60); // runs every minute
    return () => {
      setAutosave(false); // turn autosave off
      clearInterval(autosave); // clear autosave on dismount
    };
  }, []);

  //autosave if it's been a minute and if changes were made
  useEffect(() => {
    if (autosave && boxesChanged) {
        updateCart();
        setAutosave(false); // toggle autosave off
        setBoxesChanged(false);
    }
  }, [autosave, boxesChanged]); 

  const handleClick = () => {
    navigate(`../meals`)
  };

  const handleSelect = index => (e) => {
    const list = [...groceryList];
    list[index].isDropped = !list[index].isDropped;
    setGroceryList(list);
  };

  const handleCheck = (index, index2) => (e) => {
    setBoxesChanged(true);
    const isChecked = e.target.checked;
    const list = [...groceryList];
    list[index].items[index2].incart = isChecked;
    //move the item to the end of the list if it is checked or to the front of the list if unchecked
    const item = list[index].items.splice(index2, 1);
    if (!isChecked) {
      list[index].items.unshift(item[0]);
    } else { //isChecked === true
      list[index].items.push(item[0]);
    }
    setGroceryList(list);
    //check if every item is checked within the category
    if (isChecked) {
      const foundIndex = list[index].items.findIndex(i => !i.incart);
      if (foundIndex === -1) list[index].isFinished = true; //mark the category as finished
    } else { //!isChecked
      list[index].isFinished = false;
    }
  };

  
  const updateCart = async () => {
    try {
      await putGroceryCart({ list: groceryList });
    } catch(error) {
      console.log(error);
    }
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
              <Typography component="h2" variant="h6" sx={{ mt: 3, mb: 2 }}>
                My Grocery List
              </Typography>
              { groceryList.map((input, index) => {
                return (
                  <>
                  <Button 
                    key={index} 
                    onClick={ handleSelect(index) } 
                    variant={ groceryList[index].isFinished ? "contained" : "outlined" }
                    fullWidth 
                    endIcon={ groceryList[index].isDropped ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon /> } 
                    color={ groceryList[index].isFinished ? "success" : "primary" }
                    sx={{ m: 1, textTransform: 'none', borderRadius: '70px' }} 
                  >
                    <Box sx={{ width: '90%' }}>
                        { groceryList[index].category }
                    </Box>
                  </Button>
                  <Grid container spacing={1} alignItems="center">
                    { groceryList[index].isDropped ? 
                        groceryList[index].items.map((input, index2) => {
                        return (
                          <Grid item xs={4} sx={{ mb: 2 }}>
                            <FormControlLabel control={ <Checkbox onChange={ handleCheck(index, index2) } checked={ groceryList[index].items[index2].incart } /> } label={ groceryList[index].items[index2].name + ' (' + groceryList[index].items[index2].quantity + ')' } />
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
              <Button 
                onClick={ handleClick }
                variant="contained"
                sx={{ mt: 5, mb: 2, pr: 3, pl: 3 }}
              >
                Start a New List
              </Button>
            </Box>
          </Container>
        </ThemeProvider >
      </Layout>
    </div>
  )
  
};

export default List;