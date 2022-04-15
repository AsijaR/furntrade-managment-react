import axios from 'axios';

export default axios.create({
    baseURL: `https://projakt.herokuapp.com/`
});