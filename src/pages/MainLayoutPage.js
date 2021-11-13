import React, {useState} from 'react';
import Layout, {Content, Footer, Header} from "antd/es/layout/layout";
import ProductsPage from "./ProductsPage";
import CustomersPage from "./CustomersPage";
import SidebarMenu from "../components/SidebarMenu";
import OrdersPage from "./OrdersPage";
import SettingsPage from "./SettingsPage";

export default function MainLayoutPage() {

    const pages = {
        1: <ProductsPage/>,
        2: <CustomersPage/>,
        3: <OrdersPage/>,
        4: <SettingsPage/>
    };
    const [render, updateRender] = useState(1);
    const handleMenuClick = menu => {
        updateRender(menu.key);
    };
        return (
                <Layout style={{ minHeight: '100vh' }}>
                <SidebarMenu handleClick={handleMenuClick} />
               <Layout className="site-layout">
                       <Content  style={{ margin: '0 16px' }}>
                           {pages[render]}
                       </Content>
                       <Footer style={{ textAlign: 'center' }}>Created by mene</Footer>
               </Layout>
            </Layout>
        );
}