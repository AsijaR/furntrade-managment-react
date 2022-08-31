import React, {Component} from 'react';
import {Button, Layout, notification, Popconfirm, Space, Table, Typography} from "antd";
import API from '../server-apis/api';
import {Content} from "antd/es/layout/layout";
import {productDataColumns} from "../tableColumnsData/productDataColumns";
import EditableTableCell from "../components/EditableTableCell";
import EditableTableRow, {EditableContext} from "../components/EditableTableRow";
import {Link} from "react-router-dom";
import Search from "antd/es/input/Search";
import {CheckCircleFilled, InfoCircleFilled} from "@ant-design/icons";
import Text from "antd/es/typography/Text";
import { downloadExcel } from "react-export-table-to-excel";
import authService from '../services/auth.service';

const header = ["Id", "Name", "Model","Material","Color","Price"];

class ProductsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: true,
            editingKey: "",
            errorMessage:null,
            filteredData:[]
        };
        this.token = "Bearer " + JSON.parse(localStorage.getItem("token"));
        this.onSearch = this.onSearch.bind(this);
        this.exportToExcel = this.exportToExcel.bind(this);
        this.onChange = this.onChange.bind(this);

    }
    exportToExcel()
    {
      downloadExcel({
        fileName: "Products",
        sheet: "Sheet 1",
        tablePayload: {
          header,
          body:this.state.data,
        },
      });
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
        API.get(`products`,{ headers: { Authorization: this.token}})
            .then(res => {
                if(!Object.keys(res.data).length){
                    console.log("no data found");
                    this.setState({loading: false,data:null });
                }
                else
                {
                const products = res.data._embedded.productList;
                this.setState({loading: false,data:products,filteredData:products });
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
                    this.setState({errorMessage:error})
                }
                this.errorHappend("Failed to load data");
                console.error('There was an error!', error);
        });
    }

    async remove(id) {
        API.delete(`/products/${id}`,{ headers: { Authorization: this.token}})
        .then(() => {
            let updatedProducts = [...this.state.data].filter(i => i.id !== id);
            this.setState({data: updatedProducts,filteredData:updatedProducts});
            this.successfullyAdded("Product is deleted");
        }).catch(error => {
            var message=JSON.stringify(error.response.data.error_message);
            if(message.includes("The Token has expired"))
            {
                this.setState({errorMessage:"Your token has expired."})
                this.errorHappend("Your token has expired.");
                authService.logout();
            }
            else
            {
                this.setState({errorMessage:error})
            }
            this.errorHappend("Failed to remove");
            console.error('There was an error!', error);
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
            API.put(`/products/update/${id}`, row,{headers: { Authorization: this.token}})
                .then((response )=>
                {
                    this.setState({ data: newData, editingKey: "",filteredData:newData });
                    this.successfullyAdded("Product is updated");
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
    onSearch (value){
        this.setState({ loading: true });
        if(value===""||this.hasWhiteSpace(value))
            this.componentDidMount();
        else{
            console.log(value)
            API.get(`products/search/`, { params: { productName: value },headers: { Authorization: this.token}})
                .then(res => {
                    if(!Object.keys(res.data).length){
                        this.setState({loading: false,data:null });
                    }
                    else {
                    const products = res.data._embedded.productList;
                   this.setState({loading: false,data:products });}
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
                    this.errorHappend("Product not found");
                    console.error('There was an error!', error);
            });
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
    onChange = (input) => {
        let value = input.target.value.toLowerCase();
        let result = [];
        if(value===""||this.hasWhiteSpace(value))
        {
            result=this.state.data;
            this.setState({filteredData:result});
            return;
        }
       result = this.state.data.filter((item) => {return item.name.search(value) !== -1});
       this.setState({filteredData:result});
    }

    render() {
        const components = {
            body: {
                row: EditableTableRow,
                cell: EditableTableCell
            }
        };
        const columns = productDataColumns.map(col => {
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
                                <Link to={`${record.id}`}>
                                    <span>Edit</span>
                                </Link>
                                {/* <Typography.Link disabled={this.state.editingKey !== ''} onClick={() => this.edit(record.id)}>Edit</Typography.Link> */}
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
        
        const { data, loading,filteredData} = this.state;
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
                <div style={{marginBottom:"1em", marginTop:"1em"}}>
                <Button  style={{float:"left"}} onClick={this.exportToExcel}>Export to Excel</Button>
                    <Link to="/add-product">
                        <Button style={{float:"right", background: "#0AC035" }}
                                type="primary">New product</Button>
                    </Link>
                </div>
                <Content>
                    <div style={{marginBottom:"1em"}}>
                        <Search placeholder="Search products by name"  onChange={this.onChange} />
                    </div>
                    <Table components={components} bordered dataSource={filteredData} columns={columns} loading={loading} rowKey="id" rowClassName="editable-row"/>
                </Content>
            </Layout>
        );
    }}
}

export default ProductsPage;