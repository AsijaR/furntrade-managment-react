import React, {Component} from 'react';
import {Button, Layout, notification, Popconfirm, Space, Table, Typography,Select,Card,Meta, Spin} from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
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
        this.sortProducts = this.sortProducts.bind(this);

    }
    exportToExcel()
    {
        var clone = this.state.data.slice(0);
        clone.forEach(function(v){ delete v.photoBase64Info });
      downloadExcel({
        fileName: "Products",
        sheet: "Sheet 1",
        tablePayload: {
          header,
          body:clone,
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
        this.setState({loading:true});
        API.get(`products`,{ headers: { Authorization: this.token}})
            .then(res => {
                if(!Object.keys(res.data).length){
                    this.setState({loading: false,data:null });
                }
                else
                {
                    const prod = res.data._embedded.productList;
                    const products=prod.map(x=>{
                        x.photoBase64Info=x.photoBase64Info+","+x.photo;
                        x.photo="";
                        return x;
                    });
                this.setState({loading: false,data:products,filteredData:products });
                }
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
                this.errorHappend("Failed to load data");
                console.error('There was an error!', error);
        });
    }

    remove(id) {
        API.delete(`/products/${id}`,{ headers: { Authorization: this.token}})
        .then(() => {
            let updatedProducts = [...this.state.data].filter(i => i.id !== id);
            this.setState({data: updatedProducts,filteredData:updatedProducts});
            this.successfullyAdded("Product is deleted");
        }).catch(error => {
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
        result= this.state.data.filter((item) => {return item.name.toLowerCase().includes(value)});
       this.setState({filteredData:result});
    }
    orderByPrice= (input) => {
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
    sortProducts=(value)=>
    {
        let result = [];
        var clone = this.state.data.slice(0);
        switch (value) {
            case "DESC_PRICE":
                result = clone.sort((a, b) =>parseFloat(b.price) - parseFloat(a.price));
                break;
           case "ASC_PRICE":
                result = clone.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                break;
           case "NameAZ":
                result = clone.sort((a, b) => a.name.localeCompare(b.name))
                break;
           case "NameZA":
            result = clone.sort((a, b) => b.name.localeCompare(a.name))
                break;
            default:
                result=clone;
                break;
        }
        this.setState({ filteredData:result }); 
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
        
        const { loading,filteredData} = this.state;
        if (this.state.errorMessage) {
            return <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Text style={{fontSize:"22px"}}>Error: {this.state.errorMessage}</Text>
                {this.state.errorMessage.includes("token")&&(<Link to="/login">
                    <Button>Click here to login again</Button>
                </Link>)}
            </Space>;
        }
        else if(loading)
        {
            return <Spin/>
        }
        else
        {
        return (
            <Layout>
                <div style={{marginBottom:"1em", marginTop:"1em"}}>
                {/* <div  style={{float:"right"}}> */}
               
                   {/* </div> */}
                <Button  style={{float:"left"}} onClick={this.exportToExcel}>Export to Excel</Button>
                    <Link to="/add-product">
                        <Button style={{float:"right", background: "#0AC035" }}
                                type="primary">New product</Button>
                    </Link>
                </div>
                <Content>
                <p style={{marginTop:"3px",marginRight:"5px",float:"left"}}>Sort products by: </p>
                       <Select defaultValue={"DEFAULT"} mode="single" style={{ width: 150,float:"left" }}  onChange={this.sortProducts}>
                           <Select.Option value="DEFAULT">Default</Select.Option>
                           <Select.Option value="DESC_PRICE">Descending price</Select.Option>
                           <Select.Option value="ASC_PRICE">Ascending price</Select.Option>
                           <Select.Option value="NameAZ">Name A-Z</Select.Option>
                           <Select.Option value="NameZA">Name Z-A</Select.Option>
                       </Select>
                    <div style={{marginBottom:"1em"}}>
                        <Search placeholder="Search products by name"  onChange={this.onChange} />
                    </div>
                    <Space direction="horizontal"  size={[8, 16]} wrap>
      {filteredData.map(({id, name, model,color, price,photoBase64Info }) => (
         <Card key={id} style={{ width: 240,marginBottom:"1em"}} loading={loading}
         cover={<img alt="product_image_missing" src={photoBase64Info} style={{width:"10em", height:"10em"}}/>}
         actions={[ 
            <Link to={`${id}`}>
                <EditOutlined key="edit" />,
            </Link>,
            <Popconfirm title='Are you sure you want to delete this product?' onConfirm={() => this.remove(id)}>
                <DeleteOutlined key="delete" />,
            </Popconfirm>,
            
         ]} >
         <Card.Meta title={name}
           description={
            <Space direction="vertical">
                <Space direction="horizontal">
                    <Text >Model:</Text>
                    <Text>{model}</Text>
                </Space>
                <Space direction="horizontal">
                    <Text>Color:</Text>
                    <Text>{color}</Text>
                </Space>
                <Space direction="horizontal">
                    <Text>Price:</Text>
                    <Text>{price}e</Text>
                </Space>
         </Space>
        }/>
       </Card>
      ))}
    </Space>
                    {/* <Table components={components} bordered dataSource={filteredData} columns={columns} loading={loading} rowKey="id" rowClassName="editable-row"/> */}
                </Content>
            </Layout>
        );
    }}
}

export default ProductsPage;