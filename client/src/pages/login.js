import { useState } from 'react';
import Layout from '../components/layout';
import { onLogin} from '../api/auth';
import { useDispatch } from 'react-redux';
import { authenticateUser } from '../redux/slices/authSlice';

const Login = () => {
    const [values, setValues] = useState({
      email: '',
      password: ''
    });
    const [error, setError] = useState(false);

    const handleChange = (e) => {
      setValues({ ...values, [e.target.name]: e.target.value});
    };

    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await onLogin(values); //the server sends back a token/cookie
        dispatch(authenticateUser());
        localStorage.setItem('isAuth', 'true');
      } catch(error) {
        console.log(error.response.data.errors[0].msg); //error from axios
        setError(error.response.data.errors[0].msg);
      }
    };

    return (
      <Layout>
        <form onSubmit={(e) => handleSubmit(e) } className='container mt-3'>
          <h1>Login</h1>
          <div className='mb-3'>
            <label htmlFor='email' className='form-label'>Email Address</label>
            <input
              onChange={ (e) => handleChange(e) }
              type='email'
              className='form-control'
              id='email'
              name='email'
              value={ values.email }
              placeholder='test@gmail.com'
              required
            />
          </div>
          <div className='mb-3'>
            <label htmlFor = 'password' className='form-label'>Password</label>
            <input
              onChange={ (e) => handleChange(e) }
              type='password'
              className='form-control'
              id='password'
              name='password'
              value={ values.password }
              placeholder='password'
              required
            />
          </div>
          <div style={{ color: 'red', margin: '10px 0'}}>{ error }</div>
          <button type='submit' className='btn btn-primary'>Submit</button>
        </form>
      </Layout>
    )
  };
  
  export default Login;