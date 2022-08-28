import React, {Component} from 'react';
import API from "../server-apis/api";
import {Button, Layout, notification, Popconfirm, Space, Table, Typography} from "antd";
import {Content} from "antd/es/layout/layout";
import EditableTableRow, {EditableContext} from "../components/EditableTableRow";
import {customersDataColumns} from "../tableColumnsData/customersDataColumns";
import EditableTableCell from "../components/EditableTableCell";
import {Link} from "react-router-dom";
import authService from "../services/auth.service";
import {CheckCircleFilled, InfoCircleFilled, LoginOutlined} from "@ant-design/icons";
import Text from "antd/es/typography/Text";
import { downloadExcel } from "react-export-table-to-excel";

const header = ["Id", "Name", "Address","City","State","Zip","Contact Person","Contact Email"];

class CustomersPage extends Component {
    constructor() {
        super();
        this.state = {
            data: [],
            loading: false,
            editingKey: "",
            errorMessage:null
        };
        this.token = "Bearer " + JSON.parse(localStorage.getItem("token"));
        this.exportToExcel = this.exportToExcel.bind(this);
    }
    getUserRole(){
        if(authService.getCurrentUser()===null)
        {
            window.location.reload(false);
        }
        else return authService.getCurrentUser();
    }

    isEditing = record => {
        return record.id === this.state.editingKey;
    };

    edit(id) {
        this.setState({ editingKey: id });
    }
    cancel = () => {
        this.setState({ editingKey: "" });
    };
    componentDidMount() {
        API.get(`customers`,{ headers: { Authorization: this.token}})
            .then(res => {
                if(!Object.keys(res.data).length){
                    console.log("no data found");
                    this.setState({loading: false,data:null });
                }
                else {
                const customers = res.data._embedded.customerList;
                this.setState({loading: false,data:customers });}
            })
            .catch((error)=>{
                var message=JSON.stringify(error.response.data.error_message);
                if(message.includes("The Token has expired"))
                {
                    this.setState({errorMessage:"Your token has expired"});
                    this.errorHappend("Your token has expired.");
                    authService.logout();
                }
                else
                {
                    this.setState({errorMessage:error,loading: false,data:null })
                }
                this.errorHappend(error);
                console.error('There was an error!', error);
        });
    }
    async remove(id) {
        API.delete(`/customers/${id}`,{ headers: { Authorization: this.token}})
            .then(() => {
                let updatedCustomers = [...this.state.data].filter(i => i.id !== id);
                this.setState({data: updatedCustomers});
                this.successfullyAdded("Customer is deleted");
            })
            .catch((error)=>{
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
                this.errorHappend("Failed to delete");
                console.error('There was an error!', error);
            });
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
            API.put(`/customers/update/${id}`, row,{ headers: { Authorization: this.token}})
                .then((response) => {
                    this.setState({ data: newData, editingKey: "" });
                    this.successfullyAdded("Customer is updated");
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
                        this.setState({errorMessage:error})
                    }
                    this.errorHappend("Failed to save");
                    console.error('There was an error!', error);
                });
        });
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
    exportToExcel()
    {
      downloadExcel({
        fileName: "Customers",
        sheet: "Sheet 1",
        tablePayload: {
          header,
          body:this.state.data,
        },
      });
    }
    render() {
        const components = {
            body: {
                row: EditableTableRow,
                cell: EditableTableCell
            }
        };
        
        const columns = customersDataColumns.map(col => {
            if (col.dataIndex === 'actions') {
                return {
                    ...col,
                    render: (text, record) => {
                        const editable = this.isEditing(record);
                        return editable ? (
                            <span>
                                <EditableContext.Consumer>
                                    {(form) => ( <Typography.Link onClick={() => this.saveData(form, record.id)} style={{ marginRight: 8 }}>Save</Typography.Link> )}
                                </EditableContext.Consumer>
                                <Typography.Link  onClick={this.cancel}>Cancel</Typography.Link>
                </span>
                        ) : (
                            <Space size='middle'>
                                <Typography.Link disabled={this.state.editingKey !== ''} onClick={() => this.edit(record.id)}>Edit</Typography.Link>
                                <Popconfirm title='Are you sure you want to delete this customer?' onConfirm={() => this.remove(record.id)}>
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
                            case "zip":
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
        if (this.state.errorMessage) {
            return <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Text style={{fontSize:"22px"}}>Error: {this.state.errorMessage}</Text>
                {this.state.errorMessage.includes("token")&&(<Link to="/login">
                    <Button>Click here to login again</Button>
                </Link>)}
            </Space>;
        }
        else
        {
        return (
            <Layout>
                
                    <div style={{marginBottom:"1em", marginTop:"1em"}}>
                    <Button onClick={this.exportToExcel}>Export to Excel</Button>
                        {this.getUserRole().isAdmin&&(
                            <Link to="/add-customer">
                                <Button style={{float:"right", background: "#0AC035" }} type="primary">New customer</Button>
                            </Link>
                         )}
                    </div>
               
                <Content style={{marginTop:"1em"}}>
                    <Table components={components} bordered dataSource={data} columns={columns} loading={loading} rowKey="id" rowClassName="editable-row"/>
                </Content>
               
            </Layout>
        );
    }
    }
}

export default CustomersPage;