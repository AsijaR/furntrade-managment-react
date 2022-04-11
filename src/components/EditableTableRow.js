import React, {Component} from 'react';
import { Form} from '@ant-design/compatible';

export const EditableContext = React.createContext();
class EditableTableRow extends Component {
    render() {
        return (
            <EditableContext.Provider value={this.props.form}>
                <tr {...this.props} />
            </EditableContext.Provider>
        );
    }
}

export default EditableTableRow=Form.create()(EditableTableRow);

