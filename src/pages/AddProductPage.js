import React, {Component} from 'react';
import {Button, Card, Form, Input, InputNumber, Layout, notification, Table} from "antd";
import {Content, Header} from "antd/es/layout/layout";
import Text from "antd/es/typography/Text";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
import API from "../server-apis/api";

class AddProductPage extends Component {
    constructor(props) {
        super(props);
        this.onFinish = this.onFinish.bind(this);
    }
    onFinish = (values) => {
        API.post(`/products/add`,values)
            .then((res) => {
                this.successfullyAdded();
            })
            .catch(error => {
                // this.setState({ errorMessage: error.message });
                this.errorHappend(error);
                console.error('There was an error!', error);
        });
    };

    onFinishFailed = (errorInfo) => {console.log('Failed:', errorInfo);
    };
    successfullyAdded = () => {
        notification.info({
            message: `Notification`,
            description:
                'Product is successfully added',
            placement:"bottomRight",
            icon: <CheckCircleFilled style={{ color: '#0AC035' }} />
        });
    };
    errorHappend = (error) => {
        notification.info({
            message: `Notification`,
            description:
                `There was an error! ${error}`,
            placement:"bottomRight",
            icon: <InfoCircleFilled style={{ color: '#f53333' }} />
        });
    };
    render() {
        return (
            <Layout style={{alignItems: 'center',marginTop:"2em"}}>
                <Content >
                    <Card title="Add new product info" style={{ width: "60em" }}>
                    <Form name="addProductForm"
                          layout="vertical"
                          initialValues={{  remember: true,}}
                          onFinish={this.onFinish}
                          onFinishFailed={this.onFinishFailed}
                          autoComplete="off">
                    <Form.Item label="Name" name="name" rules={[ {required: true,message: 'Please enter name',}, ]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Model" name="model" rules={[ {required: true,message: 'Please enter model',}, ]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Color" name="color" rules={[ {required: true,message: 'Please enter color',}, ]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Material" name="material" rules={[ {required: true,message: 'Please enter material',}, ]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Price" name="price" rules={[
                        {
                            required: true,
                            message: 'Please enter price',
                        },
                    ]}>
                        <InputNumber min={0} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{width:"10em"}}>
                            Save
                        </Button>
                    </Form.Item>
                    </Form>
                    </Card>
                </Content>
            </Layout>
        );
    }
}

export default AddProductPage;