import {Month, Week, Day, Task, Event} from "./calendarObjects.js"

export class Calendar {
    constructor() {
        // The calendar is a list of months
        // The month constructor creates the correct number of weeks and days
        this.months = [];
        // For testing purposes, we just add 1 month
        const month = new Month(0);
        this.months.push(month);

        // Tasks are dynamic
        this.tasks = [];

        // Create the task scheduler
        this.taskScheduler = new TaskScheduler(this.tasks);
      }

      getMonths() {
        return this.months;
      }

      // Create an iterator of day by day
      *dayIterator() {
        for (const month of this.months) {
          for (const week of month.weeks) {
            for (const day of week.days) {
              yield day;
            }
          }
        }
      }

    buildCalendar() {
        const blocks = new Array(24*4) // 24 hours * 4 blocks per hour
    }

    // Add event to calendar
    createEvent(name, description, startDate, endDate, location, deadline, priority) {
        const newEvent = new Event(name, description, startDate, endDate, location, deadline, priority);

        // Calculate the day(s) the event falls on
        const startDay = startDate.getDate();

        // Iterate through the days of the month
        // and add the event to the correct day
        for (let day of this.dayIterator) {
            if (day.getDate() === startDay) {
                day.getEvents().push(newEvent);
            }
        }
    }

    createTask(name, description, dueDate, priority, duration) {
        const newTask = new Task(name, description, dueDate, priority, duration);

        // Tasks by default do not have a date assigned to them, so we just add
        // them to the task list. They will be assigned a date when we call
        // runScheduler()
        this.tasks.push(newTask);
    }

    runScheduler(timespan) {
        this.taskScheduler.runScheduler(timespan, this.events);
    }

    setSchedulerAlgorithm(algorithm) {
        this.taskScheduler.setAlgorithm(algorithm);
    }

    // Does not work at the moment

    // removeEvent(event) {
    //     const index = this.events.indexOf(event);
    //     if (index !== -1) {
    //         this.events.splice(index, 1);
    //         const day = this.getDayFromDate(event.date);
    //         day.removeEvent(event);
    //     }
    // }
}

class TaskScheduler {
    // Algorithm choices are:
    // FCFS
    // Deadline
    // Priority
    // RR
    // SJF
    constructor(algorithm) {
        this.algorithm = algorithm;
    }

    setAlgorithm(algorithm) {
        this.algorithm = algorithm;
    }


    // Argument can be an instance of class month/week/day.
    // This algorithm will find all of the tasks for that given month/week/day
    // and then sort them according to the algorithm set
    runScheduler(timespan, unassignedTasks) {
        let tasks = timespan.getTasks();
        console.log("Tasks length: " + tasks.length)
        timespan.removeTasks();
        tasks.concat(unassignedTasks);
        let events = timespan.getEvents();

        // Algorithm sorts tasks in order
        switch(this.algorithm) {
            case "FCFS":
                console.log("FCFS");
                
                // Sort the tasks to be scheduled according to creation time (which is of type Date)
                tasks.sort((task1, task2) => {
                    if (task1.creationTime < task2.creationTime) {
                      return -1;
                    }
                    if (task1.creationTime > task2.creationTime) {
                      return 1;
                    }
                    return 0;
                });
                
                // Now add the tasks to the event array
                break;
            case "Deadline":
                console.log("Deadline");

                // Sort the tasks to be scheduled according to due date/deadline 
                tasks.sort((task1, task2) => {
                    if (task1.dueDate < task2.dueDate) {
                      return -1;
                    }
                    if (task1.dueDate > task2.dueDate) {
                      return 1;
                    }
                    return 0;
                });

                break;
            case "Priority":
                console.log("Priority");

                // Sort the tasks to be scheduled according to priority 
                tasks.sort((task1, task2) => {
                    if (task1.priority < task2.priority) {
                        return -1;
                    }
                    if (task1.priority > task2.priority) {
                        return 1;
                    }
                    return 0;
                });
                
                break;
            case "RR":
                console.log("RR");
                let tempTasksArray = [...tasks];
                let finalTasksArray = [];
                let timeQuantum = 60;

                console.log("Before RR: " + tasks.length);

                for (let i = 0; i < tempTasksArray; i++) {
                    // If the task can be completed in the time quantum, finish the task
                    if (tempTasksArray[i].duration <= timeQuantum) {
                    finalTasksArray.push(tempTasksArray[i]);
                    tempTasksArray.splice(i, 1);
                    i--;
                    } else {
                    // Create a new task that has a shorter duration
                    finalTasksArray.push(tempTasksArray[i].createSmallerTask(timeQuantum));
                    tempTasksArray[i].duration -= timeQuantum;
                    }
                }

                // Set the temp tasks as the tasks to be scheduled
                tasks = tempTasksArray;

                console.log("After RR: " + tasks.length);
            
                break;
            case "SJF":
                console.log("SJF");

                // Sort the tasks to be scheduled according to due date/deadline 
                tasks.sort((task1, task2) => {
                    return task1.duration - task2.duration;
                });

                break;
            default:
                console.log("Invalid algorithm specified.")
                break;
        }

        // Algorithm then interleaves tasks with events so they do not overlap
        let weeks = timespan.getWeeks();

        // Iterate through the days in the timespan
        for (let i = 0; i < weeks.length; i++) {
            let week = weeks[i];
            let days = week.getDays();

            // k is the task index
            let k = 0;
            for (let j = 0; j < days.length; j++) {
                let day = days[j];
                let eventsOnDay = day.getEvents();
                // Empty the current tasks of the day
                day.tasks = [];

                // Sort the events on the current day by end time
                eventsOnDay.sort((event1, event2) => {
                    return event1.endDate - event2.endDate;
                });

                let allocatedTasks = 0;
                // Currently, only allocate 3 tasks per day
                while (allocatedTasks < 3 && k < tasks.length) {

                    // Allocate tasks in the free spots on the current day
                    let startTime = new Date(day.getDate());
                    let taskEndTime = new Date(startTime.getTime() + tasks[k].duration);

                    for (let event of eventsOnDay) {
                        if (taskEndTime <= event.startDate) {
                            // Allocate the task in the free spot
                            tasks[k].startTime = startTime;
                            tasks[k].endTime = taskEndTime;
                            startTime = taskEndTime;
                            day.tasks.push(tasks[k]);
                            k++;
                            allocatedTasks++;
                            break;
                        } else {
                            // Update the start time to the end time of the event
                            startTime = new Date(event.endDate);
                        }
                    }
                }
            }
        }
    } 
}

function main() {
    // create a new calendar
    const calendar = new Calendar();

    // create some test tasks
    calendar.createTask("Write report", "Write a progress report for the project", new Date(2023, 3, 5), 3, 4);
    calendar.createTask("Test code", "Run tests on the latest code changes", new Date(2023, 3, 6), 2, 3);    
    calendar.createTask("task1", "description", new Date(2023, 2, 29, 13, 0), 1, 120);
    calendar.createTask("task2", "description", new Date(2023, 2, 30, 14, 0), 2, 180);
    calendar.createTask("task3", "description", new Date(2023, 3, 1, 11, 0), 3, 60);
    calendar.createTask("task4", "description", new Date(2023, 3, 3, 10, 0), 4, 240);

    // Run the scheduler on just tasks
    console.log("Before priority scheduling tasks:");
    console.log(calendar.tasks);
  
    calendar.setSchedulerAlgorithm("Priority");
    calendar.runScheduler(calendar.months[0]); 

    console.log("After priority scheduling tasks:");
    console.log(calendar.tasks);

    // create some test events
    calendar.createEvent("Meeting", "Discuss project updates", new Date(2023, 3, 1, 14, 0), new Date(2023, 3, 1, 15, 0), "Room 101", null, 2);
    calendar.createEvent("Lunch", "Eat at the cafeteria", new Date(2023, 3, 1, 12, 0), new Date(2023, 3, 1, 13, 0), "Cafeteria", null, 1);


    // run the task scheduler for the next week
    console.log("Duration scheduling tasks:");
    const timespan = calendar.months[0].weeks[0];
    calendar.runScheduler(timespan);

    // log the scheduled events and tasks
    console.log("Scheduled events:");
    for (const day of calendar.dayIterator()) {
        const events = day.getEvents();
        for (const event of events) {
            console.log(`${event.getName()} on ${day.getDate()}/${day.getMonth()+1}/${day.getYear()}`);
        }
    }
  
    console.log("Scheduled tasks:");
    for (const day of calendar.dayIterator()) {
        const tasks = day.getTasks();
        for (const task of tasks) {
            if (isNaN(task.startTime)) {
                console.log(`${task.getName()} has not been scheduled yet`);
            } else {
                console.log(`${task.getName()} starts on ${task.startDate.getDate()}/${task.startDate.getMonth()+1}/${task.startDate.getYear()}`);
            }
        }
    }
}

//main();