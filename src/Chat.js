import React from 'react';
import io from 'socket.io-client';
import axios from 'axios';

export default class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

            activeChannelId: '', //sends to backend with the new msg
            channelMessages: [], //to render the messages to a spec channel
            channelName: '', //to create a new channel
            clientMessage: '',//to sense the input for the msg
            loggedIn: false,
            messages: [], //channels from json file
        };

        this.socket = null;
    }

    componentDidMount() {
        this.socket = io('localhost:3000');

        this.socket.on('messages', data => {
            console.log('REACT, GOT DATA', data);
            this.setState({ messages: data }); //here come the channels!
        });

        this.socket.on('new_message', data => {
            console.log('REACT, GOT NEW MSG', data);
            this.setState({ channelMessages: [...this.state.channelMessages, data] });
        });

    }

    componentWillUnmount() {
        this.socket.off() //if it is empty, then it takes away all the eventlisteners
    }

    getChannelName = (e) => {
        this.setState({ channelName: e.target.value });
    }

    handleChannelRoute = (e, id) => {
        //e.preventDefault();
        axios.get('/' + id)
            .then(response => {
                console.log('Channel onclick ', response);
                this.setState({ channelMessages: response.data.channelMessages });
                this.setState({ activeChannelId: response.data.id });
            })
            .catch(err => {
                console.log('Error by handeling channelMessages', err);
            })
    }

    handleNewChannel = (e) => {
        e.preventDefault();
        axios.post('/', { channelName: this.state.channelName })
            .then(res => {
                console.log('RESPONSE POSTING CHANNEL', res);
                this.setState({ messages: [...this.state.messages, res.data.newChannel] });
            })
    }

    onChange = (e) => {
        let value = e.target.value;
        this.setState({ clientMessage: value });
    }

    removeChannel = (id) => {
        //e.preventDefault();
        //e.stopPropagation();
        axios.delete('/' + id)
            .then(response => {
                console.log('Channel onclick on X', response);
                this.setState({messages: this.state.messages.filter(x => id !== x.id)});//this.setState({ channelMessages: response.data.channelMessages });
                //this.setState({activeChannelId: ''})
            })
            .catch(err => {
                console.log('Error by removing channel', err);
            })
    }

    renderChannels = () => {
        return this.state.messages.map((channel) => {
            const { channelName, id } = channel;
            return (
                <li
                    key={id}
                    id={id}
                    
                >
                    <span
                        style={{ padding: '1%' }}
                        onClick={() => { this.handleChannelRoute(channel.id) }}
                    >
                        {channelName}
                    </span>
                    <span
                        onClick={this.removeChannel(channel.id)}
                        style={{ marginLeft: '15px', border: '1px solid black', padding: '1%', width: '30px' }}
                    >
                        Delete
                    </span>
                </li>
            )
        })
    }

    sendMessage = (e) => {
        e.preventDefault();

        this.socket.emit('new_message', {
            username: this.props.name,
            content: this.state.clientMessage,
            id: this.state.activeChannelId,
        }, (response) => {
            if (response.data.id === this.props.match.params.id) {
                this.state.messages.channelMessages.push(response.data.newMessage);
                this.setState({ messages: this.state.messages, clientMessage: '' })
            }
        });
        this.setState({ clientMessage: '' });
    }

    toLogOut = () => {
        this.props.logOut(this.state.loggedIn)
    }

    render() {

        return (
            <div style={{ width: '100vw', position: 'relative' }}>

                <aside style={{ width: '30vw', position: 'absolute', display: 'flex', flexDirection: 'column', margin: '1%' }}>

                    <button onClick={this.toLogOut} style={{ width: '50px' }}
                        className='logout-button'>Log Out
                    </button>

                    <label htmlFor="channel" >Create a new channel here</label>
                    <input
                        type="text"
                        onChange={this.getChannelName}
                        value={this.state.channelName}
                        name="channelName" id="channelName"
                        style={{ width: '150px' }}
                    />
                    <input
                        type="submit"
                        onClick={this.handleNewChannel}
                        value="Create"
                        style={{ width: '70px' }}
                    />

                    <h3>Channels</h3>
                    <ul style={{ cursor: 'cursor-pointer', listStyleType: 'none' }}>
                        {this.renderChannels()}
                    </ul>
                </aside>

                <section style={{ width: '55vw', position: 'absolute', left: '300px', top: '10px' }}>
                    <h3>Hello {this.props.name}, welcome to Chat Channels,</h3>

                    {!this.state.activeChannelId ? <p>Click on a channel on the left to continue.</p> :
                        <div>
                            {this.state.channelMessages.map(x => (
                                <div key={x.msg_id} className='chat-messages'>
                                    <span className='chat-users' id={x.msg_id}><b>{x.username} </b></span>
                                    <span className='chat-text'> {x.content}</span>
                                </div>
                            ))}

                            <form type='submit' onSubmit={this.sendMessage}>
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
                        </div>}
                </section>
            </div>
        )
    }
}