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
                 if (response.data.access_token) {
                     localStorage.setItem('token', JSON.stringify(response.data.access_token));
                 }
                return response.data;
            });
    }

    logout() {
        localStorage.removeItem("token");
        setInterval(() => {
            window.location.href = 'https://furntrade.web.app/login';
          }, 1000);
    }
    getCurrentUser() {
        if(JSON.parse(localStorage.getItem("token"))!==null){
            var loggedUser=jwtDecode(JSON.parse(localStorage.getItem("token")));
            var expired=jwtDecode(JSON.parse(localStorage.getItem("token"))).exp;
            if(expired<Date.now()/1000)
            {
                console.log("isteko je");
                localStorage.clear();
                return null;
            }
            else{
                this.user.username=loggedUser.sub;
                this.user.isAdmin=loggedUser.roles.includes("admin");
                return this.user;
            }
        }
        //if()
        else return  null;
    }
}

export default new AuthService();
