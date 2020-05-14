import React from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { emojify } from 'react-emojione';

export default class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

            activeChannelId: '', //sends to backend with the new msg
            activeChannelName: '',
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

    /*componentWillUnmount() {
         this.socket.off() //if it is empty, then it takes away all the eventlisteners
     }*/

    getChannelName = (e) => {
        this.setState({ channelName: e.target.value });
    }

    handleChannelRoute = (e, id) => {
        e.preventDefault();
        axios.get('/' + id)
            .then(response => {
                console.log('Channel onclick ', response);
                this.setState({ channelMessages: response.data.channelMessages });
                this.setState({ activeChannelId: response.data.id });
                this.setState({ activeChannelName: response.data.channelName });
            })
            .catch(err => {
                console.log('Error by handeling channelMessages', err);
            })
    }

    handleNewChannel = (e) => {
        e.preventDefault();
        axios.post('/', { channelName: this.state.channelName })//working
            .then(res => {
                console.log('RESPONSE POSTING CHANNEL', res);
                this.setState({ messages: [...this.state.messages, res.data.newChannel] });
            })
            .catch(err => {
                console.log('Error by creating new channel', err);
            })
    }

    onChange = (e) => {
        let value = e.target.value;
        this.setState({ clientMessage: value });
    }

    removeChannel = (e, id) => {
        e.stopPropagation();
        console.log('ID to remove', id)
        axios.delete('/' + id)
            .then((response) => {
                console.log('Channel on delete', response);
                this.setState({ messages: this.state.messages.filter(x => id !== x.id) });
                this.setState({ activeChannelId: '' });
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
                    onClick={(e) => { this.handleChannelRoute(e, id) }}
                    style={{ display: 'block', paddingRight: '1%' }}
                >
                    <span>#{channelName}</span>
                    <span id={id} >
                        <button onClick={(e) => { this.removeChannel(e, id) }} className='button__delete'>
                            <span className="material-icons">
                                delete_forever
                            </span>
                        </button>
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
            <div style={{ width: '100vw', position: 'relative', display: 'flex' }}>

                <aside style={{ width: '40vw', position: 'absolute', display: 'flex', flexDirection: 'column' }}>

                    <button onClick={this.toLogOut}
                        className='logout-button'>
                        <span className="material-icons">
                            exit_to_app
                        </span>
                    </button>

                    <div className="create__channel">
                        <div>
                            <input
                                type="text"
                                onChange={this.getChannelName}
                                value={this.state.channelName}
                                name="channelName" id="channelName"
                                placeholder="Create channel"
                            />
                        </div>

                        
                            <button
                                onClick={this.handleNewChannel}
                                className='add__button'
                            >
                                <span className="material-icons">
                                    add
                                </span>
                            </button>
                       
                    </div>

                        <div className="channels__list" >
                            <h3>Channels</h3>
                            <ul style={{ listStyleType: 'none', margin: '0', padding: '0' }}>
                                {this.renderChannels()}
                            </ul>
                        </div>
                </aside>

                    <section style={{ width: '55vw', position: 'absolute', left: '300px', top: '10px' }}>
                        <h3>Hello {this.props.name}, welcome to Chat Channels,</h3>

                        {!this.state.activeChannelId ? <p>Click on a channel on the left to continue.</p> :

                            <div>
                                <h3>#{this.state.activeChannelName}</h3>
                                <br />
                                {this.state.channelMessages.map(x => (
                                    <div key={x.msg_id} className='chat-messages'>
                                        <span className='chat-users' id={x.msg_id}><b>{x.username} </b></span>
                                        <span className='chat-text'>{emojify(x.content)}</span>
                                    </div>
                                ))}

                                <hr></hr>

                                <form type='submit' onSubmit={this.sendMessage}>
                                    <textarea
                                        onChange={this.onChange}
                                        value={this.state.clientMessage}
                                        rows='5' cols='100'
                                        placeholder='Type in Your Message Here'>
                                    </textarea>

                                    <button onClick={this.sendMessage}
                                        className='send-button'>
                                        <span className="material-icons">
                                            send
                                    </span>
                                    </button>
                                </form>

                            </div>}
                    </section>
            </div>
        )
    }
}
