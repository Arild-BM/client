import { useState, useEffect } from 'react';

import axios from 'axios';

import View from './View'

function App() {

  const [screen, setScreen] = useState('auth');
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");
  const [delAcc, setDelAcc] = useState("");

  // Create new users
  const register = async () => {
    try {
      const res = await fetch('http://localhost:5000/register', {
        method: 'POST',
       body: JSON.stringify({ name: name, username: username, password: password }),
      headers: { 'Content-Type': 'application/json' }
      })
      // const data = await res.json()
      const data = await res.text()
      console.log("Melding " + res.status)
      console.log(data)
      setMessage(data)
      setName("")
      setUsername("")
      setPassword("")
      }
      catch (err) {
         setMessage(err.message)
       }
     }

  // Log in user
  async function auth() {
    setMessage("Test1")
    try {
      const res = await axios.get('http://localhost:5000/authenticate', { auth: { username, password } });
      
      if (res.data.screen !== undefined) {
        console.log("Screen: " + res.data.screen)
        setScreen(res.data.screen);
      }
    } catch (e) {
      // setMessage("Test2")
    }
  };

  const readCookie = async () => {
    try {
      const res = await axios.get('/read-cookie');
      
      if (res.data.screen !== undefined) {
        setScreen(res.data.screen);
      }
    } catch (e) {
      setScreen('auth');
      console.log(e);
    }
  };

  useEffect(() => {
    readCookie();
  }, []);
  
  // Remove messages after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setMessage(""), 2000);
    return () => clearTimeout(timer);
  }, [message]);

  // Let user change password
  async function saveNewPassword(pw) {
    try {
      const res = await fetch('http://localhost:5000/changePw', {
        method: 'PATCH',
       body: JSON.stringify({ username: username, password: pw }),
      headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await res.text()
      console.log("Melding " + res.status)
      console.log(data)
      setMessage(data)
      setPassword1("")
      setPassword2("")
      setPassword("")
      setUsername("")
      setScreen("auth")
    }
    catch (err) {
      setMessage(err.message)
    }
  }

  // Delete user account
  async function deleteUser(user) {
    try {
      const res = await fetch('http://localhost:5000/deleteUser', {
        method: 'DELETE',
       body: JSON.stringify({ username: user }),
      headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await res.text()
      console.log("Melding " + res.status)
      console.log(data)
      setMessage(data)
      setDelAcc("")
    }
    catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <div className="App">
      {/* Log in screen */}
      {screen === 'auth'
        ? <div>
            <label>Username: </label>
            <br/>
            <input type="text" value={username} placeholder = "user ID" autoComplete="off" onChange={e => setUsername(e.target.value)} />
            <br/>
            <label>Password: </label>
            <br/>
            <input type="password" value={password} placeholder = "password" autoComplete="new-password" onChange={e => setPassword(e.target.value)} />
            <br/>
            <button onClick={auth}>Login</button>
            {message==="" ? <><br/><br/></> : <p className="message">{message}</p>}
            <button onClick={ () => setScreen('register')}>Register new user</button>
          </div>
          // Screen for register new user
          : screen === 'register'
          ? <div>
              <label className="labelmargin">Name: </label>
              <br/>
              <input type="text" value = {name} autoComplete="off" placeholder = "Fornavn Etternavn" onChange={e => setName(e.target.value)} />
              <br/>
              <label>Username: </label>
              <br/>
              <input type="text" value = {username} autoComplete="off" placeholder = "brukernavn" onChange={e => setUsername(e.target.value)} />
              <br/>
              <label>Password: </label>
              <br/>
              <input type="password" value = {password} autoComplete="new-password" onChange={e => setPassword(e.target.value) } />
              <br/>
              <button onClick={
                name && username && password ? register : () => setMessage("Please fill out all fields!")
                }>Create user account</button>
              {message==="" ? <br/> : <p className="message message2">{message}</p>}
              <button onClick={ () => setScreen('auth')}>Go to login page</button>
            </div>
            // Screen for change password
            : screen === 'changePw'
            ? <div>
                <p>Write new password for user "{username}" </p>
                <br/>
                <label>New password: </label>
                <br/>
                <input type="password" value={password1} onChange={e => setPassword1(e.target.value) } />
                <br/>
                <label>Retype password: </label>
                <br/>
                <input type="password" value={password2} onChange={e => setPassword2(e.target.value) } />
                <br/>
                <button onClick={
                  password1 === password2 ? () => saveNewPassword(password1) : () => setMessage("Passwords not equal!")
                  }>Change password</button>
                {message==="" ? <><br/><br/></> : <p className="message">{message}</p>}
                <button onClick={ () => setScreen('auth')}>Go to login page</button>
              </div>
              // Screen for delete user
              : screen === 'deleteUser'
              ? <div>
                  <p>Delete user account </p>
                  <br/>
                  <label>Account to be deleted: </label>
                  <br/>
                  <input type="text" value = {delAcc} onChange={e => setDelAcc(e.target.value) } />
                  <br/>
                  <button
                    className="message" 
                    onClick={
                      delAcc !== "" ? () => deleteUser(delAcc) : () => setMessage("Input field blank!")
                    }>Delete account!</button>
                  {message==="" ? <><br/><br/></> : <p className="message">{message}</p>}
                  <button onClick={ () => setScreen('auth')}>Go to login page</button>
                </div>
                // Screen for Todo list
        : <View setScreen={setScreen} username={username} setUsername={setUsername} setPassword={setPassword} />
      }
    </div>
  );
}

export default App;