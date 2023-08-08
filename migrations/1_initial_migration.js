const TasksList = artifacts.require('../contracts/TasksList.sol');

module.exports = function (deployer) {
  deployer.deploy(TasksList)
}
