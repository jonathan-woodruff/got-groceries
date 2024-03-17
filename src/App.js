import React from 'react';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { RouterProvider, createBrowserRouter, Route, createRoutesFromElements } from 'react-router-dom';


const router = createBrowserRouter(createRoutesFromElements(
  <>
    <Route path='/' element={ <SignIn /> } />
    <Route path='/sign-up' element={ <SignUp /> } />
  </>
));


export default function App () {
  return (
    <RouterProvider router={ router } />
  );
}
