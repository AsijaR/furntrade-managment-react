import React, {Component} from 'react';
import {Row, Col, Typography, Input, Form, Select, DatePicker, Space, Button, Modal, Divider} from "antd";
import moment from 'moment';
import API from "../server-apis/api";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
import OrderedProductsTable from "../components/OrderedProductsTable";
import AddNewProductsToOrder from "../components/AddNewProductsToOrder";
const { Text } = Typography;

class OrderDetails extends Component {
    constructor(props) {
        super(props);
        this.state={
            error: null,
            isLoaded: false,
            data: [],
            selectedCustomer:"",
            orderStatus:"",
            customers:[],
            products:[],
            isModalVisible:false
        }
        this.token="Bearer "+ JSON.parse(localStorage.getItem("token"));
        this.onFinish=this.onFinish.bind(this);
        this.onFinishFailed=this.onFinishFailed.bind(this);
        this.handler = this.handler.bind(this)
    }
    handler(order,newProduct) {
        this.setState({
            data:order,
            products:  [...this.state.products,newProduct]
        })
    }
    selectSomeProperties(account) {
        return Object.keys(account).reduce(function(obj, k) {
            if (["id","name","address","city"].includes(k)) {
                obj[k] = account[k];
            }
            return obj;
        }, {});
    }
    reformatArrray(account) {
        return account.map(function(customer) {
            var newObj = {};
            newObj["id"] = customer.id;
            newObj["fullName"] = customer.name+","+ customer.address+","+customer.city;
            // return our new object.
            return newObj;
        });
    }
    async componentDidMount() {
        let url = window.location.pathname;
        var currentCustomer="";
        var orderId = url.substring(url.lastIndexOf('/') + 1);
        await API.get(`orders/${orderId}`,{ headers: { Authorization: this.token}})
            .then(
                (res) => {
                    const orderDetails = res.data;
                    //   console.log(orderDetails)
                    let orderedProducts=orderDetails.orderedProducts.map((p)=>{
                        return {
                            id: p.product.id,
                            color: p.product.color,
                            model: p.product.model,
                            name: p.product.name,
                            price: p.product.price,
                            quantity: p.quantity,
                        }
                    })
                    currentCustomer=orderDetails.customer.name;
                    this.setState({
                        isLoaded: true,
                        data:orderDetails,
                        products:orderedProducts,
                        orderStatus:orderDetails.status
                    });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
        await API.get(`customers`,{ headers: { Authorization: this.token}})
            .then(
                (res) => {
                    const customerList = res.data._embedded.customerList;
                    var c=[];
                    var name="";
                    customerList.forEach(x=>{
                        c.push(this.selectSomeProperties(x));
                    })
                    var fullNameArray = this.reformatArrray(c);
                    fullNameArray.forEach(x=>{
                        if(x.fullName.includes(this.state.selectedCustomer))
                           name=x.fullName;
                           // this.setState({selectedCustomer:name});
                    })
                    this.setState({customers:fullNameArray,selectedCustomer:name});
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    onFinish = (values) => {
        console.log('Success:', values);
    };
    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    showModal = () => {
        this.setState({
            isModalVisible:  true
        })
    };
    handleCancel = () => {
        this.setState({
            isModalVisible:  false
        })
    };
    render() {
        const { error, isLoaded, data,selectedCustomer,orderStatus,customers,products,isModalVisible } = this.state;
        let options = []
        if (customers.length > 0) {
            customers.forEach(role => {
                let roleDate = {};
                roleDate.value = role.id;
                roleDate.label = role.fullName;
                options.push(roleDate)
            })
        }
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (

                <Space direction="vertical" style={{width:"100%"}}>
                    <Text mark style={{fontSize:"22px"}} >Order id: {data.id}</Text>
                    <Button type="default" onClick={this.showModal} style={{float:"right", marginRight:"4.5em"}} size="middle"> Add more products to the order</Button>
                    <Modal title="Add product to the order" visible={isModalVisible} onOk={this.handleOk} onCancel={this.handleCancel}
                           footer={[<Button key="back" onClick={this.handleCancel}> Cancel </Button>]}>
                        <AddNewProductsToOrder orderId={data.id} token={this.token} handler = {this.handler}/>
                    </Modal>
                    <Form name="basic"
                        initialValues={{
                            //mozda ovo popravi prikaz al nije bitno
                            customer:data.customer.name,
                        //    shippmentDate:moment(this.state.data.shippmentDate),
                            note1:data.note1,
                            note2:data.note2,
                            status:orderStatus
                        }}
                        onFinish={this.onSaveChanges} onFinishFailed={this.onSaveChangesFailed} autoComplete="off">
                        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                            <Col className="gutter-row" span={8}>
                                <div style={{ padding: '8px' }}>
                                    <Form.Item label="Customer" name="customer" rules={[ {required: true,message: 'Please pick a customer',}, ]}>
                                        <Select mode="single" options={options} />
                                    </Form.Item>

                                    <Form.Item label="Shipping date" name="shippmentDate" rules={[ {required: true,message: 'Please pick a date',}, ]}>
                                        <DatePicker format="DD.MM.YYYY" onChange={this.onChange} picker="date" />
                                    </Form.Item>

                                    <Form.Item label="Status" name="status" rules={[ {required: true,message: 'Please pick a status',}, ]}>
                                        <Select mode="single" >
                                            <Select.Option value="WAITING">Waiting</Select.Option>
                                            <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
                                            <Select.Option value="COMPLETED">Completed</Select.Option>
                                            <Select.Option value="CANCELLED">Cancelled</Select.Option>
                                        </Select>
                                    </Form.Item>

                                    {/*za rules stavi da pazi sta kuca*/}
                                    <Form.Item label="Note 1" name="note1" rules={[ {required: false,message: 'Please pick a date',},{
                                        pattern: /^[a-zA-Z0-9]+$/,
                                        message: 'Name can only include letters and numbers.',
                                    } ]}>
                                        <Input/>
                                    </Form.Item>
                                    <Form.Item label="Note 2" name="note2" rules={[ {required: false,message: 'Please pick a date',},{
                                        pattern: /^[a-zA-Z0-9]+$/,
                                        message: 'Name can only include letters and numbers.',
                                    } ]}>
                                        <Input/>
                                    </Form.Item>
                                    <Space direction="horizontal">
                                        <Text strong>Total price: {this.state.data.totalOrderPrice} €</Text>
                                    </Space>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" style={{width:"10em", marginTop:"2em", marginRight:"4em"}}>Save</Button>
                                    </Form.Item>
                                </div>
                            </Col>
                            <Divider type="vertical" style={{ height: "22em", backgroundColor: "#7c7d7c" }}/>
                            <Col className="gutter-row" span={15}>
                                <div style={{ padding: '8px' }}>
                                    <h3>Ordered products</h3>
                                    <OrderedProductsTable orderId={data.id} products={products} token={this.token}/>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Space>
        )};
    }
}

export default OrderDetails;