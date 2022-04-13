import React, {Component} from 'react';
import {Button, Layout, notification, Popconfirm, Space, Table,Typography} from "antd";
import {Link} from "react-router-dom";
import {Content} from "antd/es/layout/layout";
import EditableTableRow, {EditableContext} from "../components/EditableTableRow";
import EditableTableCell from "../components/EditableTableCell";
import API from "../server-apis/api";
import {employeesDataColumns} from "../tableColumnsData/employeesDataColumns";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
import Text from "antd/es/typography/Text";


class EmployeesPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            error: null,
            loading: true,
            editingKey: "",
            errorMessage:null
        }
        this.token = "Bearer " + JSON.parse(localStorage.getItem("token"));
    }

    isEditing = (record) => {
        return record.username === this.state.editingKey;
    };

    edit(username) {
        this.setState({editingKey:username});
    }

    cancel = () => {
        this.setState({ editingKey: ""});
    };
    componentDidMount() {
        const token="Bearer "+ JSON.parse(localStorage.getItem("token"));
        API.get(`users/all`,{ headers: { Authorization: token}})
            .then(res => {
                const employees = res.data._embedded.employeeInfoDtoList;
                this.setState({loading: false,data:employees, token:token });
            }).
        catch((error)=>{
            var message=JSON.stringify(error.response.data.error_message);
            if(message.includes("The Token has expired"))
            {
                this.setState({errorMessage:"Your token has expired"})
            }
            else
            {
                this.setState({errorMessage:error})
            }
            this.errorHappend("Failed to delete");
            console.error('There was an error!', error);
        });
    }
    async remove(username) {
        API.delete(`/users/${username}`,{ headers: { Authorization: this.state.token}})
            .then(() => {
                let updatedProducts = [...this.state.data].filter(i => i.username !== username);
                this.setState({data: updatedProducts});
                this.successfullyAdded("Employee is deleted. It wont have any access to the website anymore.")
            })
            .catch((error)=>{
                var message=JSON.stringify(error.response.data.error_message);
                if(message.includes("The Token has expired"))
                {
                    this.setState({errorMessage:"Your token has expired"})
                }
                else
                {
                    this.setState({errorMessage:error})
                }
                this.errorHappend("Failed to delete");
                console.error('There was an error!', error);
        });
    }

    hasWhiteSpace(s) {
        return /\s/g.test(s);
    }
    saveData(form,username) {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            const newData = [...this.state.data];
            const index = newData.findIndex(item => username === item.username);
            const item = newData[index];
            newData.splice(index, 1, {
                ...item,
                ...row
            });
            API.put(`/users/${username}/update`, row,{ headers: { Authorization: this.state.token}})
                .then((response) => {
                    this.setState({ data: newData, editingKey: ""});
                    this.successfullyAdded("Empolyee info is updated")
                })
                .catch(error => {
                    var message=JSON.stringify(error.response.data.error_message);
                    if(message.includes("The Token has expired"))
                    {
                        this.setState({errorMessage:"Your token has expired"})
                    }
                    else
                    {
                        this.setState("Failed to save changes")
                    }
                    this.errorHappend(error);
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
    render() {
        const components = {
            body: {
                row: EditableTableRow,
                cell: EditableTableCell
            }
        };
        const columns = employeesDataColumns.map(col => {
            if (col.dataIndex === 'actions') {
                return {
                    ...col,
                    render: (text, record) => {
                        const editable = this.isEditing(record);
                        return editable ? (
                            <span>
                                <EditableContext.Consumer>
                                    {(form) => ( <Typography.Link onClick={() => this.saveData(form, record.username)} style={{ marginRight: 8 }}>Save</Typography.Link> )}
                                </EditableContext.Consumer>
                                <Typography.Link  onClick={this.cancel}>Cancel</Typography.Link>
                </span>
                        ) : (
                            <Space size='middle'>
                                <Typography.Link disabled={this.state.editingKey !== ''} onClick={() => this.edit(record.username)}>Edit</Typography.Link>
                                <Popconfirm title='Are you sure you want to delete this employee?' onConfirm={() => this.remove(record.username)}>
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
                <div>
                    <Link to="/add-employee">
                        <Button style={{float:"right", background: "#0AC035",marginBottom:"1em", marginTop:"1em" }}
                                type="primary">New emplyee</Button>
                    </Link>
                </div>
                <Content>
                    <Table components={components} bordered dataSource={data} columns={columns} loading={loading} rowKey="username" rowClassName="editable-row"/>
                </Content>
            </Layout>
        );
    }}
}

export default EmployeesPage;