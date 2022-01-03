import API from "../server-apis/api"
import jwtDecode from "jwt-decode";

class AuthService {
    user = {
        username: "",
        isAdmin:false
    };
    login(username, password) {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        return API.post("login", params)
            .then((response) => {
                console.log(response.data.access_token);
                 if (response.data.access_token) {
                     localStorage.setItem('token', JSON.stringify(response.data.access_token));
                 }
                return response.data;
            });
    }

    logout() {
        localStorage.removeItem("token");
    }
    getCurrentUser() {
        if(JSON.parse(localStorage.getItem("token"))!==null){
            var loggedUser=jwtDecode(JSON.parse(localStorage.getItem("token")));
            this.user.username=loggedUser.sub;
            console.log("original "+loggedUser.roles.includes("admin"));
            this.user.isAdmin=loggedUser.roles.includes("admin");
            return this.user;
        }
        else return  null;
    }
}

export default new AuthService();
