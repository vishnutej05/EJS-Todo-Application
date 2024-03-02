app.post("/todos/", checkRequestsBody, async (request, response) => {
  const { id, todo, category, priority, status, dueDate } = request;

  const addTodoQuery = `
        INSERT INTO 
            todo (id, todo, priority, status, category, due_date)
        VALUES
            (
                ${id},
               '${todo}',
               '${priority}',
               '${status}',
               '${category}',
               '${dueDate}'
            )
        ;`;

  const createUser = await db.run(addTodoQuery);
  console.log(createUser);
  response.send("Todo Successfully Added");
});