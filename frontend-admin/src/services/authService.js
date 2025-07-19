import axios from 'axios';
const API = '/backend/api/auth/login.php';
export default {
  async login(email,password){
    const res = await axios.post(API,{email,password});
    return res.data;
  }
};
