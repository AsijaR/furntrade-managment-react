import React, {Component} from 'react';
import Layout, {Content} from "antd/es/layout/layout";
import ProductsPage from "./ProductsPage";
import CustomersPage from "./CustomersPage";
import OrdersPage from "./OrdersPage";
import SettingsPage from "./SettingsPage";
import {Link, Routes} from "react-router-dom";
import Sider from "antd/es/layout/Sider";
import {Menu} from "antd";
import {  BrowserRouter as Router,  Route} from "react-router-dom";
import {FaBuilding, FaCouch, FaUsers, IoDocumentText, IoMdSettings} from "react-icons/all";
import AddProductPage from "./AddProductPage";
import AddCustomerPage from "./AddCustomerPage";
import EmployeesPage from "./EmployeesPage";
import authService from "../services/auth.service"

class MainLayoutPage extends Component {

    constructor() {
        super();
        this.state = {
        collapsed: false,
        hasAdminRole:authService.getCurrentUser().isAdmin
        };
}
    onCollapse = collapsed => {
        console.log(collapsed);
        this.setState({ collapsed });
    };

    render() {
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
                                <Link to="/settings"/>
                                <span>Settings</span>
                            </Menu.Item>
                    </Menu>
                </Sider>
                    <Layout className="site-layout">
                        <Content  style={{ margin: '0 16px' }}>
                            <div>
                                <Routes>
                                    <Route exact path="/products"  element={<ProductsPage />} />
                                    <Route path="/add-product"  element={<AddProductPage />} />
                                    <Route path="/customers"  element={<CustomersPage />} />
                                    {this.state.hasAdminRole &&
                                        ( <Route path="/add-customer"  element={<AddCustomerPage />} />)}
                                    <Route path="/orders" element={  <OrdersPage/>}/>
                                    <Route path="/employees" element={  <EmployeesPage/>}/>
                                    <Route path="/settings" element={  <SettingsPage/>}/>
                                </Routes>
                            </div>
                        </Content>
                    </Layout>
                </Layout>
            </Router>
        );
    }
}

export default MainLayoutPage;