import { BrowserRouter, Navigate, Routes, Route, Outlet } from 'react-router-dom';
import CreateMeal from './pages/create-meal';
import Meals from './pages/meals';
import List from './pages/list';
import Register from './pages/register';
import Login from './pages/login';
import { useSelector, useDispatch } from 'react-redux';
import { onSSOSuccess } from './api/auth';
import { sso, assignUser } from './redux/slices/authSlice';

const PrivateRoutes =  () => {
  const dispatch = useDispatch();
  const { isAuth, ssoLogin } = useSelector(state => state.auth);

  if (!isAuth && !ssoLogin) {
    //check if the user successfully authenticated with sso
    const getUser = () => {
      onSSOSuccess().then(response => {
        if(response.status === 200) {
          dispatch(sso()); //update state to indicate the user authenticated with sso
          return response;
        }
        throw new Error('authentication failed');
      })
      .then(responseObject => {
        dispatch(assignUser({ user_email: responseObject.data.user.emails[0].value }));
      })
      .catch(error => {
        console.log(error);
      });
    };
    getUser();
  }
  return ( //Outlet is the respective child element of Private Routes. For example, below you nest List under PrivateRoutes, so Outlet would be List in that case.
    <>
      { isAuth || ssoLogin ? <Outlet /> : <Navigate to='/login'/> }
    </>
  );
};

const RestrictedRoutes = () => {
  const { isAuth, ssoLogin } = useSelector(state => state.auth);
  return (
    <>
      { !(isAuth || ssoLogin) ? <Outlet /> : <Navigate to='/list'/> }
    </>
  );
};


const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route element={ <PrivateRoutes /> } >
          <Route path='/list' element={ <List /> } />
          <Route path='/meals' element={ <Meals /> } />
          <Route path='/meals/create-meal' element={ <CreateMeal /> } />
        </Route>

        <Route element={ <RestrictedRoutes /> } >
          <Route path='/register' element={ <Register /> } />
          <Route path='/login' element={ <Login /> } />
          <Route path='/' element={ <Login /> } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
};

export default App;