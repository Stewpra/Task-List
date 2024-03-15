let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));
const taskFormEl = $("#taskFrom");

function readTasksFromStorage() {
  let tasks = JSON.parse(localStorage.getItem("tasks"));
  if (!tasks) {
    tasks = [];
  }
  return tasks;
}

function saveTasksToStorage(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

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

  if (task.dueDate && task.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");

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

function renderTaskList() {
  const tasks = readTasksFromStorage();

  const todoList = $("#todo-cards");
  todoList.empty();

  const inProgressList = $("#in-progress-cards");
  inProgressList.empty();

  const doneList = $("#done-cards");
  doneList.empty();

  for (let task of tasks) {
    if (task.status === "to-do") {
      todoList.append(createTaskCard(task));
    } else if (task.status === "in-progress") {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === "done") {
      doneList.append(createTaskCard(task));
    }
  }

  $(".draggable").draggable({
    opacity: 0.7,
    zIndex: 100,

    helper: function (e) {
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");

      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

function handleAddTask(event) {
  event.preventDefault();

  const taskTitle = $("#taskTitle").val();
  const taskDescription = $("#taskDescription").val();
  const taskDueDate = $("#datepicker").val();

  const newTask = {
    id: crypto.randomUUID(),
    name: taskTitle,
    type: taskDescription,
    dueDate: taskDueDate,
    status: "to-do",
  };

  const tasks = readTasksFromStorage();
  tasks.push(newTask);

  saveTasksToStorage(tasks);

  renderTaskList();

  $("#taskTitle").val("");
  $("#taskDescription").val("");
  $("#datePicker").val("");
}

function handleDeleteTask(event) {
  const taskId = $(this).attr("data-task-id");
  const tasks = readTasksFromStorage();

  tasks.forEach((task, index) => {
    if (task.id === taskId) {
      tasks.splice(index, 1);
    }
  });

  saveTasksToStorage(tasks);

  renderTaskList();
}

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

$(document).ready(function () {});

taskFormEl.on("submit", handleAddTask);

$(document).ready(function () {
  renderTaskList();

  $(function () {
    $("#datepicker").datepicker({
      changeMonth: true,
      changeYear: true,
    });
  });

  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });
});
