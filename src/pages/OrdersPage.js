import React, {Component} from 'react';
import {ordersDataColumns} from "../tableColumnsData/ordersDataColumns";
import EditableTableRow, {EditableContext} from "../components/EditableTableRow";
import '@ant-design/compatible/assets/index.css';
import {Button, Layout, notification, Popconfirm, Select, Space, Table, Typography,AutoComplete,Input,Icon} from "antd";
import API from "../server-apis/api";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
import EditableTableCell from "../components/EditableTableCell";
import {Link} from "react-router-dom";
import {Content} from "antd/es/layout/layout";
import Search from "antd/es/input/Search";
import Text from "antd/es/typography/Text";
import { downloadExcel } from "react-export-table-to-excel";
import moment from 'moment';
import authService from '../services/auth.service';

const header = ["Id", "Customer", "Shippment Date","Status","Note 1","Note 2","Contact Person"];

class OrdersPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: true,
            editingKey: "",
            errorMessage:null,
            options:[],
            filteredData:[]
        };
        this.token = "Bearer " + JSON.parse(localStorage.getItem("token"));
        this.onSearch = this.onSearch.bind(this);
        this.exportToExcel = this.exportToExcel.bind(this);
        this.onChange = this.onChange.bind(this);

    }
    exportToExcel()
    {
      let order = this.state.data.map((order) => {
            return {
                id:order.id,
                customer:order.customerName,
                shippmentDate: moment(order.shippmentDate).format('DD.MM.YYYY'),
                status:order.status,
                note1:order.note1,
                note2:order.note2,
                contactPersonName:order.contactPersonName
            };
          });
          
        downloadExcel({
            fileName: "Orders",
            sheet: "Sheet 1",
            tablePayload: {
              header,
              body:order,
            },
          });
    }
    handleChange(value) {
        const params = new URLSearchParams();
        params.append('status', value);
        API.get(`orders/filter-order-status`,{  params: { status: value },headers: { Authorization: this.token}})
            .then((res) => {
                this.setState({loading:false});
            })
            .catch(error => {
                var message=JSON.stringify(error.response.data.error_message);
                if(message.includes("The Token has expired"))
                {
                    this.setState({errorMessage:"Your token has expired"});
                    this.errorHappend("Your token has expired.");
                    authService.logout();
                }
                else
                {
                    this.setState({errorMessage:error,loading:true})
                }
                this.errorHappend("Failed to load data");
                console.error('There was an error!', error);
        });
    }

    filterOrdersByStatus=(value)=>{
        this.setState({loading:true})
        const params = new URLSearchParams();
        params.append('status', value);
        const token="Bearer "+ JSON.parse(localStorage.getItem("token"));
        if(value==="ALL"){
            var allOrders=this.state.data;
            this.setState({loading:false,filteredData:allOrders})
        }
        else{
            API.get(`orders/filter-order-status`,{  params: { status: value },headers: { Authorization: token}})
                .then(res => {
                    if(!Object.keys(res.data).length){
                        this.setState({loading: false,filteredData:null });
                    }
                    else {
                    this.setState({loading:false,filteredData:res.data._embedded.ordersDtoList})
                    }
                }).catch(error => {
                var message=JSON.stringify(error.response.data.error_message);
                if(message.includes("The Token has expired"))
                {
                    this.setState({errorMessage:"Your token has expired"});
                    this.errorHappend("Your token has expired.");
                    authService.logout();
                }
                else
                {
                    this.setState({errorMessage:error,loading:false})
                }
                this.errorHappend("Failed to filter data");
                console.error('There was an error!', error);
            });
        }
    }
    changeOrderStatus(id,value){
        const params = new URLSearchParams();
        params.append('status', value);
        API.patch(`orders/change-status/${id}`,params,{ headers: { Authorization: this.token}})
            .then(res => {
                const index = this.state.data.findIndex(order => order.id === id), orders = [...this.state.data] // important to create a copy, otherwise you'll modify state outside of setState call
                orders[index] = res.data;
                this.setState({data: orders});
                this.successfullyAdded("Order status has been changed");
            })
            .catch(error => {
                var message=JSON.stringify(error.response.data.error_message);
                if(message.includes("The Token has expired"))
                {
                    this.setState({errorMessage:"Your token has expired"});
                    this.errorHappend("Your token has expired.");
                    authService.logout();
                }
                else
                {
                    this.setState({errorMessage:error,loading:true})
                }
                this.errorHappend("Failed to change status");
                console.error('There was an error!', error);
        });
    }

    cancel = () => {
        this.setState({ editingKey: "" });
    };
    componentDidMount() {
        API.get(`orders`,{ headers: { Authorization: this.token}})
            .then(res => {
                if(!Object.keys(res.data).length){
                    console.log("no data found");
                    this.setState({loading: false,data:null });
                }
                else
                {
                    const orders = res.data._embedded.ordersDtoList;
                    const opt=orders.map((item,index) => {
                        return {
                            label:item.id.toString(),value:item.id.toString()
                        }});
                    this.setState({loading: false,data:orders,options:opt,filteredData:orders });
                }
            })
            .catch(error => {
                var message=JSON.stringify(error.response.data.error_message);
                if(message.includes("The Token has expired"))
                    {
                        this.setState({errorMessage:"Your token has expired"});
                        this.errorHappend("Your token has expired.");
                        authService.logout();
                    }
                else
                {
                    this.setState({errorMessage:error,loading: false})
                }
                this.errorHappend("Failed to load data");
                console.error('There was an error!', error);
        });
    }
    async remove(id) {
        API.delete(`/orders/${id}`,{ headers: { Authorization: this.token}})
            .then(() => {
                let updatedOrders = [...this.state.data].filter(i => i.id !== id);
                this.setState({data: updatedOrders,filteredData:updatedOrders});
                this.successfullyAdded("Order is deleted");
            }).catch(error => {
            var message=JSON.stringify(error.response.data.error_message);
            if(message.includes("The Token has expired"))
            {
                this.setState({errorMessage:"Your token has expired"});
                this.errorHappend("Your token has expired.");
                authService.logout();
            }
            else
            {
                this.setState({errorMessage:error})
            }
            this.errorHappend("Failed to delete product");
            console.error('There was an error!', error);
        });
    }
    onChange = (input) => {
        let value = input.target.value.toLowerCase();
        let result = [];
        if(value===""||this.hasWhiteSpace(value))
        {
            result=this.state.data;
            this.setState({filteredData:result});
            return;
        }
       result = this.state.data.filter((order) => {return order.id.toString().search(value) !== -1});
       this.setState({filteredData:result});
    }
    hasWhiteSpace(s) {
        return /\s/g.test(s);
    }
    saveData(form,id) {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            const newData = [...this.state.data];
            const index = newData.findIndex(item => id === item.id);
            const item = newData[index];
            newData.splice(index, 1, {
                ...item,
                ...row
            });
            API.put(`/orders/update/${id}`, row,{headers: { Authorization: this.token}})
                .then((response )=>
                {
                    this.setState({ data: newData, editingKey: "",filteredData:newData });
                    this.successfullyAdded("Order is updated");
                })
                .catch(error => {
                    var message=JSON.stringify(error.response.data.error_message);
                    if(message.includes("The Token has expired"))
                    {
                        this.setState({errorMessage:"Your token has expired"});
                        this.errorHappend("Your token has expired.");
                        authService.logout();
                    }
                    else
                    {
                        this.setState({errorMessage:error,loading:true})
                    }
                    this.errorHappend("Failed to save data");
                    console.error('There was an error!', error);
                });
        });
    }
    onSearch (value){
        //check if user has entered number
            if(value===""||this.hasWhiteSpace(value))
                this.componentDidMount();
            else{
                var regex=/^[0-9]+$/;
                if(value.match(regex))
                {
                    this.setState({ loading: true });
                    const params = new URLSearchParams();
                    params.append('id', value);
            }
                else
                {
                    this.errorHappend("Searching is only done by ID");
                }
            }
        }
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
        const components = {
            body: {
                row: EditableTableRow,
                cell: EditableTableCell
            }
        };
  
        const columns = ordersDataColumns.map(col => {
            if (col.dataIndex === 'status') {
                return {
                    ...col,
                    render: (status, record) => {
                        return(
                        <Select defaultValue={status} mode="single"  style={{ width: 120 }} onChange={this.changeOrderStatus.bind(this,record.id)}>
                            <Select.Option value="WAITING">Waiting</Select.Option>
                            <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
                            <Select.Option value="COMPLETED">Completed</Select.Option>
                            <Select.Option value="CANCELLED">Cancelled</Select.Option>
                        </Select>
                        )
                    }}
            }
            if (col.dataIndex === 'actions') {
                return {
                    ...col,
                    render: (text, record) => {
                        return(
                            <Space size='middle'>
                                <Link to={`${record.id}`}>
                                    <span>Edit</span>
                                </Link>
                                <Popconfirm title='Are you sure you want to delete this product?' onConfirm={() => this.remove(record.id)}>
                                    <Typography.Link disabled={this.state.editingKey !== ''} type="danger">Delete</Typography.Link>
                                </Popconfirm>
                            </Space>
                        );
                    }
                };
            }
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => {
                    const checkInput = index => {
                        switch (index) {
                            case "price":
                                return "number";
                            default:
                                return "text";
                        }
                    };
                    return {
                        record,
                        inputType: checkInput(col.dataIndex),
                        dataIndex: col.dataIndex,
                        title: col.title,
                        editing: this.isEditing(record)
                    };
                }
            };
        });
        const { data, loading,filteredData } = this.state;
        const options = data.map((item,index) => {
            return {
                label:item.id.toString(),value:item.id.toString()
            }
        });
        if (this.state.errorMessage) {
            return <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Text style={{fontSize:"22px"}}>Error: {this.state.errorMessage}</Text>
                {this.state.errorMessage.includes("token")&&(<Link to="/login">
                    <Button>Click here to login again</Button>
                </Link>)}
            </Space>;
        } else
        {
        return (
            <Layout>
                <div style={{marginBottom:"1em", marginTop:"1em" }}>
                <Button style={{ float:"left" }} onClick={this.exportToExcel}>Export to Excel</Button>
                    <Link to="/orders/create-new-order">
                        <Button style={{float:"right", background: "#0AC035",}}
                                type="primary">New order</Button>
                    </Link>
                </div>
                <Content>
                <div style={{display:"inline-flex", marginTop:"1em"}}>
                    <p style={{marginTop:"3px",marginRight:"5px"}}>Filter orders by: </p>
                       <Select defaultValue={"All"} mode="single"  style={{ width: 120 }}  onChange={this.filterOrdersByStatus}>
                           <Select.Option value="ALL">All</Select.Option>
                           <Select.Option value="WAITING">Waiting</Select.Option>
                           <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
                           <Select.Option value="COMPLETED">Completed</Select.Option>
                           <Select.Option value="CANCELLED">Cancelled</Select.Option>
                       </Select>
                   </div>
                    <div style={{marginBottom:"1em"}}>
                    {/* <AutoComplete options={options} onSelect={this.onSearch} 
                                  filterOption={(inputValue, option) =>
                                                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1 }>
                        <Input.Search size="large" placeholder="Search order by id" enterButton allowClear/>
                    </AutoComplete> */}
                        <Search  allowClear placeholder="Search order by id" onChange={this.onChange} />
                    </div>
                   
                    <Table components={components} bordered dataSource={filteredData} columns={columns} loading={loading} rowKey="id" rowClassName="editable-row"/>
                </Content>
            </Layout>
        );
    }}
}

export default OrdersPage;