import React, {Component} from 'react';
import '@ant-design/compatible/assets/index.css';
import {Button, Form, Card, Input, Row, Col, notification, Space} from "antd";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
import API from "../server-apis/api";
import {Link} from "react-router-dom";
import Text from "antd/es/typography/Text";
import authService from '../services/auth.service';

class AddEmployeePage extends Component {
    constructor(props) {
        super(props);
        this.state={
            errorMessage:null
        }
        this.token="Bearer "+ JSON.parse(localStorage.getItem("token"));
    }
    onFinish = (values) => {
        API.post(`/users/add-employee`,values,{ headers: { Authorization: this.token}})
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
                    this.setState({errorMessage:error});}
                this.errorHappend(error.response.data);
                console.error('There was an error!', error);
            });
    };

    onFinishFailed = (errorInfo) => {console.log('Failed:', errorInfo);
    };
    successfullyAdded = () => {
        notification.info({
            message: `Notification`,
            description:
                'Employee account is successfully created',
            placement:"bottomRight",
            icon: <CheckCircleFilled style={{ color: '#0AC035' }} />
        });
    };
    errorHappend = (error) => {
        notification.info({
            message: `Notification`,
            description:
                `${error}`,
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
            <Row style={{marginTop:"2em", marginLeft:"1em"}}>
                <Col span={12} offset={6}>
                    <Card title="Create account for new user">
                        <Form name="ada" layout="vertical" onFinish={this.onFinish} onFinishFailed={this.onFinishFailed} autoComplete="off">
                            <Form.Item label="Create username for new employee" name="username" rules={[ {required: true,message: 'Please enter username',},{
                                pattern: /^[a-zA-Z0-9 ]+$/,
                                message: 'Username can only include letters or numbers',}]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="Create password" name="password" rules={[ {required: true,message:"Please create password"},{
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@.?#\$%\^&\*])(?=.{8,})/,
                                message: 'Password needs to include at least one lowercase, uppercase, numeric and special character and to be at least 8 characters long',} ]}>
                                <Input.Password/>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{width:"10em"}}>
                                    Create account
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

export default AddEmployeePage;