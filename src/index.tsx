import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store/store'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import App from './app';

//ReactDOM.render(<App />, document.querySelector("#content"))

ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.querySelector('#content')
  );