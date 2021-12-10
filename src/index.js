const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if(!user) {
    return response.status(404).json({ error: "User not found" })
  }

  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userExists = users.find(user => user.username === username)

  if(userExists) {
    return response.status(400).json({ error: "User already exists"})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const task = {
    id: uuidv4(),
    done: false,
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(task)

  return response.status(201).json(task)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params

  const checkTodoExists = user.todos.find(todo => todo.id === id)

  if(!checkTodoExists) {
    return response.status(404).json({ error: "Todo not found" })
  }

  const userTodos = user.todos.map(todo => todo.id === id ? { ...todo, title, deadline } : todo)
  user.todos = userTodos
  const updatedTodo = user.todos.find(todo => todo.id === id)

  return response.status(201).json(updatedTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { done } = request.body
  const { id } = request.params

  const checkTodoExists = user.todos.find(todo => todo.id === id)

  if(!checkTodoExists) {
    return response.status(404).json({ error: "Todo not found" })
  }

  const userTodos = user.todos.map(todo => todo.id === id ? { ...todo, done: true } : todo)

  user.todos = userTodos
  const updatedTodo = user.todos.find(todo => todo.id === id)

  return response.status(201).json(updatedTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { done } = request.body
  const { id } = request.params

  const checkTodoExists = user.todos.find(todo => todo.id === id)

  if(!checkTodoExists) {
    return response.status(404).json({ error: "Todo not found" })
  }

  const userTodos = user.todos.filter(todo => todo.id !== id)

  user.todos = userTodos

  return response.status(204).send()
});

module.exports = app;
