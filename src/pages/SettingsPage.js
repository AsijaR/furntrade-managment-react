import React, {Component} from 'react';
import AuthService from "../services/auth.service";
import {Button, Col, Form, Input, notification, Row, Space, Spin, Typography} from "antd";
import API from "../server-apis/api";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
import {Link} from "react-router-dom";
import authService from '../services/auth.service';
const { Text } = Typography;

class SettingsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: AuthService.getCurrentUser(),
            user:[],
            isLoaded:false,
            initialFormValues:[],
            errorMessage:null
        };
        this.token="Bearer "+ JSON.parse(localStorage.getItem("token"));
    }
    componentDidMount() {
         API.get(`users/${this.state.currentUser.username}`,{ headers: { Authorization: this.token}})
            .then(res => {
                this.setState({
                    user:res.data,
                    isLoaded:true,
                    initialFormValues: {
                        firstName:res.data.firstName,
                        lastName:res.data.lastName,
                        placeOfWork:res.data.placeOfWork,
                        email:res.data.email
                    }
                })
            })
            .catch((error)=>{
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
    }

    onFinish = (values) => {
        API.put(`/users/${this.state.currentUser.username}/update`,
            {
                username: this.state.currentUser.username,
                firstName: values.firstName,
                lastName: values.lastName,
                placeOfWork: values.placeOfWork,
                email: values.email,
            },{ headers: { Authorization: this.token}})
            .then((res) => {
                this.successfullyAdded("Your data is successflly changed!");
            })
            .catch((error)=>{
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
                this.errorHappend("Upps! Something went wrong. Please try again.");
                console.error('There was an error!', error);
        });
    };
    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    onFinishNewPassword = (values) => {
        API.patch(`/users/${this.state.currentUser.username}/change-password`,
            { oldPassword:values.currentPassword, newPassword:values.newPassword1},{ headers: { Authorization: this.token}})
            .then((res) => {
                this.successfullyAdded("Password is successflly changed!");
            })
            .catch((error)=>{
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
                this.errorHappend("Entered current password is wrong.");
                console.error('There was an error!', error);
            });
    };
    onFinishNewPasswordFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    successfullyAdded = (message) => {
        notification.info({
            message: `Notification`,
            description:message,
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
        const { errorMessage,user,initialFormValues} = this.state;
        if (errorMessage) {
            return <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Text style={{fontSize:"22px"}}>Error: {this.state.errorMessage}</Text>
                {errorMessage.includes("token")&&(<Link to="/login">
                    <Button>Click here to login again</Button>
                </Link>)}
            </Space>;
        }
        else if (!this.state.isLoaded) {
            return <Spin/>
        }
        else {
        return (
                <Row style={{marginTop:"2em", marginLeft:"1em"}}>
                    <Col span={10}>
                        <Text style={{fontSize:"22px"}} >Hello {user.username}</Text>
                        <Form name="userInfoForm"
                              initialValues={initialFormValues}
                              onFinish={this.onFinish} onFinishFailed={this.onFinishFailed} autoComplete="off">
                            <div style={{ padding: '8px' }}>
                                <Form.Item label="First name" name="firstName" rules={[ {required: true,message:"Please insert your first name"},{
                                    pattern: /^[a-zA-Z ]+$/,
                                    message: 'Name can only include letters',} ]}>
                                    <Input/>
                                </Form.Item>
                                <Form.Item label="Last name" name="lastName" rules={[ {required: true,message:"Please insert your last name"},{
                                    pattern: /^[a-zA-Z ]+$/,
                                    message: 'Name can only include letters.', } ]}>
                                    <Input/>
                                </Form.Item>

                                <Form.Item label="Place of work" name="placeOfWork" rules={[ {required: false},{
                                    pattern: /^[a-zA-Z ]+$/,
                                    message: 'Name can only include letters.', } ]}>
                                    <Input/>
                                </Form.Item>

                                <Form.Item label="Email" name="email"  rules={[ {required: false,type:"email",message:"Please enter valid email address"}]}>
                                    <Input/>
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" style={{width:"10em", marginTop:"2em", marginRight:"4em"}}>Save</Button>
                                </Form.Item>
                            </div>
                        </Form>
                    </Col>
                    <Col span={2}/>
                    <Col span={10}>
                        <Text style={{fontSize:"22px"}} >Change password</Text>
                        <Form onFinish={this.onFinishNewPassword} onFinishFailed={this.onFinishNewPasswordFailed} autoComplete="off">
                            <Form.Item label="Current password" name="currentPassword" rules={[ {required: true,message:"Please insert your current password"},{
                                pattern: /^[a-zA-Z0-9!@.,?#\$%\^&\* ]+$/,
                                message: 'Note can only include letters',} ]}>
                                <Input.Password/>
                            </Form.Item>
                            <Form.Item label="New password" name="newPassword1" hasFeedback rules={[ {required: true,message:"Please insert your new password"},{
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@.?#\$%\^&\*])(?=.{8,})/,
                                message: 'Password needs to inlude at least one lowercase, uppercase, numeric and special character and to be at least 8 characters long',} ]}>
                                <Input.Password/>
                            </Form.Item>
                            <Form.Item label="Confirm password" name="newPassword2" dependencies={['newPassword1']} hasFeedback rules={[
                                {   required: true,message:"Please insert your new name"},
                                // {   pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@.?#\$%\^&\*])(?=.{8,})/,
                                //     message: 'Password needs to inlude at least one lowercase, uppercase, numeric and special character and to be at least 8 characters long',},
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword1') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                    },
                                }),
                            ]}>
                                <Input.Password/>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{width:"10em", marginTop:"2em", marginRight:"4em"}}>Change password</Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
        );
    }}
}

export default SettingsPage;