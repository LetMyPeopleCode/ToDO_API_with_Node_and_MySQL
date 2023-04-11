const crypto = require('crypto');
const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'todo_admin',
  password: 'leelu_dallas_multipass-6',
  database: 'todo'
})
connection.connect();

runQuery = function(query){
  return new Promise(function(resolve, reject){
    connection.query(
        query, 
        function(err, rows){                                                
          if(rows === undefined){
            reject(new Error("Error rows is undefined"));
            console.log(err);
          }else{
            resolve(rows);
          }
        }
    )}
)}


module.exports = {
  /**
  * Gets a list of all items or all uncompleted items.
  * @param options.completed  

  */
  getTodo: async (options) => {

    // Implement your business logic here...
    //
    // Return all 2xx and 4xx as follows:
    //
    // return {
    //   status: 'statusCode',
    //   data: 'response'
    // }

    // If an error happens during your business logic implementation,
    // you can throw it as follows:
    //
    // throw new Error('<Error message>'); // this will result in a 500
    
    //compose the query
    let query = "SELECT * FROM todos WHERE `completed` = 0";
    if(options.complete && (options.complete.toLowerCase() === 'true'))
    {
      query = "SELECT * FROM todos";
    }
    
    //query the database
    response = await runQuery(query);

    return {
      status: 200,
      data: response
    };       
  },

  /**
  * Create a to-do item.

  * @param options.postTodoInlineReqUrlencoded.completed True means the task is complete, false means it is not.
  * @param options.postTodoInlineReqUrlencoded.task requiredText between 2 to 255 characters.

  */
  postTodo: async (options) => {

    // Implement your business logic here...
    //
    // Return all 2xx and 4xx as follows:
    //
    // return {
    //   status: 'statusCode',
    //   data: 'response'
    // }

    // If an error happens during your business logic implementation,
    // you can throw it as follows:
    //
    // throw new Error('<Error message>'); // this will result in a 500

    let status = 200;
    let task = ''
    let completed = false;
    let params = options.postTodoInlineReqUrlencoded;

    // Make sure a task was submitted and is 2-355 characters
    if (params.task && (params.task.length > 1) && (params.task.length < 256)) {
      task = connection.escape(params.task); // escapes special characters 
    } else {
      // set bad request header and return error message
      return {
        status: 400,
        data: {error: "You did not include a value for the task or it was too short/long (2-255 chars)."}
      };  
    }

    // Set a value for the completion status - default is false
    if (params.completed && (params.completed.toLowerCase() === 'true')){
      completed = true;
    } 

    // Generate a task ID
    let id_code = crypto.randomUUID();

    // compose the query & run it
    let query = `INSERT INTO todos (id_code, to_do, completed) VALUES ('${id_code}', ${task}, ${completed})`;
    response = await runQuery(query);

    // compose the return value (if the query returned okay) 
    let todo = {
      "idcode": id_code,
      "task": task,
      "completed": completed
    }

    // return the response
    return {
      status: status,
      data: todo
    };  
  },

  /**
  * Update a to-do item.

  * @param options.putTodoInlineReqUrlencoded.id_code requiredA GUID identifying an individual task.

  */
  putTodo: async (options) => {

    // Implement your business logic here...
    //
    // Return all 2xx and 4xx as follows:
    //
    // return {
    //   status: 'statusCode',
    //   data: 'response'
    // }

    // If an error happens during your business logic implementation,
    // you can throw it as follows:
    //
    // throw new Error('<Error message>'); // this will result in a 500

    let id_code = '';
    var task = ''
    var completed = '';
 
    // validate for requiring an id code plus a task and/or completion
    var params = options.putTodoInlineReqUrlencoded;
    if(!params.id_code){
      return {
        status: 400,
        data: {error : "An id_code is required."}
      }
    }
    
    if(!params.task && !params.completed){
      return {
        status: 400,
        data: {error: "A task and/or a completion status is required."}
      }
    }

    if(params.task && !((params.task.length > 1) && (params.task.length < 256))){
      return {
        status: 400,
        data: {error: "The task is not between 2-255 characters"}
      }
    }

    //compose the query values

    id_code = connection.escape(params.id_code);

    if(params.task){
      task = "to_do = " + connection.escape(params.task);
    }

   // Set a boolean value for the completion status if it exists
   if(params.completed) {
    state = params.completed.toLowerCase();
    if ((state === "true")||(state === 'false')){ 
      state = (state === "true") ? true : false;
      completed = (params.task) ? `, completed = ${state}` : `completed = ${state}`;
    }
   } 

    // run the update
   let query = `UPDATE todos SET ${task}${complete} WHERE id_code = ${id_code}`;
   response = await runQuery(query);

   // confirm the update
   query = `SELECT * FROM todos WHERE id_code = ${id_code}`;
   response = await runQuery(query);
   data = response[0];

    return {
      status: 200,
      data: data
    };  
  },
};

