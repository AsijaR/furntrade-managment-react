import React, {Component} from 'react';
import '@ant-design/compatible/assets/index.css';
import {Button, Form, Card, Input, InputNumber, Row, Col, notification, Space} from "antd";
import {Content} from "antd/es/layout/layout";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
import API from "../server-apis/api";
import Text from "antd/es/typography/Text";
import {Link} from "react-router-dom";

class AddProductPage extends Component {
    constructor(props) {
        super(props);
        this.state={
            errorMessage:null
        }
        this.token="Bearer "+ JSON.parse(localStorage.getItem("token"));
    }
    onFinish = (values) => {
        API.post(`/products/add`,values,{ headers: { Authorization: this.token}})
            .then((res) => {
                this.successfullyAdded();
            })
            .catch(error => {
                var message=JSON.stringify(error.response.data.error_message);
                if(message.includes("The Token has expired"))
                {
                    this.setState({errorMessage:"Your token has expired"})
                }
                else
                {
                    this.setState({errorMessage:error})
                }
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
        if (this.state.errorMessage) {
            return <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Text style={{fontSize:"22px"}}>Error: {this.state.errorMessage}</Text>
                <Link to="/login">
                    <Button>Click here to login again</Button>
                </Link>
            </Space>;
        } else {
            return (
                <Row style={{marginTop: "2em", marginLeft: "1em"}}>
                    <Col span={12} offset={6}>
                        <Card title="Add new product info">
                            <Form name="addProductForm" layout="vertical" onFinish={this.onFinish}
                                  onFinishFailed={this.onFinishFailed} autoComplete="off">
                                <Form.Item label="Name" name="name"
                                           rules={[{required: true, message: 'Please enter name',}, {
                                               pattern: /^[a-zA-Z0-9.# ]+$/,
                                               message: 'Name can only include letters or numbers',
                                           }]}>
                                    <Input/>
                                </Form.Item>
                                <Form.Item label="Model" name="model"
                                           rules={[{required: true, message: 'Please enter model',}, {
                                               pattern: /^[a-zA-Z0-9.# ]+$/,
                                               message: 'Model can only include letters or numbers',
                                           }]}>
                                    <Input/>
                                </Form.Item>

                                <Form.Item label="Color" name="color"
                                           rules={[{required: true, message: 'Please enter color',}, {
                                               pattern: /^[a-zA-Z0-9.# ]+$/,
                                               message: 'Model can only include letters or numbers',
                                           }]}>
                                    <Input/>
                                </Form.Item>

                                <Form.Item label="Material" name="material"
                                           rules={[{required: true, message: 'Please enter material',}, {
                                               pattern: /^[a-zA-Z0-9.# ]+$/,
                                               message: 'Material can only include letters or numbers',
                                           }]}>
                                    <Input/>
                                </Form.Item>

                                <Form.Item label="Price" name="price"
                                           rules={[{required: true, message: 'Please enter price',}, {
                                               pattern: /^[0-9 ]+$/,
                                               message: 'Price can only include numbers',
                                           }]}>
                                    <InputNumber min={1}/>
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" style={{width: "10em"}}>
                                        Save
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            );
        }
    }
}

export default AddProductPage;