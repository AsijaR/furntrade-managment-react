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
import {FaBuilding, FaCouch, IoDocumentText, IoMdSettings} from "react-icons/all";
class MainLayoutPage extends Component {

    state = {
        collapsed: false,
    };

    onCollapse = collapsed => {
        console.log(collapsed);
        this.setState({ collapsed });
    };

    render() {
        const { collapsed } = this.state;
        return (
            <Router>
                <Layout style={{ minHeight: '100vh' }}>
                    <Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse}>
                        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                            <Menu.Item key="1" icon={<FaCouch/>}>
                                <Link to="/">
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
                            <Menu.Item key="4" icon={<IoMdSettings/>}  >
                                <Link to="/settings"/>
                                <span>Settings</span>
                            </Menu.Item>
                    </Menu>
                </Sider>
                    <Layout className="site-layout">
                        <Content  style={{ margin: '0 16px' }}>
                            <div>
                                <Routes>
                                    <Route exact path="/"  element={<ProductsPage />} />
                                    <Route exact path="/customers"  element={<CustomersPage />} />
                                    <Route path="/orders" element={  <OrdersPage/>}/>
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