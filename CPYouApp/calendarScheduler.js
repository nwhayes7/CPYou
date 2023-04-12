class Calendar {
    constructor(events, tasks, scheduler) {
        this.events = events;
        this.tasks = tasks;
        this.taskScheduler = TaskScheduler(this.tasks);
    } 
    buildCalendar() {
        const blocks = new Array(24*4) // 24 hours * 4 blocks per hour
    }

    addEvent(event) {
        this.events.push(event);
    }

    addTask(task) {
        this.tasks.push(task);
        this.scheduler.scheduleTasks();
    }
}

class TaskScheduler {
    constructor(algorithm, tasks) {
        this.algorithm = algorithm;
        this.tasks = tasks; //list of tasks
    }
    scheduleFCFS() {
        tempTasks = new Array(this.tasks.length);
        while (this.tasks.length > 0) {
            let task = this.tasks.pop();
            let due  = task.getDueDate();
        }
    }
}
