import ChatBox from '../components/ChatBox';
import MessageInput from '../components/MessageInput';
import RoomListBox from '../components/RoomListBox';
import ConnectedUsersBox from '../components/ConnectedUsersBox';
import { Button } from 'react-bootstrap';
import ContainerChatWindow from '../layout/ContainerChatWindow';
import { useEffect, useState, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { Message, Room, User } from '../Interfaces/Interfaces';
import { useNavigate, useParams } from 'react-router-dom';
import NewRoomForm from '../components/NewRoomForm';

const WelcomeChat = () => {
  const navigate = useNavigate();
  const { currentRoom } = useParams(); // in case I am in a room, indicated at the url
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const { appState, dispatch } = useContext(SocketContext);
  const { socket, current_uid } = appState;

  const currentUser = JSON.parse(current_uid) as User;

  // *When I log into the app
  useEffect(() => {
    const data = {
      userId: currentUser.userId,
      roomName: currentRoom,
    };
    socket?.emit('enter_room', data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // !abans tenia només currentRoom a les dependències

  // *If anyone enters the room
  useEffect(() => {
    socket?.on('update_user_room', (data) => {
      const { rooms: roomsReceived } = data; 
      // all existing rooms with their users
      setRooms(roomsReceived);
    });
  }, [currentRoom, socket]);

  // *If someone writes a messages in current room
  useEffect(() => {
    socket?.on('update_messages', (data) => {
      const { roomName, newMessages } = data;
      console.log('roomName received on update_messages:', roomName);
      console.log('newMessages received on update_messages: ', newMessages);
      if (roomName === currentRoom) {
        setMessages(newMessages);
      }
    });
  }, [currentRoom, socket]);

  // *If a new room is created
  useEffect(() => {
    socket?.on('update_rooms', (updatedRooms) => {
      // console.log(updatedRooms);
      setRooms(updatedRooms); // all existing rooms
    });
  }, [socket]);

  const handleExit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    // alert('You are about to disconnect from the chat.');
    appState.socket?.disconnect();
    dispatch({ type: 'remove_user', payload: null });
    localStorage.removeItem('token');
    navigate('/welcome/login');
  };

  const onRoomClickHandler = (nextRoom: string) => {
    // alert('You are about to change the room.');
    navigate(`/chat/${nextRoom}`);
    const data = {
      userId: currentUser.userId,
      roomName: nextRoom,
    };
    socket?.emit('enter_room', data);
  };

  return (
    <ContainerChatWindow>
      <NewRoomForm socket={socket} setRooms={setRooms} />
      <div className="exit-btn">
        <Button onClick={handleExit}>Disconnect</Button>
      </div>
      <ChatBox messages={messages} />
      <RoomListBox
        roomList={rooms}
        currentRoom={currentRoom}
        onRoomClick={onRoomClickHandler}
        currentUser={currentUser}
      />
      <ConnectedUsersBox
        currentUser={currentUser}
        currentRoom={currentRoom}
        roomList={rooms}
      />
      <MessageInput currentRoom={currentRoom} />
    </ContainerChatWindow>
  );
};

export default WelcomeChat;
