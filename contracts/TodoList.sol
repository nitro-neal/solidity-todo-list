pragma solidity ^0.5.0;

contract TodoList {

    struct Task {
        uint id;
        string content;
        bool completed;
    }

    uint public taskCount = 0;
    mapping(uint => Task) public tasks;

    event TaskCreated(uint id, string content, bool completed);
    event ToggleCompleted(uint id, bool completed);

    constructor() public {
        createTask("neatro task lol");
    }

    function createTask(string memory _content) public {
        taskCount ++;
        tasks[taskCount] = Task(taskCount, _content, false);
        emit TaskCreated(taskCount, _content, false);
    }

    function toggleCompleted(uint _id) public {
        Task memory _task = tasks[_id];
        _task.completed = !_task.completed;
        tasks[_id] = _task;
        emit ToggleCompleted(_id, _task.completed);
    }
}