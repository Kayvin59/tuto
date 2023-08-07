// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract TaskContract {
    event AddTask(address recipient, uint TaskId);
    event DeleteTask(uint TaskId, bool isDeleted);

  struct Task {
    uint id;
    string content;
    bool isDeleted;
  }

  Task[] private tasks;
  mapping(uint256 => address) public taskToOwner;

  function addTask(string memory content, bool isDeleted) external {
    uint taskId = tasks.length;
    tasks.push(Task(taskId, content, isDeleted));
    taskToOwner[taskId] = msg.sender;
    emit AddTask(msg.sender, taskId);
  }

    // Get tasks that are mine
  function getMyTasks() external view returns (Task[] memory) {
      Task[] memory temporary = new Task[](tasks.length); // Array no longer than our tasks
      uint counter = 0;

      for(uint i = 0; i < tasks.length; i++) {
        // if(taskToOwner[tasks[i].id] == msg.sender)
        if(taskToOwner[i] == msg.sender && tasks[i].isDeleted == false) {
          temporary[counter] = tasks[i];
          counter++;
        }
      }
      Task[] memory result = new Task[](counter);
      for(uint i = 0; i < counter; i++) {
        result[i] = temporary[i];
      }
      return result;
  }

  function deleteTask(uint taskId, bool isDeleted) external {
      if(taskToOwner[taskId] == msg.sender) {
        tasks[taskId].isDeleted = isDeleted;
        emit DeleteTask(taskId, isDeleted);
      }
  }
}