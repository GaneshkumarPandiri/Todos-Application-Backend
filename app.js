const express = require("express");
const path = require("path");
const add = require("date-fns/add");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(-1);
  }
};

initializeDBAndServer();
app.use(express.json());

//API1
const convertDbObjectToResponseObjectAPI1 = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  };
};
app.get("/todos/", async (request, response) => {
  const {
    status = "",
    priority = "",
    search_q = "",
    category = "",
  } = request.query;
  if (status !== "") {
    if (
      (status === "TO DO") |
      (status === "IN PROGRESS") |
      (status === "DONE")
    ) {
      const listOfTodoQuery = `SELECT * FROM todo WHERE status ='${status}';`;
      const listOfTodos = await db.all(listOfTodoQuery);
      const listOfTodosResult = listOfTodos.map((item) =>
        convertDbObjectToResponseObjectAPI1(item)
      );
      response.send(listOfTodosResult);
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (priority !== "") {
    if (
      (priority === "HIGH") |
      (priority === "MEDIUM") |
      (priority === "LOW")
    ) {
      const listOfTodoQuery = `SELECT * FROM todo WHERE priority = '${priority}';`;
      const listOfTodos = await db.all(listOfTodoQuery);
      const listOfTodosResult = listOfTodos.map((item) =>
        convertDbObjectToResponseObjectAPI1(item)
      );
      response.send(listOfTodosResult);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (search_q !== "") {
    const listOfTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
    const listOfTodos = await db.all(listOfTodoQuery);
    const listOfTodosResult = listOfTodos.map((item) =>
      convertDbObjectToResponseObjectAPI1(item)
    );
    response.send(listOfTodosResult);
  } else if (category !== "") {
    if (
      (category === "WORK") |
      (category === "HOME") |
      (category === "LEARNING")
    ) {
      const listOfTodoQuery = `SELECT * FROM todo WHERE category = '${category}';`;
      const listOfTodos = await db.all(listOfTodoQuery);
      const listOfTodosResult = listOfTodos.map((item) =>
        convertDbObjectToResponseObjectAPI1(item)
      );
      response.send(listOfTodosResult);
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (priority !== "" && status !== "") {
    const listOfTodoQuery = `SELECT * FROM todo WHERE status LIKE '%${status}%' AND priority = '${priority}';`;
    const listOfTodos = await db.all(listOfTodoQuery);
    const listOfTodosResult = listOfTodos.map((item) =>
      convertDbObjectToResponseObjectAPI1(item)
    );
    response.send(listOfTodosResult);
  } else if (category !== "" && status !== "") {
    const listOfTodoQuery = `SELECT * FROM todo WHERE status LIKE '%${status}%' AND category = '${category}';`;
    const listOfTodos = await db.all(listOfTodoQuery);
    const listOfTodosResult = listOfTodos.map((item) =>
      convertDbObjectToResponseObjectAPI1(item)
    );
    response.send(listOfTodosResult);
  } else if (category !== "" && priority !== "") {
    const listOfTodoQuery = `SELECT * FROM todo WHERE priority = '${priority}' AND category = '${category}';`;
    const listOfTodos = await db.all(listOfTodoQuery);
    const listOfTodosResult = listOfTodos.map((item) =>
      convertDbObjectToResponseObjectAPI1(item)
    );
    response.send(listOfTodosResult);
  }
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoQuery = `SELECT * FROM todo WHERE id = '${todoId}';`;
  const todoResponse = await db.get(todoQuery);
  const result = convertDbObjectToResponseObjectAPI1(todoResponse);
  response.send(result);
});

//API 3
app.get("/agenda/", async (request, response) => {
  const { date = "" } = request.query;
  const dateObj = new Date(date);

  var isValidDate = isValid(dateObj);
  if (isValidDate) {
    var resultDate = format(dateObj, "yyyy-MM-dd");

    const listOfTodoQuery = `SELECT * FROM todo WHERE due_date = '${resultDate}';`;
    const listOfTodos = await db.all(listOfTodoQuery);
    const listOfTodosResult = await listOfTodos.map((item) =>
      convertDbObjectToResponseObjectAPI1(item)
    );
    response.send(listOfTodosResult);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status, category, dueDate } = todoDetails;
  const dateObj = new Date(dueDate);
  var isValidDate = isValid(dateObj);
  let F = true;
  if (isValidDate) {
    var resultDate = format(dateObj, "yyyy-MM-dd");
    if (
      (status === "TO DO") |
      (status === "IN PROGRESS") |
      (status === "DONE")
    ) {
      if (
        (priority === "HIGH") |
        (priority === "MEDIUM") |
        (priority === "LOW")
      ) {
        if (
          (category === "WORK") |
          (category === "HOME") |
          (category === "LEARNING")
        ) {
          var addTodoQuery = `INSERT INTO todo (id, todo, priority, status, category, due_date)
                                VALUES ('${id}',
                                        '${todo}',
                                        '${priority}',
                                        '${status}',
                                        '${category}',
                                        '${resultDate}');`;
          const addResponse = db.run(addTodoQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    F = false;
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const {
    status = "",
    priority = "",
    todo = "",
    category = "",
    dueDate = "",
  } = request.body;

  if (status !== "") {
    if (
      (status === "TO DO") |
      (status === "IN PROGRESS") |
      (status === "DONE")
    ) {
      const statusUpdateQuery = `UPDATE todo 
                                 SET status = '${status}'
                                 WHERE id = '${todoId}';`;
      const dbStatusUpdateResponse = await db.run(statusUpdateQuery);
      response.send("Status Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (priority !== "") {
    if (
      (priority === "HIGH") |
      (priority === "MEDIUM") |
      (priority === "LOW")
    ) {
      const statusUpdateQuery = `UPDATE todo 
                                 SET priority = '${priority}'
                                 WHERE id = '${todoId}';`;
      const dbStatusUpdateResponse = await db.run(statusUpdateQuery);
      response.send("Priority Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (todo !== "") {
    const statusUpdateQuery = `UPDATE todo 
                                 SET todo = '${todo}'
                                 WHERE id = '${todoId}';`;
    const dbStatusUpdateResponse = await db.run(statusUpdateQuery);
    response.send("Todo Updated");
  } else if (category !== "") {
    if (
      (category === "WORK") |
      (category === "HOME") |
      (category === "LEARNING")
    ) {
      const statusUpdateQuery = `UPDATE todo 
                                 SET category = '${category}'
                                 WHERE id = '${todoId}';`;
      const dbStatusUpdateResponse = await db.run(statusUpdateQuery);
      response.send("Category Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (dueDate !== "") {
    const dateObj = new Date(dueDate);
    var isValidDate = isValid(dateObj);
    if (isValidDate) {
      var resultDate = format(dateObj, "yyyy-MM-dd");
      const statusUpdateQuery = `UPDATE todo 
                                 SET due_date = '${resultDate}'
                                 WHERE id = '${todoId}';`;
      const dbStatusUpdateResponse = await db.run(statusUpdateQuery);
      response.send("Due Date Updated");
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});
//API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo
                            WHERE id = '${todoId}';`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
