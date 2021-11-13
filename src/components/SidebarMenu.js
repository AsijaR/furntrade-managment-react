import React, {Component} from 'react';
import {Layout, Menu} from "antd";
import {FaBuilding, FaCouch, IoDocumentText, IoMdSettings} from "react-icons/all";
import Sider from "antd/es/layout/Sider";

export default function SidebarMenu(props)  {
    const { handleClick } = props;
        return (
            <Layout.Sider>
                <Sider>
                    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                        <Menu.Item key="1" icon={<FaCouch/>}  title="Products" onClick={handleClick}>Products </Menu.Item>
                        <Menu.Item key="2" icon={<FaBuilding/>}  title="Customers" onClick={handleClick}>Customers</Menu.Item>
                        <Menu.Item key="3" icon={<IoDocumentText/>}  title="Orders" onClick={handleClick}>Orders</Menu.Item>
                        <Menu.Item key="4" icon={<IoMdSettings/>}  title="My Profile" onClick={handleClick}>My Profile</Menu.Item>
                    </Menu>
                </Sider>
            </Layout.Sider>
        );
}
