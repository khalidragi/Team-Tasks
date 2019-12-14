import React, { Component } from 'react';
import firebase, { auth, provider } from './firebase.js';
import './App.css';

class App extends Component {
  state = {
    currentTask: '',
    username: '',
    tasks: [],
    user: null
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const tasksRef = firebase.database().ref('tasks');
    const task = {
      task: this.state.currentTask,
      user: this.state.username
    };
    tasksRef.push(task);
    this.setState({
      currentTask: '',
      username: ''
    });
  };

  removeItem = taskId => {
    const taskRef = firebase.database().ref(`/tasks/${taskId}`);
    taskRef.remove();
  };

  login = () => {
    auth.signInWithPopup(provider).then(result => {
      const user = result.user;
      this.setState({
        user: user
      });
    });
  };

  logout = () => {
    auth.signOut().then(() => {
      this.setState({
        user: null
      });
    });
  };

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      if (user) {
        this.setState({ user });
      }
    });
    const tasksRef = firebase.database().ref('tasks');
    tasksRef.on('value', snapshot => {
      let tasks = snapshot.val();
      let newState = [];
      for (let task in tasks) {
        newState.push({
          id: task,
          title: tasks[task].task,
          user: tasks[task].user
        });
      }
      this.setState({
        tasks: newState
      });
    });
  }

  render() {
    return (
      <div className='app'>
        <header>
          <div className='wrapper'>
            <h1>Team Tasks</h1>
            {this.state.user ? (
              <button onClick={this.logout}>Log Out</button>
            ) : (
              <button onClick={this.login}>Log In</button>
            )}
          </div>
        </header>
        {this.state.user ? (
          <div>
            <div className='user-profile'>
              <img src={this.state.user.photoURL} />
            </div>
          </div>
        ) : (
          <div className='wrapper'>
            <p>You must be logged in to see the Tasks list and submit to it.</p>
          </div>
        )}
        <div className='container'>
          <section className='add-item'>
            <form onSubmit={this.handleSubmit}>
              <input
                type='text'
                name='username'
                placeholder="Taskowner's Name?"
                onChange={this.handleChange}
                value={this.state.username}
              />
              <input
                type='text'
                name='currentTask'
                placeholder='Task Description?'
                onChange={this.handleChange}
                value={this.state.currentTask}
              />
              <button>Add Task</button>
            </form>
          </section>
          <section className='display-item'>
            <div className='wrapper'>
              <ul>
                {this.state.tasks.map(task => {
                  return (
                    <li key={task.id}>
                      <h3>Assigned to: {task.user}</h3>
                      <p>{task.title}</p>
                      <button
                        className='delete'
                        onClick={() => this.removeItem(task.id)}>
                        Task finished
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        </div>
      </div>
    );
  }
}
export default App;
