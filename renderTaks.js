
        // --- UPDATED JavaScript Logic ---
        document.addEventListener('DOMContentLoaded', () => {
            const taskInput = document.getElementById('taskInput');
            const dueDateInput = document.getElementById('dueDateInput');
            const addTaskButton = document.getElementById('addTaskButton');
            const taskList = document.getElementById('taskList');
            const tasks = []; 

            // --- Task Addition ---
            addTaskButton.addEventListener('click', addTask);
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addTask();
                }
            });

            function addTask() {
                const taskText = taskInput.value.trim();
                const dueDate = dueDateInput.value;

                if (taskText === "") {
                    alert("Please enter a task.");
                    return;
                }

                const newTask = {
                    id: Date.now(), 
                    text: taskText,
                    dueDate: dueDate ? new Date(dueDate) : null,
                    completed: false,
                    intervalId: null 
                };

                tasks.push(newTask);
                renderTask(newTask);

                // Clear inputs
                taskInput.value = '';
                dueDateInput.value = '';
            }

            // --- Rendering a Single Task (No change needed here) ---
            function renderTask(task) {
                const listItem = document.createElement('li');
                listItem.setAttribute('data-id', task.id);

                let statusClass = task.completed ? 'completed' : '';
                listItem.className = statusClass;

                listItem.innerHTML = `
                    <div class="task-info ${statusClass}">
                        <span class="task-name">${task.text}</span>
                    </div>
                    <div class="timer"></div>
                    <div class="actions">
                        <button class="complete-btn">${task.completed ? 'Undo' : 'Complete'}</button>
                        <button class="delete-btn">Delete</button>
                    </div>
                `;
                
                const timerDisplay = listItem.querySelector('.timer');
                if (task.dueDate && !task.completed) {
                    startTimer(task, listItem, timerDisplay);
                } else if (task.completed) {
                    timerDisplay.textContent = 'Completed!';
                } else {
                    timerDisplay.textContent = 'No Due Date';
                }

                listItem.querySelector('.complete-btn').addEventListener('click', () => toggleComplete(task.id, listItem));
                listItem.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id, listItem));

                taskList.appendChild(listItem);
            }

            // --- Completion/Deletion (Minor change to stop timer on delete) ---
            function toggleComplete(id, listItem) {
                const task = tasks.find(t => t.id === id);
                if (!task) return;

                task.completed = !task.completed;
                
                // Remove overdue class if task is completed/undone
                listItem.classList.remove('overdue'); 

                const completeButton = listItem.querySelector('.complete-btn');
                const timerDisplay = listItem.querySelector('.timer');
                const taskInfo = listItem.querySelector('.task-info');

                if (task.completed) {
                    listItem.classList.add('completed');
                    taskInfo.classList.add('completed');
                    completeButton.textContent = 'Undo';
                    clearInterval(task.intervalId); 
                    timerDisplay.textContent = 'Completed!';
                } else {
                    listItem.classList.remove('completed');
                    taskInfo.classList.remove('completed');
                    completeButton.textContent = 'Complete';
                    if (task.dueDate) {
                        startTimer(task, listItem, timerDisplay);
                    } else {
                        timerDisplay.textContent = 'No Due Date';
                    }
                }
            }

            function deleteTask(id, listItem) {
                const index = tasks.findIndex(t => t.id === id);
                if (index > -1) {
                    const task = tasks[index];
                    clearInterval(task.intervalId); 
                    tasks.splice(index, 1);
                    listItem.remove();
                }
            }


            // --- NEW & UPDATED: Timer Functionality and Overdue Check ---
            function startTimer(task, listItem, displayElement) {
                if (task.intervalId) {
                    clearInterval(task.intervalId);
                }

                const updateTimer = () => {
                    const now = new Date().getTime();
                    const distance = task.dueDate.getTime() - now;

                    if (distance < 0) {
                        clearInterval(task.intervalId);
                        
                        // 1. Change color (Add the overdue CSS class)
                        listItem.classList.add('overdue');
                        displayElement.textContent = "DUE PASSED! ⚠️";

                        // 2. Ask the user about retaking/rescheduling
                        setTimeout(() => {
                            const shouldReschedule = confirm(`The due date for "${task.text}" has passed. Would you like to reschedule this task?`);
                            
                            if (shouldReschedule) {
                                // Simple action: Remove the task and repopulate the input fields
                                deleteTask(task.id, listItem);
                                taskInput.value = task.text;
                                alert("Please enter a new due date and click 'Add Task' to reschedule.");
                            }
                            
                        }, 500); // 500ms delay to ensure UI updates before alert

                        return;
                    }

                    // Time calculations (same as before)
                    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                    displayElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
                };

                updateTimer(); 
                task.intervalId = setInterval(updateTimer, 1000); 
            }
        });
