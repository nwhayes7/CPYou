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
    scheduleTasks() {
        
    }
}

class Task {
    constructor(name, description, dueDate, priority, estimatedTime, divisible) {
        this.name = name;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.estimatedTime = estimatedTime;
        this.divisible = divisible;
    }
    getName() {
        return this.name;
    }
    getDescription() {
        return this.description;
    }
    getDueDate() {
        return this.dueDate;
    }
    getPriority() {
        return this.priority;
    }
    getEstimatedTime() {
        return this.estimatedTime;
    }
}

class Event {
    constructor(name, description, startDate, endDate, location, priority) {
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.location = location;
        this.priority = priority;
    }

    getName() {
        return this.name;
    }
    getDescription() {
        return this.description;
    }
    getStartDate() {
        return this.startDate;
    }
    getEndDate() {
        return this.endDate;
    }
    getLocation() {
        return this.location;
    }
    getPriority() {
        return this.priority;
    }
}

class Month {
    constructor(name, days) {
        this.name = name;
        this.days = days;
    }
    getName() {
        return this.name;
    }
    getDays() {
        return this.days;
    }
}

class Week {
    constructor(days) {
        this.days = days;
    }
    getDays() {
        return this.days;
    }
}

class Day {
    constructor(date, events, tasks, nextDay) {
        this.date = date;
        this.events = events;
        this.tasks = tasks;
    }
    getDate() {
        return this.date;
    }
    getEvents() {
        return this.events;
    }
    getTasks() {
        return this.tasks;
    }
    getNextDay() {
        return this.nextDay;
    }

}
