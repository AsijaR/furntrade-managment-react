import './App.css';
import MainLayoutPage from "./pages/MainLayoutPage";
import authService from "../src/services/auth.service"
import LoginPage from "./pages/LoginPage";

function App() {

  if(authService.getCurrentUser()===null)
  {
   // window.history.pushState({}, "Login page", "login")
    return <LoginPage/>

  }
  else {
   // window.history.pushState({}, "Dashboard", "/products")
    return <MainLayoutPage></MainLayoutPage>;
  }
}

export default App;
