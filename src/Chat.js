import React from 'react';
import io from 'socket.io-client';
import axios from 'axios';

//const socket = io('localhost:3000');

export default class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            channelName: '',
            channels: [],
            messages: [],
            clientMessage: '',
            loggedIn: false,
        };

        this.socket = null;
    }


    componentDidMount() {
        this.socket = io('localhost:3000');

        //to GET all the messages from server - not working yet
        this.socket.on('messages', data => {
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

    getChannelName = (e) => {
        this.setState({channelName: e.target.value});
    }

    handleNewChannel = (e) => {
        e.preventDefault();
        axios.post('/', {channelName: this.state.channelName})//or should it be the same object like on the backend side?
            .then(res => {
                console.log('RESPONSE POSTING CHANNEL', res);
                this.setState({channels: [...this.state.channels, this.state.channelName]});
            })
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
        this.setState({ clientMessage: '' });
    }

    toLogOut = () => {
        this.props.logOut(this.state.loggedIn)
    }

    render() {
        console.log('CHANNEL', this.state.channelName);
        return (
            <div style={{ width: '100vw', position: "relative" }}>
                
                <aside style={{ width: '30vw', display: 'flex', flexDirection: 'column', margin: '1%' }}>
                   {/* <form action="" method="post">*/}
                        <label htmlFor="channel" >Create a new channel here</label>
                        <input
                            type="text"
                            onChange={this.getChannelName}
                            value={this.state.channelName}
                            name="channelName" id="channelName"
                            style={{ width: '150px' }} />
                        <input
                            type="submit"
                            onClick={this.handleNewChannel}
                            value="Create"
                            style={{ width: '70px' }} />
                    {/*</form>*/}

                    <h3>Channels</h3>
                    <ul>
                        {this.state.channels.map(channel => (
                            <li key={channel.id}>{channel}</li>
                        ))}
                    </ul>
                </aside>

                <section style={{ width: '55vw', position: 'absolute', left: '300px' }}>
                    <h3>Hello {this.props.name}, welcome to Chat Channels</h3>
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
                </section>
            </div>
        )
    }
}