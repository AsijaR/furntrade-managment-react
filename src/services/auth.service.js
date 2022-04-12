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
            var expired=jwtDecode(JSON.parse(localStorage.getItem("token"))).exp;
          //  console.log("token",new Date(expired*1000));
            if(expired<Date.now()/1000)
            {
                localStorage.clear();
                return null;
            }
            else{
                this.user.username=loggedUser.sub;
                console.log("original "+loggedUser.roles.includes("admin"));
                this.user.isAdmin=loggedUser.roles.includes("admin");
                return this.user;
            }
        }
        //if()
        else return  null;
    }
}

export default new AuthService();
