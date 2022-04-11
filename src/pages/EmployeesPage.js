import React, {Component} from 'react';
import {Button, Layout, notification, Popconfirm, Space, Table,Typography} from "antd";
import {Link} from "react-router-dom";
import {Content} from "antd/es/layout/layout";
import EditableTableRow, {EditableContext} from "../components/EditableTableRow";
import EditableTableCell from "../components/EditableTableCell";
import API from "../server-apis/api";
import {employeesDataColumns} from "../tableColumnsData/employeesDataColumns";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
import AsijaTest from "../components/test";

class EmployeesPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            error: null,
            isLoaded: false,
            editingKey: "",
            errorMessage: "",
            asija:""
        }
        //   this.token = "Bearer " + JSON.parse(localStorage.getItem("token"));
        // this.onFinish = this.onFinish.bind(this);
        //  this.onFinishFailed = this.onFinishFailed.bind(this);
        //this.handler = this.handler.bind(this)


    }
    columns = [
        ...employeesDataColumns,
        {
            title: "Actions",
            dataIndex: "actions",
            width: "10%",
            render: (text, record) => {
                const editable = this.isEditing(record);
                return editable ? (
                    <span>
                                <EditableContext.Consumer>
                                  {form => (<a onClick={() => this.saveData(form, record.username)} style={{ marginRight: 8 }}>Save</a>)}
                                </EditableContext.Consumer>
                                <a onClick={this.cancel}>Cancel</a>
                            </span>
                ) : (
                    <Space size="middle">
                        <a onClick={() => this.edit(record.username)}>Edit</a>
                        <Popconfirm title="Are you sure you want to delete this product?"
                                    onConfirm={() => this.remove(record.username)}>
                            <a style={{color:"red"}}>Delete</a>
                        </Popconfirm>
                    </Space>
                );
            },
        }
    ];

    isEditing = (record) => {
        return record.username === this.state.editingKey;
    };

    edit(username) {
        console.log("kliknut je edit na korisnika "+JSON.stringify(username));
        this.setState({editingKey:username});
    }

    cancel = () => {
        this.setState({ editingKey: ""});
    };
    componentDidMount() {
        this.setState({ loading: true });
        const token="Bearer "+ JSON.parse(localStorage.getItem("token"));
        API.get(`users/all`,{ headers: { Authorization: token}})
            .then(res => {
                // console.log(res.data._embedded.productList);
                const employees = res.data._embedded.employeeInfoDtoList;
                this.setState({loading: false,data:employees });
            })
    }
    async remove(username) {
        const token="Bearer "+ JSON.parse(localStorage.getItem("token"));
        API.delete(`/users/${username}`,{ headers: { Authorization: token}})
            .then(() => {
                let updatedProducts = [...this.state.data].filter(i => i.username !== username);
                this.setState({data: updatedProducts});
                this.successfullyAdded("Employee is deleted. It wont have any access to the website anymore.")
            }).catch(()=>this.errorHappend("Failed to delete"));
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
            const token="Bearer "+ JSON.parse(localStorage.getItem("token"));
            const response = API.put(`/users/${username}/update`, row,{ headers: { Authorization: token}})
                .then((response) => {
                    this.setState({ data: newData, editingKey: ""});
                    this.successfullyAdded("Empolyee info is updated")
                })
                .catch(error => {
                    this.setState({ errorMessage: error.message });
                    this.errorHappend("Failed to save changes.")
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
        const columns = this.columns.map(col => {
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
                        // inputType: col.dataIndex === "age" ? "number" : "text",
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
                    <Link to="/add-product">
                        <Button style={{float:"right", background: "#0AC035",marginBottom:"1em", marginTop:"1em" }}
                                type="primary">New emplyee</Button>
                    </Link>
                </div>
                <Content>
                    {/*<div style={{marginBottom:"1em"}}>*/}
                    {/*    <Search placeholder="Search products by name" onSearch={this.onSearch}  />*/}
                    {/*</div>*/}
                    <AsijaTest/>
                    <Table components={components} bordered dataSource={data} columns={columns} loading={loading} rowKey={data.username} rowClassName="editable-row"/>
                </Content>
            </Layout>
        );
    }
}

export default EmployeesPage;