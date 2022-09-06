import React, {Component} from 'react';
import '@ant-design/compatible/assets/index.css';
import {Button, Form, Card, Input, InputNumber, Row, Col, notification, Space,Select,message, Upload, Spin } from "antd";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
import API from "../server-apis/api";
import Text from "antd/es/typography/Text";
import {Link} from "react-router-dom";
import authService from '../services/auth.service';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import "../styles/avatarStyle.css";

const materialOptions = [
    {
      value: 'Fabric',
    },
    {
      value: 'Leather',
    },
    {
      value: 'Plastic',
    },
    {
        value: 'Steel',
    },
    {
        value: 'Acrylic',
    },
    {
        value: 'Glass',
    },
    {
        value: 'Wood',
    }
  ];
class AddProductPage extends Component {
    constructor(props) {
        super(props);
        this.state={
            errorMessage:null,
            options:materialOptions,
            chosenMaterial:"",
            loading:false,
            photoBase64Info:"",
            product:[],
            productExist:false,
            productTitle:" ",
            isLoaded:false,
            productId:null,
            initialFormValues:{},
        }
        this.token="Bearer "+ JSON.parse(localStorage.getItem("token"));
        this.beforeUpload = this.beforeUpload.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    updateProduct(values)
    {
        console.log("update");
        let product = { ...values}; 
        product.photoBase64Info = this.state.photoBase64Info; 
        API.put(`/products/update/${this.state.productId}`, product,{headers: { Authorization: this.token}})
                .then((response )=>
                {
                    this.setState({ isLoaded:true,
                        initialFormValues: {
                        name: product.name,
                        model:product.model,
                        color:product.color,
                        material:product.material,
                        price:product.price
                    } });
                    this.successfullyAdded("Product is updated");
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
                    this.errorHappend("Failed to save");
                    console.error('There was an error!', error);
                });
        
    }
    componentDidMount()
    {
        let url = window.location.pathname;
        if(!url.includes("add-product"))
        {
            var productId = url.substring(url.lastIndexOf('/') + 1);
            this.setState({productId:productId});
            //if user wants to edit a product
            API.get(`/products/${productId}`,{headers: { Authorization: this.token}})
                .then((response )=>
                {
                  
                    var p=response.data;
                    var photoString="";
                    if(p.photo)
                        photoString=p.photoBase64Info+","+p.photo;
                    this.setState({ isLoaded:true,
                        initialFormValues: {
                        name: p.name,
                        model:p.model,
                        color:p.color,
                        material:p.material,
                        price:p.price
                    },productExist:true,photoBase64Info:photoString,productTitle:"Update product" });
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
                    this.errorHappend("Failed to save");
                    console.error('There was an error!', error);
                });
        
        }
        else
        {
            this.setState({isLoaded:true,product: {
                name: "",
                model:"",
                color:"",
                material:"",
                price:""
            }, productTitle:"Add new product info"});
        }
    }
    getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
      };
    beforeUpload = (file) => 
    {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      
        if (!isJpgOrPng) {
          message.error('You can only upload JPG/PNG file!');
        }
      
        const isLt2M = file.size / 1024 / 1024 < 2;
      
        if (!isLt2M) {
          message.error('Image must smaller than 2MB!');
        }
      
        return isJpgOrPng && isLt2M;
    };

    handleChange = (info) => {
        if (info.file.status === 'uploading') {
            this.setState({loading:true});
          return;
        }
        if (info.file.status === 'uploading') {
            this.errorHappend("Couldnt upload image right now, please wait or reload page.");
            this.setState({ loading: true, image: null });
            info.file.status = 'done';
        }

        if (info.file.status === 'done') {
          // Get this url from response in real world.
          this.getBase64(info.file.originFileObj, (url) => {
            console.log("nesto vrtin");
            this.setState({loading:false,photoBase64Info:url});
          });
        }
      };
      
    onFinish = (values) => {
        if(this.state.productExist)
            this.updateProduct(values);
        else
            this.addNewProduct(values);
    }
    addNewProduct(values)
    {
        console.log("update");
        let product = { ...values}; 
        product.photoBase64Info = this.state.photoBase64Info; 
        API.post(`/products/add`,product,{ headers: { Authorization: this.token}})
        .then((res) => {
            this.successfullyAdded("Product is successfully added");
             setInterval(() => {
                window.location.href = 'https://furntrade.web.app/products';
              }, 1000);
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
    }
    onFinishFailed = (errorInfo) => {console.log('Failed:', errorInfo);
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
                `There was an error! ${error}`,
            placement:"bottomRight",
            icon: <InfoCircleFilled style={{ color: '#f53333' }} />
        });
    };
    render() {
        const uploadButton = (
            <div>
              {this.state.loading ? <LoadingOutlined /> : <PlusOutlined />}
              <div  style={{ marginTop: 8 }}>
                Upload
              </div>
            </div>
          );
        const {options,productTitle,photoBase64Info,initialFormValues} = this.state;
        if (this.state.errorMessage) {
            return <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Text style={{fontSize:"22px"}}>Error: {this.state.errorMessage}</Text>
                <Link to="/login">
                    <Button>Click here to login again</Button>
                </Link>
            </Space>;
        } 
        else if (!this.state.isLoaded) {
            return <Spin/>
        }
        else {
            return (
                <Row style={{marginTop: "2em", marginLeft: "1em"}} >
                    <Col  offset={4} style={{marginRight:"1em",width:"70%"}}>
                    <Card title={productTitle} >
                        <Form name="addProductForm" layout="vertical" onFinish={this.onFinish}
                                  onFinishFailed={this.onFinishFailed} autoComplete="off"
                                  initialValues={initialFormValues}>
                            <Row style={{width:"100%"}} gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                                <Col className="gutter-row" span={12} style={{marginRight:"1em"}}>
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
                                                <Select allowClear options={options}/>
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
                                </Col>
                                <Col className="gutter-row" span={10}>
                                <Form.Item label="Product photo">
                                    <Upload name="avatar" listType="picture-card" className="avatar-uploader" 
                                            showUploadList={false} action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                            beforeUpload={this.beforeUpload}  onChange={this.handleChange}>
                                                    {photoBase64Info ? (  <img src={photoBase64Info} 
                                                    alt="avatar" style={{ width: '100%'}}/> ) : ( uploadButton )}
                                    </Upload>
                                 </Form.Item>
                                   
                                </Col>
                                    
                                </Row>
                            </Form>
                    </Card>
                    </Col>
                </Row>
            );
        }
    }
}

export default AddProductPage;