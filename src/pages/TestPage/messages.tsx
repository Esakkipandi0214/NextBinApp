// pages/messages.tsx
import SendMessageForm from '../../components/SendMessageForm';
import MessageList from '../../components/MessageList';

const Messages = () => {
  return (
    <div>
      <h1>Send Message</h1>
      <SendMessageForm />
      <h1>Messages</h1>
      <MessageList />
    </div>
  );
};

export default Messages;
