import { onLogout } from '../api/auth';


export const logout = async () => {
    try {
      await onLogout();
      localStorage.removeItem('isAuth');
    } catch(error) {
      console.log(error.response);
    }
  };