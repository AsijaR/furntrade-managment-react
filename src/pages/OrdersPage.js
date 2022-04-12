import React, {Component} from 'react';
import {ordersDataColumns} from "../tableColumnsData/ordersDataColumns";
import EditableTableRow, {EditableContext} from "../components/EditableTableRow";
import '@ant-design/compatible/assets/index.css';
import {Button, Layout, notification, Popconfirm, Select, Space, Table, Typography} from "antd";
import API from "../server-apis/api";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
import EditableTableCell from "../components/EditableTableCell";
import {Link} from "react-router-dom";
import {Content} from "antd/es/layout/layout";
import Search from "antd/es/input/Search";

class OrdersPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            // pagination: {
            //     current: 1,
            //     pageSize: 10,
            // },
            loading: false,
            editingKey: "",
            errorMessage:""
        };
        this.token = "Bearer " + JSON.parse(localStorage.getItem("token"));
        this.onSearch = this.onSearch.bind(this);
    }

    handleChange(value) {
        const params = new URLSearchParams();
        params.append('status', value);
        API.get(`orders/filter-order-status`,{  params: { status: value },headers: { Authorization: this.token}})
            .then((res) => {
                console.log(res.data._embedded.ordersDtoList);
           //     this.state.data=res.data._embedded.ordersDtoList;
                this.setState({loading:false});
             //   console.log(this.state.data);
                //this.setState({loading:false,data: res.data._embedded.ordersDtoList});
            }).catch(e=>{
                console.log(e);
                this.setState({loading:true})
        });
    }
    //VRATI SE NA OVO, NESTO OVDE NIJE DORO
    filterOrdersByStatus=(value)=>{
        this.setState({loading:true})
        const params = new URLSearchParams();
        params.append('status', value);
        const token="Bearer "+ JSON.parse(localStorage.getItem("token"));
        if(value==="ALL"){
            this.componentDidMount();
        }
        else{
            API.get(`orders/filter-order-status`,{  params: { status: value },headers: { Authorization: token}})
                .then(res => {
                    this.setState({loading:false,data:res.data._embedded.ordersDtoList})
                }).catch(e=>{
                    console.log(e);
                this.errorHappend("");
                this.setState({loading: false});
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
            });
    }

    cancel = () => {
        this.setState({ editingKey: "" });
    };
    componentDidMount() {
        this.setState({ loading: true });
        API.get(`orders`,{ headers: { Authorization: this.token}})
            .then(res => {
                const orders = res.data._embedded.ordersDtoList;
                this.setState({loading: false,data:orders });
            });
    }
    async remove(id) {
        API.delete(`/orders/${id}`,{ headers: { Authorization: this.token}})
            .then(() => {
                let updatedOrders = [...this.state.data].filter(i => i.id !== id);
                this.setState({data: updatedOrders});
                this.successfullyAdded("Order is deleted");
            }).catch((error)=>{
            this.errorHappend("");
        });
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
                    this.setState({ data: newData, editingKey: "" });
                    this.successfullyAdded("Order is updated");
                })
                .catch(error => {
                    this.setState({ errorMessage: error.message });
                    this.errorHappend("");
                    console.error('There was an error!', error);
                });
        });
    }
    onSearch (value){
        //check if user has entered number
        if(!isNaN(+value)){
            this.setState({ loading: true });
            if(value===""||this.hasWhiteSpace(value))
                this.componentDidMount();
            else{
                const params = new URLSearchParams();
                params.append('id', value);
                API.get(`orders/search/`, { params: { id: value },headers: { Authorization: this.token}})
                    .then(res => {
                        this.state.data=[];
                        this.state.data.push(res.data);

                        this.setState({loading: false,data:this.state.data})
                    }).catch(e=>{
                        this.errorHappend("Theres not order found with given ID number");
                        this.setState({loading: false})
                });
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
                `There was an error! ${error}`,
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
        const { data, loading } = this.state;
        return (
            <Layout>
                <div>
                   <div style={{display:"inline-flex", marginTop:"1em"}}><p style={{marginTop:"3px",marginRight:"5px"}}>Filter orders by: </p>
                       <Select defaultValue={"All"} mode="single"  style={{ width: 120 }}  onChange={this.filterOrdersByStatus}>
                           <Select.Option value="ALL">All</Select.Option>
                           <Select.Option value="WAITING">Waiting</Select.Option>
                           <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
                           <Select.Option value="COMPLETED">Completed</Select.Option>
                           <Select.Option value="CANCELLED">Cancelled</Select.Option>
                       </Select>
                   </div>
                    <Link to="/orders/create-new-order">
                        <Button style={{float:"right", background: "#0AC035",marginBottom:"1em", marginTop:"1em" }}
                                type="primary">New order</Button>
                    </Link>
                </div>
                <Content>
                    <div style={{marginBottom:"1em"}}>
                        <Search  allowClear placeholder="Search order by id" onSearch={this.onSearch}  />
                    </div>
                    <Table components={components} bordered dataSource={data} columns={columns} loading={loading} rowKey="id" rowClassName="editable-row"/>
                </Content>
            </Layout>
        );
    }
}

export default OrdersPage;