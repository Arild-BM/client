import React, { useState, useEffect } from 'react';

import axios from 'axios';
import { v4 as uuid } from 'uuid';

import sun from "./pictures/icon-sun.svg"
import moon from "./pictures/icon-moon.svg"
import check from "./pictures/icon-check.svg"
import cross from "./pictures/icon-cross.svg"

function View (props) {
  const { setScreen, username, setUsername, setPassword } = props;
  
  const [darkmode, setDarkmode] = useState(true);
  const [darkmodeIcon, setDarkmodeIcon] = useState(sun);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({});
  const [show, setShow] = useState("All")
      
  // Logout
  const deleteCookie = async () => {
    try {
      await axios.get('/clear-cookie');
      setScreen('auth');
      setPassword("")
      setUsername("")
    } catch (e) {
      console.log(e);
    }
  };
  
  // Change color theme
  function setColor() {
    darkmode ? document.documentElement.className = "dark" : document.documentElement.className = "light"
    darkmode ? setDarkmodeIcon(sun) : setDarkmodeIcon(moon)
    setDarkmode(!darkmode)
  }

  // Insert new todo
  async function handleSubmit(event) {
    event.preventDefault()
    try {
      const res = await axios.put('/put-data', {todolist: [...todos, newTodo]});
      console.log(res.data)
    } catch (e) {
      console.log(e);
    }
    setTodos(prev => [...prev, newTodo])
    setNewTodo({todo: ""})
  }

  
  useEffect(() => {
    getData()
  }, []);

  // Get data from database when application opens
  async function getData() {
    try {
      const res = await axios.get('/get-data');
      setTodos(res.data);
    } catch (e) {
      console.log(e);
    }
  }
  
  // Toggle Todo as active/done
  async function updateTodo(id) {
    const index = todos.findIndex((todo) => todo.id === id )
    try {
      const res = await axios.put('/put-data', {
        todolist: [...todos.slice(0, index),
                  {todo: todos[index].todo,
                  active: !todos[index].active,
                  completed: todos[index].completed,
                  id: todos[index].id},
                  ...todos.slice(index + 1)
        ]});
      console.log(res.data)
    } catch (e) {
      console.log(e);
    }
    setTodos([...todos.slice(0, index),
      {todo: todos[index].todo,
      active: !todos[index].active,
      completed: todos[index].completed,
      id: todos[index].id},
      ...todos.slice(index + 1)
    ])
  }

  // Toggle Todo as ready or not to be deleted (change flag)
  async function markTodoAsDone(id) {
    const index = todos.findIndex((todo) => todo.id === id )
    
    try {
      const res = await axios.put('/put-data', {
        todolist: [...todos.slice(0, index),
                  {todo: todos[index].todo,
                  active: todos[index].active,
                  completed: !todos[index].completed,
                  id: todos[index].id},
                  ...todos.slice(index + 1)
        ]});
      console.log(res.data)
    } catch (e) {
      console.log(e);
    }
    setTodos([...todos.slice(0, index),
      {todo: todos[index].todo,
      active: todos[index].active,
      completed: !todos[index].completed,
      id: todos[index].id},
      ...todos.slice(index + 1)
    ]);
    console.log(index);
  }

  // Insert new Todo
  function InsertTodoLine({item, index}) {
    return (
      <div key = {index} className = "todo todo2">
        <img className= {item.active ? 'mark marked mark-pointer' : 'mark mark-pointer' }
          src = { check }
          alt = ""
          onClick = { () => updateTodo(item.id) }
        />
        <p className={item.completed ? "input-field deleted" : "input-field" } >
          {item.todo}
        </p>
        <img className = "cross mark-pointer"
          src = { cross }
          alt = "Delete-icon"
          onClick = { () => markTodoAsDone(item.id) }
        />
      </div>
    )
  }

  // Delete marked Todos
  async function deleteMarkedTodos() {
    try {
      const res = await axios.put('/put-data', {
        todolist: todos.filter(item => !item.completed)});
        console.log(res.data)
    } catch (e) {
      console.log(e);
    }
    setTodos(() => todos.filter(item => !item.completed))
  }

  return (
    <div>
      {/* Header line */}
      <div className = "header">
        <h3>TODO</h3>
        <button onClick={deleteCookie}>Logout</button>
        {/* {console.log("Username: " + username)} */}
        {username === "admin" ?
          <button onClick={() => setScreen('deleteUser')}>Delete user</button>
          : <button onClick={() => setScreen('changePw')}>Change PW</button>
        }
        {/* Icon for teggle color mode */}
        <img className="darkmode-icon"
          onClick = {() => setColor()}
          src = {darkmodeIcon}
          alt = "icon for toggle light and dark theme"
        />
      </div>
      {/* Create new Todo item */}
      <div className = "todo create-line-margin">
        <p className='mark'></p>
        <form onSubmit={handleSubmit}>
          <input
            className="input-field"
            type="text" 
            value={newTodo.todo}
            onChange={(e) => setNewTodo({
              todo: e.target.value,
              active: false,
              completed: false,
              id: uuid()
            })}
            placeholder="Create a new todo..."
          />
        </form>
      </div>
      
      {/* Show Todo list */}
      <div className="todo-list">
        {/* Show all Todos */}
        {show==="All" ? todos.map((item, index) => <InsertTodoLine key = {index} item={item} index={index}/>): null}
        {/* Show only active Todos */}
        {show==="Active" ? todos.filter(todo => todo.active === true).map((item, index) => <InsertTodoLine key = {index} item={item} index={index}/>): null}
        {/* Show only completed Todos - ready for deletion */}
        {show==="Completed" ? todos.filter(todo => todo.completed === true).map((item, index) => <InsertTodoLine key = {index} item={item} index={index}/>): null}
        
        {/* Line with buttons Insert Todo and Delete Completed */}
        <div key="buttons" className="todo todo3">
          <p>{todos.length === 0 ? "Insert Todo" : todos.length === 1 ? "1 item left" : todos.length + " items left"}</p>
          <p className="pointer" onClick = {() => deleteMarkedTodos()}>Delete Completed</p>
        </div>

        {/* Footer - Choose which Todos to show */}
        <div key="footer" className="todo footer">
          <p className = {show === "All" ? "pointer blue-text" : "pointer"} onClick = {() => setShow("All")}>All</p>
          <p className = {show === "Active" ? "pointer blue-text" : "pointer"} onClick = {() => setShow("Active")}>Active</p>
          <p className = {show === "Completed" ? "pointer blue-text" : "pointer"} onClick = {() => setShow("Completed")}>Completed</p>
        </div>
      </div>
    </div>
  )
}

export default View