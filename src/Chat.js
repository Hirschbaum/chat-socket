import React from 'react';
import io from 'socket.io-client';

export default class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            messages: [],
            clientMessage: '',
            loggedIn: false,
        };

        this.socket = null;
    }


    componentDidMount() {
        this.socket = io('localhost:3000');

        //to GET all the messages from server - not working yet
        this.socket.on('messgages', data => {
            console.log('REACT, GOT DATA', data);
            this.setState({ messages: data });
        });

        //to GET the sended new_message - working
        this.socket.on('new_message', data => {
           console.log('REACT, GOT NEW MSG', data); //got: Object: content, id, username
           this.setState({ messages: [...this.state.messages, data] });
        });
    }

    componentWillUnmount() {
        this.socket.off() //if it is empty, then it takes away all the eventlisteners
    }

    onChange = (e) => {
        let value = e.target.value;
        this.setState({ clientMessage: value });
    }

    sendMessage = (e) => {
        e.preventDefault();
        //console.log(this.props.name, this.state.clientMessage);
        this.socket.emit('new_message', { //to send new msg to server
            username: this.props.name,
            content: this.state.clientMessage,
        }, (response) => {
            this.state.messages.push(response.data.newMessage);
            this.setState({ messages: this.state.messages, clientMessage: '' })
        });
        this.setState({clientMessage: ''});
    }

    toLogOut = () => {
        this.props.logOut(this.state.loggedIn)
    }

    render() {
        return (
            <div className='chat-page'>
                <h2>Hello {this.props.name}, welcome to Chat</h2>
                <button onClick={this.toLogOut}
                    className='logout-button'>Log Out</button>

                {this.state.messages.map(x => (
                    <div key={x.id} className='chat-messages'>
                        <span className='chat-users'><b>{x.username} </b></span>
                        <span className='chat-text'> {x.content}</span>
                    </div>
                ))}

                <form onSubmit={this.sendMessage}>
                    <textarea 
                        /*onKeyPress={event => event.key === 'Enter' ? this.sendMessage() : null} */
                        onChange={this.onChange}
                        value={this.state.clientMessage}
                        rows='4' cols='28'
                        placeholder='Type in Your Message Here'>
                    </textarea>

                    <button onClick={this.sendMessage}
                        className='send-button'>Send
                     </button>
                </form>
            </div>
        )
    }
}