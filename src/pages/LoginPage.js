import React, {Component} from 'react';
import '@ant-design/compatible/assets/index.css';
import { Form,Button, Col, Input, notification, Row,Spin,Typography,Alert  } from "antd";
import AuthService from "../services/auth.service";
import API from '../server-apis/api';
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
class LoginPage extends Component{
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            loading: false,
            message: "",
            hideAlert:true,
            loginContentButton:"Login"
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
        this.setState({ message: "", loading: true ,loginContentButton:"Logging"});
        const params = new URLSearchParams();
        params.append('username', values.username);
        params.append('password',  values.password);
        API.post("login", params).then((response) => {
            this.setState({ message: "", loading: true });
            console.log("asija"+response);
            if (response.data.access_token) {
                localStorage.setItem('token', JSON.stringify(response.data.access_token));
                this.successfullyAdded();
                this.setState({loading: false,hideAlert:true});
                window.location.href = 'https://furntrade.web.app/products';
                // window.location.href = 'http://localhost:3000/products';
            }}).catch((error)=>{
                this.setState({message: "Entered data is not correct.", 
                        loading: false,hideAlert:false,loginContentButton:"Login"});
                console.log(error);
            });
    }
        
    successfullyAdded = () => {
        notification.info({
            message: `Notification`,
            description:
                'Successfully logged',
            placement:"bottomRight",
            icon: <CheckCircleFilled style={{ color: '#0AC035' }} />
        });
    };
    errorHappend = () => {
        notification.info({
            message: `Notification`,
            description: "Entered data is not correct.",
            placement:"bottomRight",
            icon: <InfoCircleFilled style={{ color: '#f53333' }} />
        });
    };
     render() {
        const {loading,message,hideAlert,loginContentButton} = this.state;
                return(
                <Row style={{ width: "100vw", height: "100vh"}}>
                    <Col span={12} >
                        <div style={{backgroundColor:"#1b1f24", width:"80%", height:"80%",float:"right",marginTop:"5em",textAlign:"center"}}>
                            <img src="/images/logoBC.png" alt="logo" style={{marginTop:"10em"}} />
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
                                    <Button type="primary" htmlType="submit" loading={loading}>{loginContentButton}</Button>
                                </Form.Item>
                            </Form>
                           {!hideAlert&& (<Alert message={message} type="error" />)}
                        </div>
                    </Col>
            </Row>
                )
       //     }

     }
}
export default LoginPage;