import React, {Component} from 'react';
import '@ant-design/compatible/assets/index.css';
import { Form,Button, Col, Input, notification, Row,Spin,Typography } from "antd";
import {Content,Header} from "antd/es/layout/layout";
import AuthService from "../services/auth.service";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
class LoginPage extends Component{
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            loading: false,
            message: "",
            loginButtonClicked:false 
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
            loading: true,
            loginButtonClicked:true
        });
        AuthService.login(values.username, values.password)
            .then(() => {
                  //  this.props.history.push('/settings')
                    this.successfullyAdded();
                    this.setState({
                        loading: false,
                        loginButtonClicked: false
                    });
                    window.location.href = 'https://furntrade.web.app/products';
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
                            message: resMessage,
                            loginButtonClicked: false
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
        const {loading,loginButtonClicked} = this.state;
            if(loginButtonClicked){
                return ( 
                        <Spin tip="Loading..." loading={loading} style={{ left: "50%", position: "absolute",textAlign: "center",top: "50%"}}></Spin>
                );
            }
            else{
                return(
                //     marginTop:"2em", marginLeft:"5em",marginRight:"5em", 
                // marginBottom:"2em",
                <Row style={{   width: "100vw", height: "100vh"}}>
                    <Col span={12} >
                        <div style={{backgroundColor:"#1b1f24", width:"80%", height:"80%",float:"right",marginTop:"5em",textAlign:"center"}}>
                            <img src="/images/logoBC.png" alt="logo" style={{marginTop:"10em"
                                // display: "block",marginLeft: "auto",marginRight:"auto",
                                // marginTop:"auto",marginBottom:"auto",width: "50%"
                                }} />
                        </div>
                    </Col>
                    <Col span={8} style={{backgroundColor:"#f5f7f6", width:"80%", height:"80%",marginTop:"5em"}}>
                        <div style={{marginLeft:"4em",marginRight:"4em",marginTop:"3em"}}>
                            <Typography.Title level={3} style={{marginBottom:"2em"}}>Please login to access to the system</Typography.Title>
                            <Form name="loginForm"
                                layout="vertical"
                                onFinish={this.onFinish}
                                // onFinishFailed={this.onFinishFailed}
                                autoComplete="off">
                                <Form.Item label="Username" name="username" rules={[ {required: true,message: 'Please enter username',}, ]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Password" name="password" rules={[ {required: true,message: 'Please enter password',}, ]}>
                                    <Input.Password/>
                                </Form.Item>
                                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                    <Button type="primary" htmlType="submit" >Login</Button>
                                </Form.Item>
                            </Form>
                        </div>
                    </Col>
            </Row>
                )
            }

     }
}
export default LoginPage;