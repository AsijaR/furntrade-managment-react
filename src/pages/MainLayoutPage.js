import React, {Component} from 'react';
import Layout, {Content} from "antd/es/layout/layout";
import ProductsPage from "./ProductsPage";
import CustomersPage from "./CustomersPage";
import OrdersPage from "./OrdersPage";
import SettingsPage from "./SettingsPage";
import Sider from "antd/es/layout/Sider";
import {Menu, Space} from "antd";
import {BrowserRouter as Router, Route, Link, Routes , Navigate} from "react-router-dom";
import {FaBuilding, FaCouch, FaUsers, IoDocumentText, IoLogOut, IoMdSettings} from "react-icons/all";
import AddProductPage from "./AddProductPage";
import AddCustomerPage from "./AddCustomerPage";
import EmployeesPage from "./EmployeesPage";
import authService from "../services/auth.service";
import LoginPage from "./LoginPage";
import { useHistory } from "react-router-dom";
import OrderDetails from "./OrderDetails";
import AddEmployeePage from "./AddEmployeePage";
import Text from "antd/es/typography/Text";


class MainLayoutPage extends Component {

    constructor() {
        super();
        this.state = {
        collapsed: false,
        hasAdminRole:authService.getCurrentUser().isAdmin,
        };
       // this.getUserRole();

}
    isUserLoggedOrTokenExpired=()=>{
        if(authService.getCurrentUser()===null)
        {
            window.location.reload(false);
            return false;
        }
        else return true;
    }
    onCollapse = collapsed => {
        console.log(collapsed);
        this.setState({ collapsed });
    };
    logoutUser = () => {
        authService.logout();
    };
    render() {
        if(this.isUserLoggedOrTokenExpired())
        {
            return (
                <Router>
                    <Layout style={{ minHeight: '100vh' }}>
                        <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
                            <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                                <Menu.Item key="1" icon={<FaCouch/>}>
                                    <Link to="/products">
                                        <span>Products</span>
                                    </Link>
                                </Menu.Item>
                                <Menu.Item key="2" icon={<FaBuilding/>}>
                                    <Link to="/customers">
                                        <span>Customers</span>
                                    </Link>
                                </Menu.Item>
                                <Menu.Item key="3" icon={<IoDocumentText/>}>
                                    <Link to="/orders" >
                                        <span>Orders</span>
                                    </Link>
                                </Menu.Item>
                                {this.state.hasAdminRole && (
                                    <Menu.Item key="4" icon={<FaUsers/>}>
                                        <Link to="/employees">
                                            <span>Employees</span>
                                        </Link>
                                    </Menu.Item>)
                                }
                                <Menu.Item key="5" icon={<IoMdSettings/>}  >
                                    <Link to="/my-profile"/>
                                    <span>My profile</span>
                                </Menu.Item>
                                <Menu.Item key="6" icon={<IoLogOut/>} >
                                    <a onClick={this.logoutUser}/>
                                    <span>Log out</span>
                                </Menu.Item>
                            </Menu>
                        </Sider>
                        <Layout className="site-layout">
                             <Content  style={{ margin: '0 16px' }}>
                                <div>
                                    <Routes>
                                        <Route exact path="/" element={<ProductsPage />} />
                                        <Route exact path="/products"  element={<ProductsPage />} />
                                        <Route path="/add-product"  element={<AddProductPage />} />
                                        <Route path="/customers"  element={<CustomersPage />} />
                                        {this.state.hasAdminRole &&
                                        ( <Route path="/add-customer"  element={<AddCustomerPage />} />)}
                                        {this.state.hasAdminRole &&
                                        ( <Route path="/add-employee"  element={<AddEmployeePage />} />)}
                                        <Route path="/orders" element={  <OrdersPage/>}/>
                                        <Route path="/employees" element={  <EmployeesPage/>}/>
                                        <Route path="/my-profile" element={  <SettingsPage/>}/>
                                        <Route exact path="/orders/:id" element={  <OrderDetails/>}/>
                                        <Route exact path="/login" element={  <LoginPage/>}/>
                                        <Route path="/orders/create-new-order" element={<OrderDetails/>}/>
                                    </Routes>
                                </div>
                            </Content>
                        </Layout>
                    </Layout>
                </Router>
            );
        }
        else
        {
            return(
            <Space>
                <Text>You need to login to access this page</Text>
                <Link to="/login">
                    <span>Go to login page</span>
                </Link>
            </Space>)
        }
    }
}

export default MainLayoutPage;