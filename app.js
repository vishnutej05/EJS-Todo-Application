const express = require("express");
const app = express();
app.use(express.json());
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const toDate = require("date-fns/toDate");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http:/localhost:3000/");
    });
  } catch (e) {
    console.log(e.message);
  }
};

initializeDBAndServer();

const checkRequestQueries = async (request, response, next) => {
  const { search_q, category, priority, status, date } = request.query;
  const { todoId } = request.params;

  if (category !== undefined) {
    const acceptableCategory = ["WORK", "HOME", "LEARNING"];
    const isTrue = acceptableCategory.includes(category);
    if (isTrue) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (priority !== undefined) {
    const acceptableCategory = ["HIGH", "MEDIUM", "LOW"];
    const isTrue = acceptableCategory.includes(priority);
    if (isTrue) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  if (status !== undefined) {
    const acceptableCategory = ["TO DO", "IN PROGRESS", "DONE"];
    const isTrue = acceptableCategory.includes(status);
    if (isTrue) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }

  if (date !== undefined) {
    try {
      const myDate = new Date(date);

      const formatedDate = format(new Date(date), "yyyy-MM-dd");
      console.log(formatedDate, "f");
      const result = toDate(
        new Date(
          `${myDate.getFullYear()}-${myDate.getMonth() + 1}-${myDate.getDate()}`
        )
      );
      console.log(result, "r");
      console.log(new Date(), "new");

      const isValidDate = await isValid(result);
      console.log(isValidDate, "V");
      if (isValidDate === true) {
        request.date = formatedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
        return;
      }
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }
  request.search_q = search_q;
  request.todoId = todoId;

  next();
};

const checkRequestBody = (request, response, next) => {
  const { id, todo, category, priority, status, dueDate } = request.body;
  const { todoId } = request.params;

  if (category !== undefined) {
    categoryArray = ["WORK", "HOME", "LEARNING"];
    categoryIsInArray = categoryArray.includes(category);

    if (categoryIsInArray === true) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (priority !== undefined) {
    priorityArray = ["HIGH", "MEDIUM", "LOW"];
    priorityIsInArray = priorityArray.includes(priority);
    if (priorityIsInArray === true) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  if (status !== undefined) {
    statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    statusIsInArray = statusArray.includes(status);
    if (statusIsInArray === true) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }

  if (dueDate !== undefined) {
    try {
      const myDate = new Date(dueDate);
      const formatedDate = format(new Date(dueDate), "yyyy-MM-dd");
      console.log(formatedDate);
      const result = toDate(new Date(formatedDate));
      const isValidDate = isValid(result);
      console.log(isValidDate);
      console.log(isValidDate);
      if (isValidDate === true) {
        request.dueDate = formatedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
        return;
      }
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }
  request.todo = todo;
  request.id = id;

  request.todoId = todoId;

  next();
};

//GET Todos acc to Query params API 1
app.get("/todos/", checkRequestQueries, async (request, response) => {
  const { status = "", category = "", priority = "", search_q = "" } = request;
  console.log(status, category, priority, search_q);

  const query = `
    SELECT id,todo,priority,status,category,due_date as dueDate FROM todo
    WHERE 
        todo LIKE '%${search_q}%' AND priority LIKE '%${priority}%' 
        AND status LIKE '%${status}%' AND category LIKE '%${category}%';`;

  const res = await db.all(query);
  response.send(res);
});

//GET specific TODO API 2
app.get("/todos/:todoId/", checkRequestQueries, async (request, response) => {
  const { todoId } = request;
  const query = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE id = ${todoId};`;
  const res = await db.get(query);
  response.send(res);
});

//Get TODO as per dateAPI 3
app.get("/agenda", checkRequestQueries, async (request, response) => {
  const { date } = request;
  console.log(date, "checking");

  const query = `SELECT
            id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate
        FROM 
            todo
        WHERE 
            due_date = '${date}';`;

  const res = await db.all(query);
  console.log(res);
  response.send(res);
});

//CREATE TODO API 4
app.post("/todos/", checkRequestBody, async (request, response) => {
  const { id, todo, category, priority, status, dueDate } = request;
  const query = `
  INSERT INTO 
    todo(id,todo,priority,status,category,due_date)
   VALUES(
       ${id},
       '${todo}',
       '${category}',
       '${priority}',
       '${status}',
       '${dueDate}'
   );
  `;
  const res = await db.run(query);
  console.log(res);
  response.send("Todo Successfully Added");
});

//UPDATE API 5
app.put("/todos/:todoId/", checkRequestBody, async (request, response) => {
  const { todo, priority, status, category, dueDate } = request;

  console.log(todo, priority, status, category, dueDate);

  const { todoId } = request;

  switch (true) {
    case todo != undefined:
      const query = `
        UPDATE todo
        SET 
        todo = '${todo}'
        WHERE 
        id = ${todoId};
        `;
      await db.run(query);
      response.send("Todo Updated");
      break;

    case priority != undefined:
      const pquery = `
        UPDATE todo
        SET 
        priority = '${priority}'
        WHERE 
        id = ${todoId};
        `;
      await db.run(pquery);
      response.send("Priority Updated");
      break;

    case status != undefined:
      const squery = `
        UPDATE todo
        SET 
        status = '${status}'
        WHERE 
        id = ${todoId};
        `;
      await db.run(squery);
      response.send("Status Updated");
      break;

    case category != undefined:
      const cquery = `
        UPDATE todo
        SET 
        category = '${category}'
        WHERE 
        id = ${todoId};
        `;
      await db.run(cquery);
      response.send("Category Updated");
      break;

    case dueDate != undefined:
      const dquery = `
        UPDATE todo
        SET 
        due_date = '${dueDate}'
        WHERE 
        id = ${todoId};
        `;
      await db.run(dquery);
      response.send("Due Date Updated");
      break;
  }
});

// DELETE API 6
app.delete("/todos/:todoId/", checkRequestBody, async (request, response) => {
  const { todoId } = request;
  const query = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(query);
  response.send("Todo Deleted");
});

module.exports = app;
