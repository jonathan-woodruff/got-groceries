/* the page that the user sees upon authentication */
/* When the page loads, useEffect will check if the user is authenticated. If so, it will show the private information. If the user is not authenticated, it will log them out */

import { useEffect, useState, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProtectedInfo, fetchProtectedInfoSSO } from '../api/auth';
import { fetchGroceryList, putGroceryCart, putFreshStart } from '../api/inapp';
import Layout from '../components/layout';
import { Spinner } from '../components/spinner';
import { unauthenticateUser, notSSO } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/index';
import { 
  Button, 
  CssBaseline, 
  Box, 
  Container, 
  Typography, 
  Grid, 
  FormControlLabel, 
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery
} from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditIcon from '@mui/icons-material/Edit';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const defaultTheme = createTheme();

const List = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const matches425 = useMediaQuery('(max-width: 425px)');
  const { ssoLogin } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [groceryList, setGroceryList] = useState([]);
  const [autosave, setAutosave] = useState(false);
  const [boxesChanged, setBoxesChanged] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [emptyList, setEmptyList] = useState(false);
  const [listHistory, setListHistory] = useState('');
  const [selectedMeals, setSelectedMeals] = useState('');
  const [emptySelected, setEmptySelected] = useState(false);

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

  /* Structure of groceryList...
  [
    {
      category: produce,
      items: [
        {name: bla, quantity: bla...},
        {name: blad, quantity: di...}
      ]
    }, 
    ...
  ]
  */
  const assembleGroceryList = async () => {
    try {
      const { data } = await fetchGroceryList();
      //set if the user has ever started or finished creating a list before
      if (data.userData[0].createdlist) {
        setListHistory('created list');
      } else if (data.userData[0].startedlist) {
        setListHistory('started list');
      } else {
        setListHistory('new user');
      };
      //set the list of selected meals
      const responseMeals = data.meals;
      if (!responseMeals.length) {
        setEmptySelected(true);
      } else {
        let mealsString = '';
        responseMeals.forEach(meal => {
          mealsString += meal.name + ', ';
        });
        setSelectedMeals(mealsString.substring(0, mealsString.length - 2));
      }
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
      if (!organizedList.length) setEmptyList(true);
    } catch(error) {
      console.log(error);
    }
  };

  //ensure the user is authenticated to view the page, and then retrieve their data
  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuthenticated();
    }
    initializeAuth();
  }, []);

  //load the page content
  useEffect(() => {
    if (isAuthenticated) {
      const initializePage = async () => {
        await assembleGroceryList();
      };
      initializePage();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if ((groceryList.length || emptyList) && listHistory && (selectedMeals || emptySelected)) setLoading(false);
  }, [groceryList, emptyList, listHistory, selectedMeals, emptySelected]);

  //set the autosave interval
  useEffect(() => {
    const autosave = setInterval(function() {
      setAutosave(true);
    }, 1000 * 10); // runs every 10 seconds
    return () => {
      setAutosave(false); // turn autosave off
      clearInterval(autosave); // clear autosave on dismount
    };
  }, []);

  //autosave if it's been 10 seconds and if changes were made
  useEffect(() => {
    if (autosave && boxesChanged) {
        updateCart();
        setAutosave(false); // toggle autosave off
        setBoxesChanged(false);
    }
  }, [autosave, boxesChanged]); 

  const handleEdit = () => {
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

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    try {
      await putFreshStart();
      navigate('/meals');
    } catch(error) {
      console.log(error);
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
                My Grocery List
              </Typography>
              { listHistory === 'created list' ? 
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Meals: { selectedMeals }
              </Typography> :
              <></>
              }
              { listHistory === 'created list' ? groceryList.map((input, index) => {
                return (
                  <>
                  <Button 
                    key={groceryList[index].category} 
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
                          <Grid 
                            item 
                            xs={ matches425 ? 6 : 4} 
                            sx={{ mb: 2 }} 
                            key={groceryList[index].category + ' ' + groceryList[index].items[index2].name}
                          >
                            <FormControlLabel control={ <Checkbox onChange={ handleCheck(index, index2) } checked={ groceryList[index].items[index2].incart } /> } label={ groceryList[index].items[index2].name + ' (' + groceryList[index].items[index2].quantity + ')' } />
                          </Grid>
                        )
                        }) :
                        <></>
                    }
                  </Grid>
                  </>
                )
              }) :
              <></>
              }
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 5 }}>
                { listHistory === 'created list' ?
                  <Button onClick={ handleEdit } variant="contained" color="grey" startIcon={ <EditIcon /> } sx={{ pr: 3, pl: 3 }}>
                    Edit List
                  </Button> : listHistory === 'started list' ?
                  <Button onClick={ handleEdit } variant="contained" sx={{ pr: 3, pl: 3 }}>
                    Continue Creating List
                  </Button> :
                  <Button onClick={ handleConfirm } variant="contained" sx={{ pr: 3, pl: 3 }}>
                    Create New List
                  </Button>
                }
                { listHistory === 'created list' ?
                  <Fragment>
                    <Button onClick={ handleDialogOpen } variant="contained" sx={{ ml: 2, pr: 3, pl: 3 }}>
                      Create New List
                    </Button>
                    <Dialog
                      open={ dialogOpen }
                      onClose={ handleDialogClose }
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <DialogTitle id="alert-dialog-title">
                        {"Start fresh with a new list?"}
                      </DialogTitle>
                      <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                          Starting a new list will get rid of your old one, but all the meals you created will still be saved.
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={ handleDialogClose }> Cancel </Button>
                        <Button onClick={ handleConfirm } autoFocus> Ok </Button>
                      </DialogActions>
                    </Dialog>
                  </Fragment> :
                  <></>
                }
              </Box>
            </Box>
          </Container>
        </ThemeProvider >
      </Layout>
    </div>
  )
  
};

export default List;