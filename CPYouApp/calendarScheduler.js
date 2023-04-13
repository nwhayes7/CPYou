class Calendar {
    constructor() {
        // The calendar is a list of months
        // The month constructor creates the correct number of weeks and days
        this.months = [];
        // For testing purposes, we just add 1 month
        const month = new Month(i);
        this.months.push(month);

        // Tasks are dynamic
        this.tasks = [];

        // Create the task scheduler
        this.taskScheduler = new TaskScheduler(this.tasks);
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
        tasks = timespan.getTasks();
        tasks.concat(unassignedTasks);
        events = timespan.getEvents();

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

                let remainingTime = new Array(tasks.length);
                let done = false;
                let tempTasksArray = []

                // Initialize the remaining time of each task to the task's burst time AKA duration
                for (let i = 0; i < tasks.length; i++) {
                  remainingTime[i] = tasks[i].duration;
                }
              
                // Continue processing the tasks until all tasks are complete AKA fully scheduled
                while (!done) {
                  done = true;
              
                  // Process each task for the time quantum or until the task is done
                  for (let i = 0; i < tasks.length; i++) {
                    if (remainingTime[i] > 0) {
                      done = false;
              
                      // If the task can be completed in the time quantum, finish the task
                      if (remainingTime[i] <= timeQuantum) {
                        tempTasksArray.push(tasks[i].createSmallerTask(remainingTime[i]));
                        remainingTime[i] = 0;
                      }
                      // Otherwise, process the task for the time quantum and move it to the back of the queue
                      else {
                        // Create a new task that has a shorter duration
                        tempTasksArray.push(tasks[i].createSmallerTask(timeQuantum));
                        remainingTime[i] -= timeQuantum;
                      }
                    }
                  }
                }



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
        if (timespan instanceof Month || timespan instanceof Week) {
            // Iterate through the days in the timespan
            for (let day of timespan.dayIterator()) {
                let eventsOnDay = day.getEvents();
            
                // Sort the events on the current day by end time
                eventsOnDay.sort((event1, event2) => {
                    return event1.endDate - event2.endDate;
                });
            
                // Allocate tasks in the free spots on the current day
                let startTime = new Date(day);
                for (let task of tasks) {
                    let taskEndTime = new Date(startTime.getTime() + task.duration);
                
                    // Check if the task overlaps with any events on the current day
                    for (let event of eventsOnDay) {
                        if (taskEndTime <= event.startDate) {
                            // Allocate the task in the free spot
                            task.startTime = startTime;
                            task.endTime = taskEndTime;
                            startTime = taskEndTime;
                            // Remove the task from the unassigned tasks list if it has not been removed already
                            unassignedTasks = unassignedTasks.filter(unassignedTask => unassignedTask.id !== task.id);
                            break;
                        } else {
                            // Update the start time to the end time of the event
                            startTime = new Date(event.endDate);
                        }
                    }
                
                    // if (!freeSpotFound) {
                    //     // Allocate the task in the remaining time on the current day
                    //     let endTime = new Date(day.getTime() + 24 * 60 * 60 * 1000);
                    //     if (taskEndTime <= endTime) {
                    //     task.startTime = startTime;
                    //     task.endTime = taskEndTime;
                    //     startTime = taskEndTime;
                    //     }
                    // }
                }
            }
        } 
        // timespan is just 1 day
        else {        
            // Sort the events on the current day by end time
            events.sort((event1, event2) => {
                return event1.endDate - event2.endDate;
            });
        
            // Allocate tasks in the free spots on the current day
            let startTime = new Date(day);
            for (let task of tasks) {
                let taskEndTime = new Date(startTime.getTime() + task.duration);
            
                // Check if the task overlaps with any events on the current day
                for (let event of events) {
                    if (taskEndTime <= event.startDate) {
                        // Allocate the task in the free spot
                        task.startTime = startTime;
                        task.endTime = taskEndTime;
                        startTime = taskEndTime;
                        break;
                    } else {
                        // Update the start time to the end time of the event
                        startTime = new Date(event.endDate);
                    }
                }
            
                // if (!freeSpotFound) {
                //     // Allocate the task in the remaining time on the current day
                //     let endTime = new Date(day.getTime() + 24 * 60 * 60 * 1000);
                //     if (taskEndTime <= endTime) {
                //     task.startTime = startTime;
                //     task.endTime = taskEndTime;
                //     startTime = taskEndTime;
                //     }
                // }
            }
        } 
  
    }
}