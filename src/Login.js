import React from 'react';

export default class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
        };
    }

    onChange = (e) => { 
        let value = e.target.value;
        this.setState({ name: value })
    }

    toLogIn = () => { 
        this.props.logIn(this.state.name); //logIn i App.js
    }
    
    render() {
        return (
            <div>
                <div className='login-page'>
                    <h1>Chat</h1>
                    <input
                        type='text' name='username' id='username'
                        placeholder='Type In Your Name'
                        value={this.state.name}
                        onChange={this.onChange} />

                    <button
                        onClick={this.toLogIn}
                        className='login-button'>Log in</button>
                </div>
            </div>
        )
    }
}