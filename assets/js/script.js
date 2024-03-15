// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));
const taskFormEl = $("#taskFrom");

function readTasksFromStorage() {
  //  Retrieve taskss from localStorage
  let tasks = JSON.parse(localStorage.getItem("tasks"));
  if (!tasks) {
    tasks = [];
  }
  return tasks;
}

function saveTasksToStorage(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

//function to create a task card
function createTaskCard(task) {
  const card = $("<div>")
    .addClass("card task-card draggable my-3")
    .attr("data-task-id", task.id);
  const cardHeader = $("<div>").addClass("card-header h4").text(task.name);
  const cardBody = $("<div>").addClass("card-body");
  const cardDescription = $("<p>").addClass("card-text").text(task.type);
  const cardDueDate = $("<p>").addClass("card-text").text(task.dueDate);
  const cardDeleteBtn = $("<button>")
    .addClass("btn btn-danger delete")
    .addClass("btn-delete-task")
    .text("Delete")
    .attr("data-task-id", task.id);
  cardDeleteBtn.on("click", handleDeleteTask);
  // Set the card background color based on due date.
  if (task.dueDate && task.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");

    // If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskDueDate, "day")) {
      card.addClass("bg-warning text-white");
    } else if (now.isAfter(taskDueDate)) {
      card.addClass("bg-danger text-white");
      cardDeleteBtn.addClass("border-light");
    }
  }

  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  card.append(cardHeader, cardBody);

  return card;
}

//function to render the task list and make cards draggable
function renderTaskList() {
  const tasks = readTasksFromStorage();

  // Empty existing task cards out of the lanes
  const todoList = $("#todo-cards");
  todoList.empty();

  const inProgressList = $("#in-progress-cards");
  inProgressList.empty();

  const doneList = $("#done-cards");
  doneList.empty();

  // Loop through tasks and create task cards for each status
  for (let task of tasks) {
    if (task.status === "to-do") {
      todoList.append(createTaskCard(task));
    } else if (task.status === "in-progress") {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === "done") {
      doneList.append(createTaskCard(task));
    }
  }

  // Use JQuery UI to make task cards draggable
  $(".draggable").draggable({
    opacity: 0.7,
    zIndex: 100,
    // This is the function that creates the clone of the card that is dragged.
    helper: function (e) {
      // Check if the target of the drag event is the card
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");
      // Return the clone with the width set to the width of the original card.
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

//function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  //Get task title, description and due date.
  const taskTitle = $("#taskTitle").val();
  const taskDescription = $("#taskDescription").val();
  const taskDueDate = $("#datePicker").val();

  //Create a new task object with the data from the form
  const newTask = {
    id: crypto.randomUUID(),
    name: taskTitle,
    type: taskDescription,
    dueDate: taskDueDate,
    status: "to-do",
  };

  //Pull the Tasks from localStorage and push the new task to the array.
  const tasks = readTasksFromStorage();
  tasks.push(newTask);

  //Save the updated tasks array to localStorage
  saveTasksToStorage(tasks);

  //Print task data back to the screen
  renderTaskList();

  //Clear the form inputs
  $("#taskTitle").val("");
  $("#taskDescription").val("");
  $("#datePicker").val("");
}

//function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(this).attr("data-task-id");
  const tasks = readTasksFromStorage();

  // Loop through the taskss array and remove the task with the matching id.
  tasks.forEach((task, index) => {
    if (task.id === taskId) {
      tasks.splice(index, 1);
    }
  });

  //save the tasks to localStorage
  saveTasksToStorage(tasks);

  //print tasks back to the screen
  renderTaskList();
}

//function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const tasks = readTasksFromStorage();
  const taskId = ui.draggable[0].dataset.taskId;
  const newStatus = event.target.id;
  for (let task of tasks) {
    if (task.id === taskId) {
      task.status = newStatus;
    }
  }
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTaskList();
}

// when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {});

taskFormEl.on("submit", handleAddTask);

$(document).ready(function () {
  // ? Print project data to the screen on page load if there is any
  renderTaskList();

  $(function () {
    $("#datepicker").datepicker({
      changeMonth: true,
      changeYear: true,
    });
  });

  // ? Make lanes droppable
  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });
});
