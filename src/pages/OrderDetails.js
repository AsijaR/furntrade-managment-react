import React, {Component} from 'react';
import API from "../server-apis/api";
import {Row, Col, Typography, Input, Form, Select, DatePicker, Space, Divider} from "antd";
import OrderDetailsFirstCol from "../components/OrderDetailsFirstCol";
import moment from 'moment';
const { Text } = Typography;
class OrderDetails extends Component {
    constructor(props) {
        super(props);
    }
    state = {
        data: [],
        customers:[],
        products:[],
        selectedCustomer:"",
        orderStatus:"",
        loading: false,
        editingKey: "",
        errorMessage:""
    };

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
        var orderId = url.substring(url.lastIndexOf('/') + 1);
        this.setState({ loading: true });
        const token="Bearer "+ JSON.parse(localStorage.getItem("token"));
        await API.get(`orders/${orderId}`,{ headers: { Authorization: token}})
            .then(res => {
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
                console.log("edde",orderedProducts)
                this.setState({loading: false,data:orderDetails,selectedCustomer:orderDetails.customer.name, orderStatus:orderDetails.status,products:orderedProducts});
            });
        await API.get(`customers`,{ headers: { Authorization: token}})
            .then(res => {
                const customerList = res.data._embedded.customerList;
                var c=[];
                customerList.forEach(x=>{
                    c.push(this.selectSomeProperties(x));
                })
                var fullNameArray = this.reformatArrray(c);
                fullNameArray.forEach(x=>{
                    if(x.fullName.includes(this.state.selectedCustomer))
                        this.state.selectedCustomer=x.fullName;
                })
                this.setState({customers:fullNameArray});
            });
    }
     onChange(date, dateString) {
        console.log(date, dateString);
    }
    renderList() {
        return (this.state.customers.map(data =>({label:data.fullName,value:data.value})))
    }
    render() {
        let option = []
        if (this.state.customers.length > 0) {
            this.state.customers.forEach(role => {
                let roleDate = {};
                roleDate.value = role.id;
                roleDate.label = role.fullName;
                option.push(roleDate)
            })
        }
        return (

            <Space direction="vertical" style={{width:"100%"}}>
                <Text mark style={{fontSize:"22px"}} >Order id: {this.state.data.id}</Text>
                    <Form
                        //name="basic"
                        // labelCol={{ span: 8 }}
                        // wrapperCol={{ span: 16 }}
                        initialValues={{ status: this.state.orderStatus,
                            shippmentDate:moment(this.state.data.shippmentDate),
                          //  note1:this.state.data.note1
                        }}
                        // onFinish={onFinish}
                        // onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                        <Col className="gutter-row" span={8}>
                            <div style={{border: '2px solid black', padding: '8px' }}>
                                <Form.Item label="Customer"  rules={[ {required: true,message: 'Please pick a customer',}, ]}>
                                    <div style={{display:"none"}}></div>
                                    <Select value={this.state.selectedCustomer} name="customera" mode="single" options={option} />
                                </Form.Item>

                                <Form.Item label="Shipping date" name="shippmentDate" rules={[ {required: true,message: 'Please pick a date',}, ]}>
                                    <DatePicker format="DD.MM.YYYY" onChange={this.onChange} picker="date" />
                                </Form.Item>

                                <Form.Item label="Status" name="status">
                                    <div style={{display:"none"}}></div>
                                    <Select value={this.state.orderStatus}  mode="single" >
                                        <Select.Option value="WAITING">Waiting</Select.Option>
                                        <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
                                        <Select.Option value="COMPLETED">Completed</Select.Option>
                                        <Select.Option value="CANCELLED">Cancelled</Select.Option>
                                    </Select>
                                </Form.Item>

                                {/*za rules stavi da pazi sta kuca*/}
                                <Form.Item label="Note 1" name="note1" rules={[ {required: false,message: 'Please pick a date',}, ]}>
                                    <Input value={this.state.data.note1}/>
                                    <div style={{display:"none"}}></div>
                                </Form.Item>
                                <Form.Item label="Note 2" name="note2" rules={[ {required: false,message: 'Please pick a date',}, ]}>
                                    <Input value={this.state.data.note2}/>
                                    <div style={{display:"none"}}></div>
                                </Form.Item>
                                <Space direction="horizontal">
                                    <Text strong>Total price: {this.state.data.totalOrderPrice} €</Text>
                                </Space>

                            </div>
                            </Col>
                            <Col className="gutter-row" span={15}>
                                <div style={{border: '2px solid black', padding: '8px' }}>
                                    <h3>Ordered products</h3>
                                <OrderDetailsFirstCol products={this.state.products}/>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            Sacuvaj podatke
                        </Row>
                    </Form>
            </Space>
        );
    }
}

export default OrderDetails;