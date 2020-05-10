import React from 'react';
import io from 'socket.io-client';
import axios from 'axios';

export default class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

            channelMessages: [],
            channelName: '',
            channels: [],
            clientMessage: '',
            loggedIn: false,
            messages: [], //channels from json file
            chatData: [], //not working wit GET, GET messages via socket, see above
        };

        this.socket = null;
    }

    componentDidMount() {
        this.socket = io('localhost:3000');

        //to GET all the messages from server - ?! to a specific channel
        this.socket.on('messages', data => {
            console.log('REACT, GOT DATA', data);
            this.setState({ messages: data }); //here comes the channels!
        });

        //to GET the sended new_message - working - ?! how to send to a specific channel
        //-----------------------TO FIX THIS-------------------------
        this.socket.on('new_message', data => {
            console.log('REACT, GOT NEW MSG', data); //got: Object: content, id, username
            //send it to the channels ID, which is on server side...
            this.setState({ channelMessages: [...this.state.channelMessages, data] });
        });

        /*to GET all the chatdata from the server, data comes through SOCKET!
        axios.get('/')
            .then(response => {
                this.setState({ chatData: response.data });
                console.log('CHATDATA by GET', this.state.chatData);
            })
            .catch(err => {
                console.log('Error by reciving all the chat data from server', err);
            });
            */
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
                this.setState({ channelMessages: response.data.channelMessages })
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
                this.setState({ channels: [...this.state.channels, this.state.channelName] });
            })
    }

    onChange = (e) => {
        let value = e.target.value;
        this.setState({ clientMessage: value });
    }

    renderChannels = () => {
        return this.state.messages.map((channel) => {
            const { channelName, id } = channel;
            return (
                <li
                    key={id}
                    id={id}
                    onClick={(e, id) => { this.handleChannelRoute(e, channel.id) }}
                //channelMessages={channelMessages}
                >
                    {channelName}
                </li>
            )
        })
    }

    sendMessage = (e) => {
        e.preventDefault();
        
        //console.log(this.props.name, this.state.clientMessage);
        this.socket.emit('new_message', { //to send new msg to server
            username: this.props.name,
            content: this.state.clientMessage,
        }, (response) => {
            if (response.data.id === this.props.match.params.id) { //??????? how to send channel id 
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
                        {this.renderChannels()}
                    </ul>
                </aside>

                <section style={{ width: '55vw', position: 'absolute', left: '300px' }}>
                    <h3>Hello {this.props.name}, welcome to Chat Channels</h3>
                    <button onClick={this.toLogOut}
                        className='logout-button'>Log Out</button>

                    {this.state.channelMessages.map(x => (
                        <div key={x.id} className='chat-messages'>
                            <span className='chat-users' id={x.id}><b>{x.username} </b></span>
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

                        <button onClick={this.sendMessage} type='submit'
                            className='send-button'>Send
                        </button>
                    </form>
                </section>
            </div>
        )
    }
}