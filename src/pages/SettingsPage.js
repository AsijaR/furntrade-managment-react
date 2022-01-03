import React, {Component} from 'react';
import AuthService from "../services/auth.service";

class SettingsPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: AuthService.getCurrentUser()
        };
    }
    render() {
        return (
            <div >
                    Ovo su podesavanja
            </div>
        );
    }
}

export default SettingsPage;