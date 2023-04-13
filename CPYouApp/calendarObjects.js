class Month {
    constructor(index) {
        // Months are a list of weeks
        this.index = index;
        this.weeks = [];
    }

    getDays() {
        return this.days;
    }

    // Create an iterator of day by day
    *dayIterator() {
        for (const week of this.weeks) {
            for (const day of week.days) {
                yield day;
            }
        }
    }

    // Return all of the events and tasks scheduled for this month
    getEventsAndTasks() {
        const eventsAndTasks = [];
        for (const day of this.dayIterator()) {
            eventsAndTasks.push(...day.events, ...day.tasks);
        }
        return eventsAndTasks;
    }

    // Return all of the events scheduled for this month
    getEvents() {
        const events = [];
        for (const day of this.dayIterator()) {
            events.push(...day.events);
        }
        return events;
    }

    // Return all of the tasks scheduled for this month
    getTasks() {
        const tasks = [];
        for (const day of this.dayIterator()) {
            tasks.push(...day.tasks);
        }
        return tasks;
    }
}



class Week {
    constructor() {
        // Weeks are a list of days
        this.days = [];
    }

    getDays() {
        return this.days;
    }

    // Create an iterator of day by day
    *dayIterator() {
        for (const day of this.days) {
            yield day;
        }
    }   
    
    // Return all of the events and tasks scheduled for this week
    getEventsAndTasks() {
        const eventsAndTasks = [];
        for (const day of this.dayIterator()) {
            eventsAndTasks.push(...day.events, ...day.tasks);
        }
        return eventsAndTasks;
    }

    // Return all of the events scheduled for this week
    getEvents() {
        const events = [];
        for (const day of this.dayIterator()) {
            events.push(...day.events);
        }
        return events;
    }

    // Return all of the tasks scheduled for this week
    getTasks() {
        const tasks = [];
        for (const day of this.dayIterator()) {
            tasks.push(...day.tasks);
        }
        return tasks;
    }
}

class Day {
    constructor(date, nextDay) {
        this.date = date;
        this.events = [];
        this.tasks = [];
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
    // Returns a 24-hour view of the day
    getFullDayView() {
        const dayView = [];
        const startOfDay = new Date(this.date);
        const endOfDay = new Date(this.date);
        endOfDay.setDate(endOfDay.getDate() + 1);
        let current = new Date(startOfDay);
        
        // Iterate through all 24 hours of the day
        while (current < endOfDay) {
            // Check if there is an event at the current time
            // event = eventIndex if there is an event at the current time,
            // event = -1 otherwise
            const eventIndex = this.events.findIndex(e => {
                const start = new Date(e.startDate);
                const end = new Date(e.endDate);
                return (current >= start && current < end);
            });
            
            if (eventIndex != -1) {
                // Add event to day view
                dayView.push({
                    start: current.toLocaleTimeString(),
                    end: new Date(this.events[eventIndex].endDate).toLocaleTimeString(),
                    type: 'event',
                    index: eventIndex
                });
                
                // Move current time to end of event
                current = new Date(this.events[eventIndex].endDate);
            } else {
                // Check if there is a task at the current time
                const taskIndex = this.tasks.findIndex(t => {
                    const start = new Date(t.startTime);
                    const end = new Date(t.endTime);
                    return current >= start && current < end;
                });
                
                if (taskIndex != -1) {
                    // Add task to day view
                    dayView.push({
                        start: current.toLocaleTimeString(),
                        end: new Date(this.tasks[taskIndex].endTime).toLocaleTimeString(),
                        type: 'task',
                        index: taskIndex
                    });
                    
                    // Move current time to end of task
                    current = new Date(this.tasks[taskIndex].endTime);
                } else {
                    // Add free block to day view
                    dayView.push({
                        start: current.toLocaleTimeString(),
                        end: new Date(current.getTime() + 60000).toLocaleTimeString(),
                        type: 'free',
                        index: -1
                    });
                    
                    // Move current time to next minute
                    current.setMinutes(current.getMinutes() + 1);
                }
            }
        }
        return dayView;
    }    
    getNextDay() {
        return this.nextDay;
    }

    // Return all of the events and tasks scheduled for this day
    getEventsAndTasks() {
        const eventsAndTasks = [];
        eventsAndTasks.push(...this.events, ...this.tasks);
        return eventsAndTasks;
    }
}

class Task {
    counter = 0;
    constructor(name, description, dueDate, priority, duration) {
        this.id = ++counter;
        // String
        this.name = name;
        // String
        this.description = description;
        // Date
        this.creationTime = new Date();
        // Date; these are not set at creation, these are set by the scheduling algorithm
        this.startTime = new Date(NaN);
        this.endTime = new Date(NaN);
        // Date
        this.dueDate = dueDate;
        // Integer in set {1, 2, 3}?
        this.priority = priority;
        // Hours?
        this.duration = duration;
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
    getDuration() {
        return this.duration;
    }
    // Used in RR scheduling to create a smaller instance of a task
    createSmallerTask(newDuration) {
        return new Task(this.name, 
                        this.description,
                        this.dueDate,
                        this.priority,
                        newDuration);
      }
}

class Event {
    counter = 0;
    constructor(name, description, startDate, endDate, location, deadline, priority) {
        this.id = counter++;
        this.name = name;
        this.description = description;
        this.creationTime = creationTime;
        this.startDate = startDate;
        this.endDate = endDate;
        this.location = location;
        // The user will input a "deadline" for an event. This will be converted to
        // seconds since the epoch; smaller values means a sooner deadline means 
        // a higher priority.
        this.deadline = deadline;
        this.priority = priority;
    }
    getName() {
        return this.name;
    }
    getDescription() {
        return this.description;
    }
    getCreationTime() {
        return this.creationTime;
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