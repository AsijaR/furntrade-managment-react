import React, {Component} from 'react';
import {Button, Layout, Space, Table} from "antd";
import API from '../server-apis/api';
import {Content, Header} from "antd/es/layout/layout";

const columns = [
    {
        title: 'Id',
        dataIndex: 'id',
        key: 'id',
    },
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: text => <a>{text}</a>,
    },
    {
        title: 'Model',
        dataIndex: 'model',
        key: 'model',
    },
    {
        title: 'Material',
        key: 'material',
        dataIndex: 'material',
    },
    {
        title: 'Color',
        key: 'color',
        dataIndex: 'color',
    },
    {
        title: 'Price',
        key: 'price',
        dataIndex: 'price',
    },
    {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
            <Space size="middle">
                <a>Edit</a>
                <a color="red">Delete</a>
            </Space>
        ),
    },
];

class ProductsPage extends Component {
    state = {
        data: [],
        // pagination: {
        //     current: 1,
        //     pageSize: 10,
        // },
        loading: false,
    };
    componentDidMount() {
        this.setState({ loading: true });
        API.get(`products`)
            .then(res => {
                console.log(res.data._embedded.productList);
                const products = res.data._embedded.productList;
                this.setState({loading: false,data:products });
            })
    }

    render() {
        const { data, loading } = this.state;
        return (
            <Layout>
                <div >
                    <Button style={{float:"right", background: "#0AC035",marginBottom:"1em", marginTop:"1em" }} type="primary">New product</Button>
                </div>
                <Content>
                    <Table columns={columns} loading={loading} rowKey="id" dataSource={data} />
                </Content>
            </Layout>
        );
    }
}

export default ProductsPage;