/* This page defines the navbar at the right-hand side of the header */

import { AppBar, Toolbar, IconButton, Typography, Stack, Button, useMediaQuery } from '@mui/material';
import EggIcon from '@mui/icons-material/Egg';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { onLogout } from '../api/auth';
import { unauthenticateUser, notSSO } from '../redux/slices/authSlice';
import { useTheme } from '@mui/material/styles';

export const Navbar = () => {
    const theme = useTheme();
    const matches375 = useMediaQuery('(max-width: 375px)');

    const dispatch = useDispatch();
    const navigate = useNavigate();

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
                    { matches375 ? '' : 'Got Groceries' }
                </Typography>
                {isAuth || ssoLogin ? (
                    <Stack direction='row' spacing={3}>
                        <Button color='inherit' onClick={ () => navigate('/list') }>Home</Button>
                        <Button color='inherit' onClick={ () => logout() } sx={{ mr: 1 }}>Log out</Button>
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