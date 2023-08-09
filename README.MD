# Bubble Protocol Tuto 

Create a Bubble that will contain a private area for storing to-do list

# Bubble Protocol

Bubble Protocol provides access-controlled off-chain storage for Web3 applications and allows blockchains to govern private data. It adds Web3 capabilities to any storage system, whether a public relay server, decentralized storage network, home server, or private company infrastructure.

Bubble Protocol is blockchain agnostic and is designed to be highly adaptable, providing Web3 developers with an easy to use general purpose global data layer for data tokenisation, cross-device DApp storage, decentralised identity solutions, web3 privacy compliance solutions, paywalled content, NFT content, and much more.

Let’s see how this applies with a to-do list.

# Setup

- Truffle-box

# Contract

```
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./AccessControlledStorage.sol";
import "./AccessControlBits.sol";


contract TasksList {

  address owner = msg.sender;
  bool terminated = false;

  event AddTask(address recipient, uint TaskId);
  event DeleteTask(uint TaskId, bool isDeleted);

  struct Task {
    uint id;
    string content;
    bool isDeleted;
  }

  Task[] private tasks;
  mapping(uint256 => address) public taskToOwner;

  // override issue !!!
  function getAccessPermissions( address user, uint256 contentId ) external view returns (uint256) {

        /**
         * If the bubble has been terminated, the off-chain storage service will delete the bubble and 
         * all its contents.
         */
        if (terminated) return BUBBLE_TERMINATED_BIT;

        /**
         * File 0 is a special file that represents the root of the bubble. Only users with write permission 
         * to file 0 can construct the bubble on an off-chain storage service.
         */
        else if (contentId == 0 && user != owner) return NO_PERMISSIONS;

        /**
         * All files within the bubble are public.  Anyone can read, write and append.
         */
        else return READ_BIT | WRITE_BIT | APPEND_BIT;
  }

    // Owner can terminate the bubble forcing the off-chain storage service to delete the bubble and its contents
    function terminate() external {
        require(msg.sender == owner, "permission denied");
        terminated = true;
    }

  function addTask(string memory content, bool isDeleted) external {
    uint taskId = tasks.length;
    tasks.push(Task(taskId, content, isDeleted));
    taskToOwner[taskId] = msg.sender;
    emit AddTask(msg.sender, taskId);
  }

  function getMyTasks() external view returns (Task[] memory) {
      Task[] memory temporary = new Task[](tasks.length); // Array no longer than our tasks
      uint counter = 0;

      for(uint i = 0; i < tasks.length; i++) {
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
```