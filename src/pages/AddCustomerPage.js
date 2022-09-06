import React, {Component} from 'react';
import API from "../server-apis/api";
import '@ant-design/compatible/assets/index.css';
import { Button,Form,Row,Col, Card, Input, InputNumber, notification, Space } from "antd";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
import Text from "antd/es/typography/Text";
import {Link} from "react-router-dom";
import authService from '../services/auth.service';

class AddCustomerPage extends Component {
    constructor(props) {
        super(props);
        this.state={
            errorMessage:null
        }
        this.token="Bearer "+ JSON.parse(localStorage.getItem("token"));
        this.onFinish = this.onFinish.bind(this);
    }
    onFinish = (values) => {
       API.post(`/customers/add`,values,{ headers: { Authorization: this.token}})
            .then((res) => {
                this.successfullyAdded();
            })
            .catch(error => {
                try {
                    var message=JSON.stringify(error.response.data.error_message);
                    if(message.includes("The Token has expired"))
                    {
                        this.setState({errorMessage:"Your token has expired"});
                        this.errorHappend("Your token has expired.");
                        authService.logout();
                    }
                } 
                catch (error) {
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
                'Customer is successfully added',
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
        } else
        {
            return (
                    <Form name="addProductForm" layout="vertical" onFinish={this.onFinish} onFinishFailed={this.onFinishFailed} autoComplete="off" >
                        <Row>
                            <Text style={{fontSize:"22px"}} >Add info about new customer</Text>
                        </Row>
                        <Row style={{marginTop:"2em", marginLeft:"1em"}}>
                            <Col span={11}>
                                <Card title="Enter company info">
                                    <Form.Item label="Company name" name="name" rules={[ {required: true,message: 'Please enter name',},
                                        {
                                            pattern: /^[a-zA-Z0-9. ]+$/,
                                            message: 'Name can only include letters or numbers',}]}>
                                        <Input />
                                    </Form.Item>

                                    <Form.Item label="Address" name="address" rules={[ {required: true,message: 'Please enter Address',},{
                                        pattern: /^[a-zA-Z0-9.# ]+$/,
                                        message: 'Address can only include letters or numbers',}]}>
                                        <Input />
                                    </Form.Item>
                                    <Space >
                                        <Form.Item label="City" name="city" rules={[ {required: true,message: 'Please enter city',}, {
                                            pattern: /^[a-zA-Z ]+$/,
                                            message: 'City can only include letters',}]}>
                                            <Input />
                                        </Form.Item>
                                        <Form.Item label="Zip" name="zip" rules={[ {required: true,message: 'Please enter zip',},{
                                            pattern: /^[0-9 ]+$/,
                                            message: 'Zip can only include numbers',}]}>
                                            <InputNumber />
                                        </Form.Item>
                                        <Form.Item label="State" name="state" rules={[ {required: true,message: 'Please enter state',},{
                                            pattern: /^[a-zA-Z ]+$/,
                                            message: 'State can only include letters',}]}>
                                            <Input />
                                        </Form.Item>
                                    </Space>
                                </Card>
                            </Col>
                            <Col span={1}/>
                            <Col span={11}>
                                <Card title="Enter contact person info">
                                    <Form.Item label="Contact Person Name" name="contactPersonName" rules={[ {required: false,message: 'Please enter name',},{
                                        pattern: /^[a-zA-Z ]+$/,
                                        message: 'Name can only include letters',}]}>
                                        <Input />
                                    </Form.Item>

                                    <Form.Item label="Contact Person Email" name="contactPersonEmail"
                                               rules={[ {required: false,type:"email",message:"Please enter valid email address"}]}>
                                        <Input />
                                    </Form.Item>
                                </Card>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" style={{width:"10em",float:"right", marginTop:"2em"}}>
                                        Save
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>

            );
        }
    }
}

export default AddCustomerPage;