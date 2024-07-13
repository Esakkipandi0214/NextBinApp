// pages/index.tsx
import LoginForm from '../../components/LoginForm';
import MessageForm from '../../components/SendMessageForm'

const Home = () => {
  return (
    <div>
      <h1>Login</h1>
      {/* <LoginForm /> */}
      <MessageForm/>
    </div>
  );
};

export default Home;
