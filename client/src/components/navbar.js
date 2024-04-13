/* This page defines the navbar at the right-hand side of the header */

import { AppBar, Toolbar, IconButton, Typography, Stack, Button } from '@mui/material';
import EggIcon from '@mui/icons-material/Egg';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { onLogout } from '../api/auth';
import { unauthenticateUser, notSSO, assignUser } from '../redux/slices/authSlice';

export const Navbar = () => {
    const dispatch = useDispatch();

    const logout = async () => {
        try {
            await onLogout();
            dispatch(notSSO());
            dispatch(unauthenticateUser());
            localStorage.removeItem('isAuth');
        } catch(error) {
            console.log(error.response);
        }
    };

    const { isAuth, ssoLogin } = useSelector(state => state.auth);
    const { clientURL } = useSelector(state => state.glob);
    return (
        <AppBar position='static'>
            <Toolbar>
                <IconButton size='large' edge='start' color='inherit' aria-label='home icon'>
                    <EggIcon />
                </IconButton>
                <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                    Got Groceries
                </Typography>
                {isAuth || ssoLogin ? (
                    <Stack direction='row' spacing={3}>
                        <Button color='inherit'>Home</Button>
                        <Button color='inherit' onClick={ () => logout() }>Log out</Button>
                    </Stack>
                ) : (
                    <Stack direction='row' spacing={3}>
                        <Button color='inherit' component={Link} to={`${clientURL}/login`}>Log in</Button>
                        <Button color='inherit' component={Link} to={`${clientURL}/register`}>Sign Up Free</Button>
                    </Stack>
                )}
            </Toolbar>
        </AppBar>
    );
};