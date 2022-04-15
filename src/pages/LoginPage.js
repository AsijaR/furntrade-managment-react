import React, {Component} from 'react';
import '@ant-design/compatible/assets/index.css';
import { Form,Button, Col, Input, notification, Row } from "antd";
import AuthService from "../services/auth.service";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
class LoginPage extends Component{
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            loading: false,
            message: ""
        };
        this.onFinish = this.onFinish.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
    }
    onChangeUsername(e) {
        this.setState({
            username: e.target.value
        });
    }

    onChangePassword(e) {
        this.setState({
            password: e.target.value
        });
    }

    onFinish = (values) => {
        this.setState({
            message: "",
            loading: true
        });
        AuthService.login(values.username, values.password)
            .then(() => {
                  //  this.props.history.push('/settings')
                    window.location.reload();
                    this.successfullyAdded();
                },
                    error => {
                        const resMessage =
                            (error.response &&
                                error.response.data &&
                                error.response.data.message) ||
                            error.message ||
                            error.toString();
                        this.errorHappend("Entered data is not correct.");
                        this.setState({
                            loading: false,
                            message: resMessage
                        });
                    }
            );
    };
    successfullyAdded = () => {
        notification.info({
            message: `Notification`,
            description:
                'Successfully logged',
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
            <Row>
                <Col span={12} offset={6} style={{marginTop:"2em"}}>
                    <h2 style={{marginBottom:"2em"}}>Please login to access the website</h2>
                    <Form name="addProductForm"
                          layout="vertical"
                          onFinish={this.onFinish}
                          // onFinishFailed={this.onFinishFailed}
                          autoComplete="off">
                        <Form.Item label="Username" name="username" rules={[ {required: true,message: 'Please enter name',}, ]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Password" name="password" rules={[ {required: true,message: 'Please enter model',}, ]}>
                            <Input.Password/>
                        </Form.Item>
                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type="primary" htmlType="submit" >Login</Button>
                        </Form.Item>
                    </Form>
                </Col>
           </Row>
        )
     }
}
export default LoginPage;